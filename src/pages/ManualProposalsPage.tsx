// src/pages/ManualProposalsPage.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import usePlanLimits from "@/hooks/usePlanLimits";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

const ManualProposalsPage = () => {
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get("id");
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const { profile, planDetails, isLoading: planLoading, canCreate, incrementUsage } = usePlanLimits(userId);

  const [companyName, setCompanyName] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [companyCnpj, setCompanyCnpj] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientNumber, setClientNumber] = useState("");
  const [clientLocation, setClientLocation] = useState("");

  const [proposalTitle, setProposalTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [observations, setObservations] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", quantity: 1, price: 0 }]);

  const proposalRef = useRef<HTMLDivElement | null>(null);

  const addLineItem = () => setLineItems([...lineItems, { description: "", quantity: 1, price: 0 }]);
  const removeLineItem = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));
  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    setLineItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const calculateTotal = useMemo(
    () => lineItems.reduce((total, item) => total + item.quantity * item.price, 0),
    [lineItems]
  );

  const resetForm = () => {
    setCompanyName("");
    setCompanyNumber("");
    setCompanyCnpj("");
    setCompanyEmail("");
    setClientName("");
    setClientNumber("");
    setClientLocation("");
    setProposalTitle("");
    setLineItems([{ description: "", quantity: 1, price: 0 }]);
    setDeadline("");
    setObservations("");
    setPaymentTerms("");
  };

  const handleSave = async () => {
    if (!session) {
      toast.error("Você precisa estar logado para salvar propostas.");
      return;
    }

    // checar limite com o hook
    if (!canCreate("manual")) {
      const limit = planDetails.manualLimit === Infinity ? "Ilimitado" : planDetails.manualLimit;
      toast.error(`Você atingiu o limite de ${limit} orçamentos manuais do seu plano.`);
      return;
    }

    const newProposal = {
      user_id: session.user.id,
      company_name: companyName,
      company_number: companyNumber ? parseFloat(companyNumber) : null,
      company_cnpj: companyCnpj,
      company_email: companyEmail,
      client_name: clientName,
      client_number: clientNumber ? parseFloat(clientNumber) : null,
      client_location: clientLocation,
      title: proposalTitle,
      line_items: JSON.stringify(lineItems),
      deadline,
      observations,
      payment_terms: paymentTerms,
      total: calculateTotal,
    };

    const { error } = await supabase.from("proposals").insert([newProposal]);

    if (error) {
      toast.error("Erro ao salvar o orçamento.");
      console.error("Supabase error:", error);
      return;
    }

    try {
      // incrementa o contador no perfil
      await incrementUsage("manual");
    } catch (incErr) {
      // se falhar aqui, já salvou a proposta — notificar e logar
      console.error("Erro ao incrementar contagem:", incErr);
      toast.error("Orçamento salvo, mas houve erro ao atualizar contagem do plano.");
      resetForm();
      return;
    }

    toast.success("Orçamento salvo com sucesso!");
    resetForm();
  };

  const handleDownloadPdf = () => {
    if (proposalRef.current) {
      toast.info("Preparando download do PDF...");
      html2canvas(proposalRef.current, { scale: 2, backgroundColor: "#ffffff" }).then((canvas) => {
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
    <>
      <Header />
      <div className="min-h-screen bg-background p-8 md:p-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <CardDescription>Ajuste os dados da sua empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
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
                  <CardDescription>Ajuste os dados do cliente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="clientName">Nome do Cliente</Label>
                    <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} />
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
              
              <div className="flex justify-end gap-2">
                  <Button onClick={handleSave} variant="secondary">
                      <Save className="h-4 w-4 mr-2" /> Salvar Rascunho
                  </Button>
                  <Button onClick={handleDownloadPdf}>
                      <Download className="h-4 w-4 mr-2" /> Baixar PDF
                  </Button>
              </div>
            </div>

            <Card 
              ref={proposalRef}
              className={cn(
              "p-8 sticky top-12 self-start bg-white shadow-xl w-full max-w-[794px] lg:h-[1123px] overflow-auto"
            )}>
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
                <h3 className="text-xl font-semibold mb-4">
                  {proposalTitle || "Título do Orçamento"}
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
                    <p className="text-lg font-semibold">Total: R$ {calculateTotal.toFixed(2)}</p>
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
    </>
  );
};

export default ManualProposalsPage;