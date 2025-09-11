import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/ui/header";
import { Mail, MessageSquare, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      // Salvar mensagem na base de dados
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          category: formData.category,
          subject: formData.subject,
          message: formData.message
        });

      if (error) {
        console.error('Error saving contact message:', error);
        toast({
          title: "Erro ao enviar",
          description: "Tente novamente ou entre em contato por email.",
          variant: "destructive",
        });
        return;
      }

      // Enviar email via EmailJS
      try {
        const { error: emailError } = await supabase.functions.invoke('send-contact-emailjs', {
          body: {
            name: formData.name,
            email: formData.email,
            category: formData.category,
            subject: formData.subject,
            message: formData.message
          }
        });

        if (emailError) {
          console.error('Error sending email via EmailJS:', emailError);
          // Não falha o processo se o email não for enviado
        }
      } catch (emailError) {
        console.error('Error calling EmailJS function:', emailError);
        // Não falha o processo se o email não for enviado
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

        <div className="grid md:grid-cols-3 gap-8">
          {/* Informações de Contato */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">Suporte geral</p>
                <a href="mailto:suporte@orcafacil.com.br" className="text-primary hover:underline font-medium">
                  suporte@orcafacil.com.br
                </a>
                <p className="text-muted-foreground mt-4 mb-2">Vendas</p>
                <a href="mailto:vendas@orcafacil.com.br" className="text-primary hover:underline font-medium">
                  vendas@orcafacil.com.br
                </a>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Telefone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">Suporte técnico</p>
                <p className="font-medium">(11) 9999-9999</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Segunda a Sexta, 9h às 18h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  São Paulo, SP<br />
                  Brasil
                </p>
              </CardContent>
            </Card>
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
    </div>
  );
};

export default ContactPage;