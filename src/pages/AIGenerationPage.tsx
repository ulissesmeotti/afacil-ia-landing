// src/pages/AIGenerationPage.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Feather, Palette, Plus, Trash2, Wand2, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const AIGenerationPage = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiStyle, setAiStyle] = useState("profissional");
  const [isEditing, setIsEditing] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [lineItems, setLineItems] = useState([
    { description: "", quantity: 1, price: 0 },
  ]);
  const [deadline, setDeadline] = useState("");
  const [observations, setObservations] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");

  const handleGenerate = async () => {
    setIsLoading(true);
    setIsEditing(true); // Entra no modo de edição após a geração
    try {
      const response = await fetch("http://localhost:3001/generate-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, style: aiStyle }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Popula os campos do formulário com a resposta da IA
      setCompanyName(data.companyName || "");
      setClientName(data.clientName || "");
      setProposalTitle(data.title || "");
      setLineItems(data.lineItems || [{ description: "", quantity: 1, price: 0 }]);
      setDeadline(data.deadline || "");
      setObservations(data.observations || "");
      setPaymentTerms(data.paymentTerms || "");
    } catch (error) {
      console.error("Error generating proposal:", error);
      toast.error("Erro ao gerar o orçamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, price: 0 }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(newItems);
  };

  const calculateTotal = (items) => {
    return items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  };
  
  const handleDownloadPdf = () => {
    // Mesma função do componente ManualProposalsPage
    // A lógica de download em PDF pode ser reutilizada
  };

  return (
    <div className="min-h-screen bg-background p-8 md:p-12">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Geração de Orçamento com IA</h1>
          <Link to="/propostas">
            <Button variant="outline">Voltar para Opções</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário de Geração e Edição */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Descreva sua proposta</CardTitle>
                <CardDescription>
                  Forneça uma descrição detalhada e gere um rascunho com a IA.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="prompt">Detalhes do Projeto</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Ex: Orçamento para um e-commerce de roupas. Cliente 'Moda Chic', serviços de design, desenvolvimento e suporte."
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <Label>Estilo do Orçamento</Label>
                  <ToggleGroup
                    type="single"
                    value={aiStyle}
                    onValueChange={(value) => setAiStyle(value)}
                    className="mt-2"
                  >
                    <ToggleGroupItem value="profissional" aria-label="Profissional">
                      <Zap className="h-4 w-4 mr-2" /> Profissional
                    </ToggleGroupItem>
                    <ToggleGroupItem value="criativo" aria-label="Criativo">
                      <Palette className="h-4 w-4 mr-2" /> Criativo
                    </ToggleGroupItem>
                    <ToggleGroupItem value="conciso" aria-label="Conciso">
                      <Feather className="h-4 w-4 mr-2" /> Conciso
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <Button onClick={handleGenerate} disabled={!prompt || isLoading} className="w-full mt-6" variant="hero">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" /> Gerar Orçamento com IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {isEditing && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Empresa</CardTitle>
                    <CardDescription>Ajuste os dados da sua empresa e cliente.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="companyName">Nome da Empresa</Label>
                      <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="clientName">Nome do Cliente</Label>
                      <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do Orçamento</CardTitle>
                    <CardDescription>Edite o título e os itens da proposta.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="proposalTitle">Título</Label>
                      <Input id="proposalTitle" value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} />
                    </div>
                    <div className="space-y-4">
                      <Label>Itens</Label>
                      {lineItems.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label className="sr-only">Descrição</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                            />
                          </div>
                          <div className="w-24">
                            <Label className="sr-only">Qtd.</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleLineItemChange(index, "quantity", Number(e.target.value))}
                              min={1}
                            />
                          </div>
                          <div className="w-32">
                            <Label className="sr-only">Preço Unit.</Label>
                            <Input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleLineItemChange(index, "price", Number(e.target.value))}
                              min={0}
                            />
                          </div>
                          {lineItems.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => removeLineItem(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={addLineItem}>
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Item
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes Adicionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="deadline">Prazo de Entrega</Label>
                      <Input id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                      <Input id="paymentTerms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="observations">Observações</Label>
                      <Textarea id="observations" rows={4} value={observations} onChange={(e) => setObservations(e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Pré-visualização do Orçamento (Lado Direito) */}
          <Card className={cn(
            "p-8 sticky top-12 self-start bg-white shadow-xl w-full max-w-[794px] lg:h-[1123px] overflow-auto",
            { "opacity-50": isLoading }
          )}>
            <CardHeader className="p-0 mb-6 border-b-2 border-primary pb-4">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold text-primary">ORÇAMENTO</h2>
                <div className="text-right">
                  <p className="font-semibold">{companyName || "Nome da Sua Empresa"}</p>
                  <p className="text-sm text-muted-foreground">{"" || "Seu Email"}</p>
                  <p className="text-sm text-muted-foreground">{"" || "Seu Telefone"}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-semibold">Para:</p>
                <p className="font-medium">{clientName || "Nome do Cliente"}</p>
                <p className="text-sm text-muted-foreground">{"" || "Telefone do Cliente"}</p>
                <p className="text-sm text-muted-foreground">{"" || "Localização do Cliente"}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <h3 className="text-xl font-semibold mb-4">
                {proposalTitle || "Título do Orçamento Gerado"}
              </h3>
              <div className="border rounded-md">
                <div className="grid grid-cols-10 font-bold bg-muted p-2 rounded-t-md">
                  <span className="col-span-4">Descrição</span>
                  <span className="col-span-2 text-center">Qtd.</span>
                  <span className="col-span-2 text-right">Preço Unit.</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-10 p-2 border-t">
                    <span className="col-span-4">{item.description || "Item sem descrição"}</span>
                    <span className="col-span-2 text-center">{item.quantity}</span>
                    <span className="col-span-2 text-right">R$ {item.price.toFixed(2)}</span>
                    <span className="col-span-2 text-right">R$ {(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-semibold">Total: R$ {calculateTotal(lineItems || []).toFixed(2)}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="font-semibold mb-1">Prazo de Entrega:</p>
                <p className="text-sm text-muted-foreground">{deadline}</p>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="font-semibold mb-1">Condições de Pagamento:</p>
                <p className="text-sm text-muted-foreground">{paymentTerms}</p>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="font-semibold mb-1">Observações:</p>
                <p className="text-sm text-muted-foreground">{observations}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIGenerationPage;