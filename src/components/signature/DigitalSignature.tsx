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
      
      // Buscar dados da proposta
      const { data: proposal, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error || !proposal) {
        throw new Error('Proposta não encontrada');
      }

      // Importar dinamicamente as bibliotecas para PDF
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Configurar fonte
      doc.setFont('helvetica');
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(30, 64, 175); // Cor primária
      doc.text(proposal.title, 20, 30);
      
      // Informações da empresa
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('DADOS DA EMPRESA:', 20, 50);
      doc.setFontSize(10);
      doc.text(`Nome: ${proposal.company_name}`, 20, 60);
      if (proposal.company_email) doc.text(`Email: ${proposal.company_email}`, 20, 70);
      if (proposal.company_cnpj) doc.text(`CNPJ: ${proposal.company_cnpj}`, 20, 80);
      
      // Informações do cliente
      doc.setFontSize(12);
      doc.text('DADOS DO CLIENTE:', 20, 100);
      doc.setFontSize(10);
      doc.text(`Nome: ${proposal.client_name}`, 20, 110);
      if (proposal.client_location) doc.text(`Localização: ${proposal.client_location}`, 20, 120);
      
      // Itens do orçamento
      if (proposal.line_items) {
        const lineItems = JSON.parse(proposal.line_items);
        doc.setFontSize(12);
        doc.text('ITENS DO ORÇAMENTO:', 20, 140);
        
        let yPos = 150;
        doc.setFontSize(10);
        doc.text('Descrição', 20, yPos);
        doc.text('Qtd', 100, yPos);
        doc.text('Valor Unit.', 130, yPos);
        doc.text('Total', 170, yPos);
        
        yPos += 10;
        lineItems.forEach((item: any) => {
          doc.text(item.description.substring(0, 30), 20, yPos);
          doc.text(item.quantity.toString(), 100, yPos);
          doc.text(`R$ ${item.price.toFixed(2)}`, 130, yPos);
          doc.text(`R$ ${(item.quantity * item.price).toFixed(2)}`, 170, yPos);
          yPos += 8;
        });
        
        // Total
        yPos += 5;
        doc.setFontSize(12);
        doc.text(`TOTAL GERAL: R$ ${proposal.total.toFixed(2)}`, 130, yPos);
      }
      
      // Termos e condições
      let termsYPos = 200;
      if (proposal.deadline || proposal.payment_terms || proposal.observations) {
        doc.setFontSize(12);
        doc.text('TERMOS E CONDIÇÕES:', 20, termsYPos);
        termsYPos += 10;
        doc.setFontSize(10);
        
        if (proposal.deadline) {
          doc.text(`Prazo de entrega: ${proposal.deadline}`, 20, termsYPos);
          termsYPos += 8;
        }
        if (proposal.payment_terms) {
          doc.text(`Condições de pagamento: ${proposal.payment_terms}`, 20, termsYPos);
          termsYPos += 8;
        }
        if (proposal.observations) {
          const splitText = doc.splitTextToSize(`Observações: ${proposal.observations}`, 170);
          doc.text(splitText, 20, termsYPos);
          termsYPos += splitText.length * 5;
        }
      }
      
      // Adicionar assinatura
      const signatureYPos = Math.max(termsYPos + 20, 240);
      doc.setFontSize(12);
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
        doc.addImage(imgData, 'PNG', 20, signatureYPos + 10, 100, 30);
        
        // Dados da assinatura
        doc.setFontSize(10);
        doc.text(`Assinado por: ${existingSignature.signer_name}`, 20, signatureYPos + 50);
        doc.text(`Email: ${existingSignature.signer_email}`, 20, signatureYPos + 60);
        doc.text(`Data: ${new Date(existingSignature.signed_at).toLocaleString('pt-BR')}`, 20, signatureYPos + 70);
        
        // Salvar PDF
        const fileName = `${proposal.title.replace(/[^a-zA-Z0-9]/g, '_')}_assinado.pdf`;
        doc.save(fileName);
        
        toast.success("PDF baixado com sucesso!");
        setIsLoading(false);
      };
      
      img.onerror = () => {
        // Fallback: PDF sem imagem da assinatura
        doc.setFontSize(10);
        doc.text(`Assinado por: ${existingSignature.signer_name}`, 20, signatureYPos + 20);
        doc.text(`Email: ${existingSignature.signer_email}`, 20, signatureYPos + 30);
        doc.text(`Data: ${new Date(existingSignature.signed_at).toLocaleString('pt-BR')}`, 20, signatureYPos + 40);
        
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