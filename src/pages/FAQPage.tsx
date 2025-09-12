import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { HelpCircle, Mail } from "lucide-react";

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Central de <span className="text-primary">Ajuda</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para as perguntas mais frequentes sobre nossa plataforma de orçamentos.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Como funciona a geração com IA?
                </AccordionTrigger>
                <AccordionContent>
                  Nossa IA analisa as informações do seu projeto e gera automaticamente um orçamento detalhado e profissional, incluindo descrições dos serviços e valores sugeridos. O sistema utiliza algoritmos avançados para entender o contexto do seu negócio e criar propostas personalizadas.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Posso editar o orçamento depois de criado?
                </AccordionTrigger>
                <AccordionContent>
                  Sim! Você pode editar qualquer informação do orçamento antes de salvá-lo ou baixá-lo em PDF. Tudo é personalizável - desde os itens e valores até as descrições e informações da empresa.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Os orçamentos ficam salvos na nuvem?
                </AccordionTrigger>
                <AccordionContent>
                  Sim, todos os seus orçamentos ficam salvos na sua conta e podem ser acessados de qualquer dispositivo. Você pode visualizar, editar e baixar seus orçamentos salvos a qualquer momento através da seção "Meus Orçamentos".
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Qual a diferença entre os planos?
                </AccordionTrigger>
                <AccordionContent>
                  O plano Gratuito permite criação manual de orçamentos. Os planos Pro e Enterprise incluem geração com IA, com limites diferentes de uso mensal. O plano Enterprise oferece uso ilimitado da IA e suporte prioritário.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Como baixar o orçamento em PDF?
                </AccordionTrigger>
                <AccordionContent>
                  Após criar seu orçamento, você pode visualizar uma prévia e clicar no botão "Baixar PDF". O documento será gerado automaticamente com layout profissional, pronto para enviar ao seu cliente.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  Posso personalizar o template do orçamento?
                </AccordionTrigger>
                <AccordionContent>
                  Sim! Oferecemos diferentes templates profissionais que você pode personalizar com suas cores, logo e informações da empresa. Cada template foi desenvolvido para causar uma excelente primeira impressão.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  Meus dados estão seguros?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutamente! Utilizamos criptografia de ponta e seguimos as melhores práticas de segurança. Seus dados são armazenados de forma segura e nunca são compartilhados com terceiros.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">
                  Como cancelar minha assinatura?
                </AccordionTrigger>
                <AccordionContent>
                  Você pode cancelar sua assinatura a qualquer momento através do seu perfil. Acesse "Minha Conta" &gt; "Assinatura" e clique em "Cancelar". Você continuará tendo acesso até o final do período pago.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Help Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed border-primary/20">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Precisa de mais ajuda?</CardTitle>
              <CardDescription className="text-lg">
                Não encontrou a resposta que procurava? Nossa equipe está aqui para ajudar!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Email de Suporte</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Envie sua dúvida ou relate um erro que encontrou. Respondemos em até 24 horas.
                  </p>
                  <a href="mailto:suporte@orcaai.com.br" className="text-primary hover:underline text-sm font-medium">
                    suporte@orcaai.com.br
                  </a>
                </Card>
                {/* 
                <Card className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageCircle className="h-5 w-5 text-secondary" />
                    <h3 className="font-semibold">Chat Online</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fale conosco em tempo real através do chat disponível no canto da tela.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Iniciar Chat
                  </Button>
                </Card> */}
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  <strong>Horário de atendimento:</strong> Segunda a sexta, das 9h às 18h (horário de Brasília)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;