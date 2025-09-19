import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import { useState } from "react";

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Parte 1: Salvar mensagem na base de dados
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          category: formData.category,
          subject: formData.subject,
          message: formData.message
        });

      if (dbError) {
        console.error('Error saving contact message:', dbError);
        toast({
          title: "Erro ao enviar",
          description: "Não foi possível salvar a mensagem. Tente novamente.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Parte 2: Enviar email diretamente via EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
        to_email: "ulissesmeotti@gmail.com",
        reply_to: formData.email
      };

      const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'service_saas', // Use o service_id fornecido
          template_id: 'template_4303fes', // Use o template_id fornecido
          user_id: '_zmVVnlz9wGKRHCsx', // Use o public_key fornecido
          template_params: templateParams
        }),
      });

      if (!emailjsResponse.ok) {
        const errorData = await emailjsResponse.text();
        console.error("EmailJS API error:", emailjsResponse.status, errorData);
        throw new Error(`EmailJS API error: ${emailjsResponse.status} - ${errorData}`);
      }

      toast({
        title: "Mensagem enviada!",
        description: "Recebemos sua mensagem e responderemos em até 24 horas.",
      });

      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: ""
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou entre em contato por email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Entre em Contato</h1>
          <p className="text-muted-foreground text-lg">
            Estamos aqui para ajudar! Escolha a melhor forma de falar conosco.
          </p>
        </div>

          {/* Formulário de Contato */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Envie sua Mensagem</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo e responderemos o mais breve possível.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suporte">Suporte Técnico</SelectItem>
                        <SelectItem value="vendas">Vendas</SelectItem>
                        <SelectItem value="billing">Faturamento</SelectItem>
                        <SelectItem value="feature">Solicitação de Recurso</SelectItem>
                        <SelectItem value="bug">Reportar Bug</SelectItem>
                        <SelectItem value="partnership">Parcerias</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Resumo do seu contato"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Descreva detalhadamente sua dúvida ou solicitação..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Rápida */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Como cancelo minha assinatura?</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesse seu perfil e clique em "Gerenciar Assinatura" para cancelar a qualquer momento.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Posso exportar meus orçamentos?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sim! Você pode baixar todos os seus orçamentos em PDF a qualquer momento.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Há limite de orçamentos?</h4>
                    <p className="text-sm text-muted-foreground">
                      Depende do seu plano. Veja os detalhes na página de preços.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default ContactPage;