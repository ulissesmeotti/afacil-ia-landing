// src/pages/ManualProposalsPage.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, ListTodo, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ManualProposalsPage = () => {
  const [companyName, setCompanyName] = useState("Móveis Meotti");
  const [companyNumber, setCompanyNumber] = useState("45999071709");
  const [companyCnpj, setCompanyCnpj] = useState("17.434.123/0001-43");
  const [companyEmail, setCompanyEmail] = useState("meotti@gmail.com");

  const [clientName, setClientName] = useState("Darci Ecker");
  const [clientNumber, setClientNumber] = useState("45999765802");
  const [clientLocation, setClientLocation] = useState("Rua São Tocantins, Vila Nova, Toledo");

  const [proposalTitle, setProposalTitle] = useState("Orçamento de Portas");
  const [lineItems, setLineItems] = useState([
    { description: "Portas de Madeira", quantity: 10, price: 2600.00 },
    { description: "Kit de Ferragens", quantity: 10, price: 150.00 },
    { description: "Vistas de Madeira", quantity: 10, price: 160.00 },
  ]);

  const [deadline, setDeadline] = useState("15 dias úteis");
  const [observations, setObservations] = useState("Validade da proposta de 30 dias.");
  const [paymentTerms, setPaymentTerms] = useState("50% de entrada, 50% na conclusão.");

  const proposalRef = useRef(null);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, price: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const newItems = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(newItems);
  };

  const calculateTotal = useMemo(() => {
    return lineItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  }, [lineItems]);

  const handleSave = () => {
    const newProposal = {
      id: Date.now(),
      companyName,
      companyNumber,
      companyCnpj,
      companyEmail,
      clientName,
      clientNumber,
      clientLocation,
      proposalTitle,
      lineItems,
      deadline,
      observations,
      paymentTerms,
      total: calculateTotal,
      timestamp: new Date().toISOString(),
    };

    const savedProposals = JSON.parse(localStorage.getItem("propostas") || "[]");
    localStorage.setItem("propostas", JSON.stringify([...savedProposals, newProposal]));
    toast.success("Orçamento salvo com sucesso!");
  };

  const handleDownloadPdf = () => {
    if (proposalRef.current) {
      toast.info("Preparando download do PDF...");
      html2canvas(proposalRef.current, { scale: 2, backgroundColor: '#ffffff' }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;
        pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`${proposalTitle || "orcamento"}.pdf`);
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 md:p-12">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Criar Orçamento Manual</h1>
          <div className="flex gap-2">
            <Link to="/propostas/salvas">
              <Button variant="ghost">
                <ListTodo className="h-4 w-4 mr-2" /> Meus Orçamentos
              </Button>
            </Link>
            <Link to="/propostas">
              <Button variant="outline">Voltar para Opções</Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Sua Empresa</CardTitle>
                <CardDescription>Preencha os dados da sua empresa.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Nome da Sua Empresa</Label>
                  <Input id="companyName" placeholder="Ex: OrçaFacil Ltda" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyNumber">Seu Número</Label>
                    <Input id="companyNumber" placeholder="(XX) XXXXX-XXXX" value={companyNumber} onChange={(e) => setCompanyNumber(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyCnpj">Seu CNPJ</Label>
                    <Input id="companyCnpj" placeholder="XX.XXX.XXX/XXXX-XX" value={companyCnpj} onChange={(e) => setCompanyCnpj(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyEmail">Seu Email</Label>
                  <Input id="companyEmail" type="email" placeholder="contato@orcafacil.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
                <CardDescription>Preencha os dados do seu cliente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientName">Nome do Cliente</Label>
                  <Input id="clientName" placeholder="Ex: João Silva" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="clientNumber">Número do Cliente</Label>
                    <Input id="clientNumber" placeholder="(XX) XXXXX-XXXX" value={clientNumber} onChange={(e) => setClientNumber(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="clientLocation">Localização do Cliente</Label>
                    <Input id="clientLocation" placeholder="Ex: São Paulo, SP" value={clientLocation} onChange={(e) => setClientLocation(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Orçamento</CardTitle>
                <CardDescription>Adicione o título e os itens da proposta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="proposalTitle">Título do Orçamento</Label>
                  <Input id="proposalTitle" placeholder="Orçamento para Projeto X" value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} />
                </div>
                <div className="space-y-4">
                  <Label>Itens</Label>
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Label className="sr-only">Descrição</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                          placeholder="Ex: Portas de Madeira"
                        />
                      </div>
                      <div className="w-24 space-y-2">
                        <Label className="sr-only">Qtd.</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, "quantity", Number(e.target.value))}
                          min={1}
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label className="sr-only">Preço Unit.</Label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleLineItemChange(index, "price", Number(e.target.value))}
                          min={0}
                        />
                      </div>
                      {lineItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(index)}
                          className="self-end"
                        >
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

            {/* Novos campos para prazo, observações e condições de pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes Adicionais</CardTitle>
                <CardDescription>Insira informações complementares.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Prazo de Entrega</Label>
                  <Input id="deadline" placeholder="Ex: 15 dias úteis" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                  <Input id="paymentTerms" placeholder="Ex: 50% de entrada, 50% na conclusão" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea id="observations" rows={4} placeholder="Ex: Os valores não incluem frete." value={observations} onChange={(e) => setObservations(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button onClick={handleSave} variant="secondary">
                <Save className="h-4 w-4 mr-2" /> Salvar Rascunho
              </Button>
              <Button onClick={handleDownloadPdf}>
                <Download className="h-4 w-4 mr-2" /> Baixar PDF
              </Button>
            </div>
          </div>

          {/* Pré-visualização do Orçamento (Lado Direito) */}
          <Card
            ref={proposalRef}
            className="p-8 sticky top-12 self-start bg-white shadow-xl w-full max-w-[794px] lg:h-[1123px] overflow-auto"
          >
            <CardHeader className="p-0 mb-6 border-b-2 border-primary pb-4">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold text-primary">ORÇAMENTO</h2>
                <div className="text-right">
                  <p className="font-semibold">{companyName || "Nome da Sua Empresa"}</p>
                  <p className="text-sm text-muted-foreground">{companyEmail || "Seu Email"}</p>
                  <p className="text-sm text-muted-foreground">{companyNumber || "Seu Telefone"}</p>
                  <p className="text-sm text-muted-foreground">{companyCnpj || "Seu CNPJ"}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-semibold">Para:</p>
                <p className="font-medium">{clientName || "Nome do Cliente"}</p>
                <p className="text-sm text-muted-foreground">{clientNumber || "Telefone do Cliente"}</p>
                <p className="text-sm text-muted-foreground">{clientLocation || "Localização do Cliente"}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <h3 className="text-xl font-semibold mb-4">{proposalTitle || "Título do Orçamento"}</h3>
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
                  <p className="text-lg font-semibold">Total: R$ {calculateTotal.toFixed(2)}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-semibold">Prazo de Entrega:</p>
                  <p>{deadline}</p>
                </div>
                <Separator className="my-4" />

                <div>
                  <p className="font-semibold">Condições de Pagamento:</p>
                  <p>{paymentTerms}</p>
                </div>
                <Separator className="my-4" />

                <div>
                  <p className="font-semibold">Observações:</p>
                  <p>{observations}</p>
                </div>
                <Separator className="my-4" />

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManualProposalsPage;