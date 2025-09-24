// src/pages/AIGenerationPage.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import usePlanLimits from "@/hooks/usePlanLimits";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Plus, Save, Trash2, Wand2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

const templates: Template[] = [
  {
    id: 'default',
    name: 'Padrão',
    primaryColor: '#6366f1',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#f3f4f6'
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#e5e7eb'
  },
  {
    id: 'dark',
    name: 'Dark',
    primaryColor: '#60a5fa',
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    accentColor: '#374151'
  },
  {
    id: 'elegant',
    name: 'Elegante',
    primaryColor: '#059669',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#f0fdf4'
  }
];

const AIGenerationPage = () => {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const { profile, planDetails, canCreate, incrementUsage } = usePlanLimits(userId);

  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiStyle, setAiStyle] = useState("profissional");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [customColors, setCustomColors] = useState({
    primary: '#6366f1',
    background: '#ffffff',
    text: '#000000',
    accent: '#f3f4f6'
  });

  const [companyName, setCompanyName] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [companyCnpj, setCompanyCnpj] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientNumber, setClientNumber] = useState("");
  const [clientLocation, setClientLocation] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [lineItems, setLineItems] = useState([{ description: "", quantity: 1, price: 0 }]);
  const [deadline, setDeadline] = useState("");
  const [observations, setObservations] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");

  const proposalRef = useRef<HTMLDivElement | null>(null);

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];
  const activeColors = selectedTemplate === 'custom' ? customColors : {
    primary: currentTemplate.primaryColor,
    background: currentTemplate.backgroundColor,
    text: currentTemplate.textColor,
    accent: currentTemplate.accentColor
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsSaved(false);
    if (templateId !== 'custom') {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setCustomColors({
          primary: template.primaryColor,
          background: template.backgroundColor,
          text: template.textColor,
          accent: template.accentColor
        });
      }
    }
  };

  useEffect(() => {
    // profile já é carregado dentro do hook usePlanLimits
  }, [profile]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, price: 0 }]);
    setIsSaved(false);
  };
  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
    setIsSaved(false);
  };
  const handleLineItemChange = (index: number, field: string, value: any) => {
    setLineItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
    setIsSaved(false);
  };

  const calculateTotal = useMemo(
    () => lineItems.reduce((total, item) => total + item.quantity * item.price, 0),
    [lineItems]
  );

  const handleGenerate = async () => {
    if (!session) {
      toast.error("Você precisa estar logado para usar a IA.");
      return;
    }

    // Verifica limite antes de chamar a API de geração
    if (!canCreate("ai")) {
      const limit = planDetails.aiLimit === Infinity ? "Ilimitado" : planDetails.aiLimit;
      toast.error(`Você atingiu o limite de ${limit} orçamentos com IA do seu plano.`);
      return;
    }

    setIsLoading(true);
    setIsEditing(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-proposal', {
        body: { 
          prompt, 
          style: aiStyle,
          companyData: {
            name: companyName,
            number: companyNumber,
            cnpj: companyCnpj,
            email: companyEmail
          },
          clientData: {
            name: clientName,
            number: clientNumber,
            location: clientLocation
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao chamar função de geração');
      }
      setCompanyName(data.companyName || "");
      setCompanyNumber(data.companyNumber || "");
      setCompanyCnpj(data.companyCnpj || "");
      setCompanyEmail(data.companyEmail || "");
      setClientName(data.clientName || "");
      setClientNumber(data.clientNumber || "");
      setClientLocation(data.clientLocation || "");
      setProposalTitle(data.title || "");
      setLineItems(data.lineItems || [{ description: "", quantity: 1, price: 0 }]);
      setDeadline(data.deadline || "");
      setObservations(data.observations || "");
      setPaymentTerms(data.paymentTerms || "");

      // incrementa o contador de IA — contando no ato da geração
      try {
        await incrementUsage("ai");
      } catch (incErr) {
        console.error("Erro ao incrementar uso de IA:", incErr);
        toast.error("Orçamento gerado, mas não foi possível atualizar uso do plano.");
      }

      setIsEditing(true);
      setIsSaved(false);
      toast.success("Orçamento gerado! Agora você pode editar os detalhes.");
    } catch (error) {
      toast.error("Erro ao gerar orçamento com IA.");
      console.error("API error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      toast.error("Você precisa estar logado para salvar propostas.");
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
      creation_type: 'ai',
    };

    const { error } = await supabase.from("proposals").insert([newProposal]);

    if (error) {
      toast.error("Erro ao salvar o orçamento.");
      console.error("Supabase error:", error);
    } else {
      setIsSaved(true);
      toast.success("Orçamento salvo com sucesso!");
    }
  };

  const handleDownloadPdf = () => {
    if (!isSaved) {
      toast.error("Você precisa salvar o orçamento antes de fazer o download.");
      return;
    }
    
    if (proposalRef.current) {
      toast.info("Preparando download do PDF...");
      const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];
      const bgColor = selectedTemplate === 'custom' ? customColors.background : currentTemplate.backgroundColor;
      
      const element = proposalRef.current;

      html2canvas(element, { 
        scale: 2, 
        backgroundColor: bgColor,
        useCORS: true,
        allowTaint: true,
        // Forçar renderização com uma largura fixa para garantir a qualidade
        width: 1000,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calcular a proporção para caber na página A4 sem distorcer
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        // Adicionar a imagem no PDF
        pdf.addImage(imgData, "PNG", 0, 0, finalWidth, finalHeight);
        
        pdf.save(`${proposalTitle || "orcamento"}.pdf`);
        toast.success("PDF baixado com sucesso!");
      }).catch((error) => {
        console.error("Erro ao gerar PDF:", error);
        toast.error("Erro ao gerar PDF. Tente novamente.");
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
      <Header />
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 md:mt-8">
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Geração</CardTitle>
                <CardDescription>
                  Preencha os dados e deixe a IA criar um orçamento para você.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyNumber">Telefone da Empresa</Label>
                  <Input id="companyNumber" value={companyNumber} onChange={(e) => setCompanyNumber(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyCnpj">CNPJ</Label>
                  <Input id="companyCnpj" value={companyCnpj} onChange={(e) => setCompanyCnpj(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyEmail">Email da Empresa</Label>
                  <Input id="companyEmail" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientName">Nome do Cliente</Label>
                  <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientNumber">Telefone do Cliente</Label>
                  <Input id="clientNumber" value={clientNumber} onChange={(e) => setClientNumber(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientLocation">Localização do Cliente</Label>
                  <Input id="clientLocation" value={clientLocation} onChange={(e) => setClientLocation(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição do Serviço</Label>
                  <Textarea
                    id="description"
                    placeholder="Ex: Criação de um website para uma loja de roupas com e-commerce, sistema de pagamentos e painel de administração."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                  {isLoading ? "Gerando..." : <><Wand2 className="h-4 w-4 mr-2" /> Gerar com IA</>}
                </Button>
              </CardContent>
            </Card>

            {isEditing && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do Orçamento Gerado</CardTitle>
                    <CardDescription>
                      Revise e edite o orçamento antes de salvar ou baixar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="proposalTitle">Título</Label>
                      <Input id="proposalTitle" value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} />
                    </div>
                    <div className="space-y-4">
                      <Label>Itens</Label>
                      {lineItems.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                          <div className="flex-1 w-full">
                            <Label className="sr-only">Descrição</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                              placeholder="Descrição do item"
                            />
                          </div>
                          <div className="w-full sm:w-20">
                            <Label className="sr-only">Qtd.</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleLineItemChange(index, "quantity", Number(e.target.value))}
                              min={1}
                              placeholder="Qtd"
                            />
                          </div>
                          <div className="w-full sm:w-28">
                            <Label className="sr-only">Preço Unit.</Label>
                            <Input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleLineItemChange(index, "price", Number(e.target.value))}
                              min={0}
                              placeholder="Preço"
                            />
                          </div>
                          {lineItems.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => removeLineItem(index)} className="shrink-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={addLineItem}>
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Item
                      </Button>
                    </div>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Personalização</CardTitle>
                    <CardDescription>Escolha o template e personalize as cores do orçamento.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="template">Template</Label>
                      <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedTemplate === 'custom' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="primaryColor">Cor Principal</Label>
                          <div className="flex gap-2">
                            <Input
                              id="primaryColor"
                              type="color"
                              value={customColors.primary}
                              onChange={(e) => { setCustomColors({...customColors, primary: e.target.value}); setIsSaved(false); }}
                              className="w-16 h-10 p-1 rounded"
                            />
                            <Input
                              value={customColors.primary}
                              onChange={(e) => { setCustomColors({...customColors, primary: e.target.value}); setIsSaved(false); }}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                          <div className="flex gap-2">
                             <Input
                               id="backgroundColor"
                               type="color"
                               value={customColors.background}
                               onChange={(e) => { setCustomColors({...customColors, background: e.target.value}); setIsSaved(false); }}
                               className="w-16 h-10 p-1 rounded"
                             />
                            <Input
                              value={customColors.background}
                              onChange={(e) => { setCustomColors({...customColors, background: e.target.value}); setIsSaved(false); }}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="textColor">Cor do Texto</Label>
                          <div className="flex gap-2">
                             <Input
                               id="textColor"
                               type="color"
                               value={customColors.text}
                               onChange={(e) => { setCustomColors({...customColors, text: e.target.value}); setIsSaved(false); }}
                               className="w-16 h-10 p-1 rounded"
                             />
                            <Input
                              value={customColors.text}
                              onChange={(e) => { setCustomColors({...customColors, text: e.target.value}); setIsSaved(false); }}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="accentColor">Cor de Destaque</Label>
                          <div className="flex gap-2">
                             <Input
                               id="accentColor"
                               type="color"
                               value={customColors.accent}
                               onChange={(e) => { setCustomColors({...customColors, accent: e.target.value}); setIsSaved(false); }}
                               className="w-16 h-10 p-1 rounded"
                             />
                            <Input
                              value={customColors.accent}
                              onChange={(e) => { setCustomColors({...customColors, accent: e.target.value}); setIsSaved(false); }}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button onClick={handleSave} variant="secondary" className="w-full sm:w-auto">
                      <Save className="h-4 w-4 mr-2" /> Salvar Rascunho
                  </Button>
                  <Button onClick={handleDownloadPdf} disabled={!isSaved} className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" /> Baixar PDF
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <Card 
              ref={proposalRef}
              className={cn(
                "p-8 sticky top-4 self-start shadow-xl w-full max-w-[794px] lg:h-[1123px] overflow-auto",
                !proposalTitle && "hidden lg:block"
              )}
              style={{ 
                backgroundColor: activeColors.background,
                color: activeColors.text
              }}
            >
              <CardHeader className="p-0 mb-6 pb-4" style={{ borderBottomColor: activeColors.primary, borderBottomWidth: '2px' }}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: activeColors.primary }}>ORÇAMENTO</h2>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="font-semibold text-sm md:text-base" style={{ color: activeColors.text }}>{companyName}</p>
                    {companyEmail && <p className="text-xs md:text-sm opacity-75">{companyEmail}</p>}
                    {companyNumber && <p className="text-xs md:text-sm opacity-75">{companyNumber}</p>}
                    {companyCnpj && <p className="text-xs md:text-sm opacity-75">{companyCnpj}</p>}
                  </div>
                </div>
                <Separator className="my-4" style={{ backgroundColor: activeColors.primary }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: activeColors.text }}>Para:</p>
                  <p className="font-medium" style={{ color: activeColors.text }}>{clientName}</p>
                  {clientNumber && <p className="text-xs md:text-sm opacity-75">{clientNumber}</p>}
                  {clientLocation && <p className="text-xs md:text-sm opacity-75">{clientLocation}</p>}
                </div>
              </CardHeader>
            <CardContent className="p-0">
              <h3 className="text-lg md:text-xl font-semibold mb-4" style={{ color: activeColors.text }}>
                {proposalTitle || "Título do Orçamento"}
              </h3>
              <div className="border rounded-md overflow-x-auto" style={{ borderColor: activeColors.primary }}>
                <div className="grid grid-cols-10 font-bold p-2 rounded-t-md min-w-[500px]" style={{ backgroundColor: activeColors.accent, color: activeColors.text }}>
                  <span className="col-span-4">Descrição</span>
                  <span className="col-span-2 text-center">Qtd.</span>
                  <span className="col-span-2 text-right">Preço Unit.</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-10 p-2 min-w-[500px]" style={{ borderTop: `1px solid ${activeColors.primary}`, color: activeColors.text }}>
                    <span className="col-span-4 text-xs md:text-sm">{item.description || "Item sem descrição"}</span>
                    <span className="col-span-2 text-center text-xs md:text-sm">{item.quantity}</span>
                    <span className="col-span-2 text-right text-xs md:text-sm">R$ {item.price.toFixed(2)}</span>
                    <span className="col-span-2 text-right text-xs md:text-sm">R$ {(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-lg md:text-xl font-semibold" style={{ color: activeColors.text }}>Total: R$ {calculateTotal.toFixed(2)}</p>
                </div>
              </div>
              {deadline && (
                <>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: activeColors.text }}>Prazo de Entrega:</p>
                    <p className="text-xs md:text-sm opacity-75">{deadline}</p>
                  </div>
                  <Separator className="my-4" style={{ backgroundColor: activeColors.primary }} />
                </>
              )}
              {paymentTerms && (
                <>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: activeColors.text }}>Condições de Pagamento:</p>
                    <p className="text-xs md:text-sm opacity-75">{paymentTerms}</p>
                  </div>
                  <Separator className="my-4" style={{ backgroundColor: activeColors.primary }} />
                </>
              )}
              {observations && (
                <div>
                  <p className="font-semibold mb-1" style={{ color: activeColors.text }}>Observações:</p>
                  <p className="text-xs md:text-sm opacity-75">{observations}</p>
                </div>
              )}
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerationPage;