import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PenTool, Download, Share, Check, X, RotateCcw } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/auth-provider";

interface DigitalSignatureProps {
  proposalId: string;
  proposalTitle: string;
  clientName: string;
  onSignatureComplete?: (signatureData: string) => void;
}

interface SignatureData {
  id: string;
  proposal_id: string;
  signature_data: string;
  signer_name: string;
  signer_email: string;
  signed_at: string;
}

interface TemplateColors {
  primary: string;
  background: string;
  text: string;
  accent: string;
}

export const DigitalSignature = ({ 
  proposalId, 
  proposalTitle, 
  clientName,
  onSignatureComplete 
}: DigitalSignatureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [signerName, setSignerName] = useState(clientName || "");
  const [signerEmail, setSignerEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [existingSignature, setExistingSignature] = useState<SignatureData | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    checkExistingSignature();
  }, [proposalId]);

  const checkExistingSignature = async () => {
    const { data, error } = await supabase
      .from('digital_signatures')
      .select('*')
      .eq('proposal_id', proposalId)
      .maybeSingle();

    if (data && !error) {
      setExistingSignature(data);
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas para alta qualidade
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Configurar estilo da linha
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(initCanvas, 100);
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    if (!signerName.trim() || !signerEmail.trim()) {
      toast.error("Por favor, preencha nome e email");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Verificar se há algo desenhado no canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let hasDrawing = false;

    // Verificar se há pixels não brancos (considerando fundo branco)
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
        hasDrawing = true;
        break;
      }
    }

    if (!hasDrawing) {
      toast.error("Por favor, faça sua assinatura no campo acima");
      return;
    }

    setIsLoading(true);

    try {
      const signatureDataURL = canvas.toDataURL('image/png');

      const { data, error } = await supabase
        .from('digital_signatures')
        .insert({
          proposal_id: proposalId,
          signature_data: signatureDataURL,
          signer_name: signerName,
          signer_email: signerEmail,
          signed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Assinatura salva com sucesso!");
      setExistingSignature(data);
      setIsOpen(false);
      
      if (onSignatureComplete) {
        onSignatureComplete(signatureDataURL);
      }
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      toast.error("Erro ao salvar assinatura");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSignedProposal = async () => {
    if (!existingSignature) return;

    try {
      setIsLoading(true);
      
      // Buscar dados da proposta incluindo template
      const { data: proposal, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error || !proposal) {
        throw new Error('Proposta não encontrada');
      }

      // Configurar cores do template
      const templates = [
        { id: 'default', primaryColor: '#6366f1', backgroundColor: '#ffffff', textColor: '#000000', accentColor: '#f3f4f6' },
        { id: 'minimal', primaryColor: '#000000', backgroundColor: '#ffffff', textColor: '#000000', accentColor: '#e5e7eb' },
        { id: 'dark', primaryColor: '#60a5fa', backgroundColor: '#1f2937', textColor: '#ffffff', accentColor: '#374151' },
        { id: 'elegant', primaryColor: '#059669', backgroundColor: '#ffffff', textColor: '#000000', accentColor: '#f0fdf4' }
      ];

      const currentTemplate = templates.find(t => t.id === proposal.template_id) || templates[0];
      
      let colors: TemplateColors;
      if (proposal.template_colors && typeof proposal.template_colors === 'object' && !Array.isArray(proposal.template_colors)) {
        const templateColors = proposal.template_colors as Record<string, any>;
        colors = {
          primary: templateColors.primary || currentTemplate.primaryColor,
          background: templateColors.background || currentTemplate.backgroundColor,
          text: templateColors.text || currentTemplate.textColor,
          accent: templateColors.accent || currentTemplate.accentColor
        };
      } else {
        colors = {
          primary: currentTemplate.primaryColor,
          background: currentTemplate.backgroundColor,
          text: currentTemplate.textColor,
          accent: currentTemplate.accentColor
        };
      }

      // Importar dinamicamente as bibliotecas para PDF
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Configurar fundo se não for branco
      if (colors.background !== '#ffffff' && colors.background !== '#FFFFFF') {
        doc.setFillColor(colors.background);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
      }
      
      // Converter cores hex para RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
      };

      const primaryRgb = hexToRgb(colors.primary);
      const textRgb = hexToRgb(colors.text);
      const accentRgb = hexToRgb(colors.accent);
      
      // Configurar fonte
      doc.setFont('helvetica');
      
      // Cabeçalho com cores do template
      doc.setFontSize(20);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('ORÇAMENTO', 20, 30);
      
      // Título da proposta
      doc.setFontSize(16);
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      doc.text(proposal.title, 20, 45);
      
      // Linha separadora
      doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.setLineWidth(1);
      doc.line(20, 50, 190, 50);
      
      // Informações da empresa
      doc.setFontSize(12);
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      doc.text('DADOS DA EMPRESA:', 20, 65);
      doc.setFontSize(10);
      doc.text(`Nome: ${proposal.company_name}`, 20, 75);
      if (proposal.company_email) doc.text(`Email: ${proposal.company_email}`, 20, 82);
      if (proposal.company_number) doc.text(`Telefone: ${proposal.company_number}`, 20, 89);
      if (proposal.company_cnpj) doc.text(`CNPJ: ${proposal.company_cnpj}`, 20, 96);
      
      // Informações do cliente
      doc.setFontSize(12);
      doc.text('DADOS DO CLIENTE:', 20, 110);
      doc.setFontSize(10);
      doc.text(`Nome: ${proposal.client_name}`, 20, 120);
      if (proposal.client_location) doc.text(`Localização: ${proposal.client_location}`, 20, 127);
      if (proposal.client_number) doc.text(`Telefone: ${proposal.client_number}`, 20, 134);
      
      // Itens do orçamento
      if (proposal.line_items) {
        const lineItems = JSON.parse(proposal.line_items);
        doc.setFontSize(12);
        doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
        doc.text('ITENS DO ORÇAMENTO:', 20, 150);
        
        // Cabeçalho da tabela com fundo colorido
        doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
        doc.rect(20, 155, 170, 8, 'F');
        
        let yPos = 160;
        doc.setFontSize(10);
        doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
        doc.text('Descrição', 22, yPos);
        doc.text('Qtd', 120, yPos);
        doc.text('Valor Unit.', 140, yPos);
        doc.text('Total', 170, yPos);
        
        yPos += 8;
        lineItems.forEach((item: any) => {
          if (yPos > 250) { // Nova página se necessário
            doc.addPage();
            if (colors.background !== '#ffffff') {
              doc.setFillColor(colors.background);
              doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
            }
            yPos = 30;
          }
          
          doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
          doc.text(item.description.substring(0, 40), 22, yPos);
          doc.text(item.quantity.toString(), 120, yPos);
          doc.text(`R$ ${item.price.toFixed(2)}`, 140, yPos);
          doc.text(`R$ ${(item.quantity * item.price).toFixed(2)}`, 170, yPos);
          yPos += 6;
        });
        
        // Total com destaque
        yPos += 5;
        doc.setFontSize(12);
        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.text(`TOTAL GERAL: R$ ${proposal.total.toFixed(2)}`, 140, yPos);
      }
      
      // Termos e condições
      let termsYPos = 210;
      if (proposal.deadline || proposal.payment_terms || proposal.observations) {
        doc.setFontSize(12);
        doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
        doc.text('TERMOS E CONDIÇÕES:', 20, termsYPos);
        termsYPos += 10;
        doc.setFontSize(10);
        
        if (proposal.deadline) {
          doc.text(`Prazo de entrega: ${proposal.deadline}`, 20, termsYPos);
          termsYPos += 7;
        }
        if (proposal.payment_terms) {
          doc.text(`Condições de pagamento: ${proposal.payment_terms}`, 20, termsYPos);
          termsYPos += 7;
        }
        if (proposal.observations) {
          const splitText = doc.splitTextToSize(`Observações: ${proposal.observations}`, 170);
          doc.text(splitText, 20, termsYPos);
          termsYPos += splitText.length * 5;
        }
      }
      
      // Adicionar assinatura
      const signatureYPos = Math.max(termsYPos + 15, 240);
      doc.setFontSize(12);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('ASSINATURA DIGITAL:', 20, signatureYPos);
      
      // Converter assinatura para imagem e adicionar ao PDF
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 20, signatureYPos + 5, 80, 25);
        
        // Dados da assinatura
        doc.setFontSize(10);
        doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
        doc.text(`Assinado por: ${existingSignature.signer_name}`, 20, signatureYPos + 35);
        doc.text(`Email: ${existingSignature.signer_email}`, 20, signatureYPos + 42);
        doc.text(`Data: ${new Date(existingSignature.signed_at).toLocaleString('pt-BR')}`, 20, signatureYPos + 49);
        
        // Salvar PDF
        const fileName = `${proposal.title.replace(/[^a-zA-Z0-9]/g, '_')}_assinado.pdf`;
        doc.save(fileName);
        
        toast.success("PDF baixado com sucesso!");
        setIsLoading(false);
      };
      
      img.onerror = () => {
        // Fallback: PDF sem imagem da assinatura
        doc.setFontSize(10);
        doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
        doc.text(`Assinado por: ${existingSignature.signer_name}`, 20, signatureYPos + 15);
        doc.text(`Email: ${existingSignature.signer_email}`, 20, signatureYPos + 22);
        doc.text(`Data: ${new Date(existingSignature.signed_at).toLocaleString('pt-BR')}`, 20, signatureYPos + 29);
        
        const fileName = `${proposal.title.replace(/[^a-zA-Z0-9]/g, '_')}_assinado.pdf`;
        doc.save(fileName);
        
        toast.success("PDF baixado com sucesso!");
        setIsLoading(false);
      };
      
      img.src = existingSignature.signature_data;
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao baixar documento");
      setIsLoading(false);
    }
  };

  const shareSignatureLink = () => {
    const shareUrl = `${window.location.origin}/signature/${proposalId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Assinatura Digital - ${proposalTitle}`,
        text: 'Clique para assinar digitalmente',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado para o clipboard!");
    }
  };

  if (existingSignature) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Documento Assinado</CardTitle>
          </div>
          <CardDescription>
            Assinado por {existingSignature.signer_name} em{" "}
            {new Date(existingSignature.signed_at).toLocaleString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <img
              src={existingSignature.signature_data}
              alt="Assinatura Digital"
              className="max-w-full h-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadSignedProposal} variant="default" disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? "Gerando PDF..." : "Baixar PDF Assinado"}
            </Button>
            <Button onClick={shareSignatureLink} variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Assinatura Digital
        </CardTitle>
        <CardDescription>
          Transforme este orçamento em um contrato assinado digitalmente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <PenTool className="h-4 w-4 mr-2" />
                  Assinar Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assinatura Digital</DialogTitle>
                  <DialogDescription>
                    {proposalTitle} - Proposta para {clientName}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signerName">Nome Completo *</Label>
                      <Input
                        id="signerName"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        placeholder="Digite seu nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signerEmail">Email *</Label>
                      <Input
                        id="signerEmail"
                        type="email"
                        value={signerEmail}
                        onChange={(e) => setSignerEmail(e.target.value)}
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Faça sua assinatura abaixo:</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCanvas}
                        className="text-muted-foreground"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Limpar
                      </Button>
                    </div>
                    <div className="border-2 border-dashed border-muted rounded-lg">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        className="w-full h-48 cursor-crosshair rounded-lg bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Use o mouse para desenhar sua assinatura acima
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={saveSignature} disabled={isLoading}>
                      <Check className="h-4 w-4 mr-2" />
                      {isLoading ? "Salvando..." : "Confirmar Assinatura"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={shareSignatureLink}>
              <Share className="h-4 w-4 mr-2" />
              Enviar para Assinar
            </Button>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Como funciona:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</div>
                <span>Cliente acessa o link de assinatura</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</div>
                <span>Preenche dados e faz assinatura digital</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</div>
                <span>Você recebe notificação automática</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};