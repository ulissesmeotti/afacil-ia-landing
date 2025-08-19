import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import usePlanLimits from "@/hooks/usePlanLimits";
import { useAuth } from "@/providers/auth-provider";
import { Brain, FileText, ListTodo } from "lucide-react";
import { Link } from "react-router-dom"; // Adicione este import

const ProposalsPage = () => {
  const { session } = useAuth();
  const { isLoading, profile, planDetails, canCreate } = usePlanLimits(session?.user?.id);

  const isAIBlocked = !canCreate("ai");

  return (
    <div className="min-h-screen bg-background p-8">
      <Header />
      <div className="container mx-auto max-w-4xl text-center">
        <div className="my-12">
          <h1 className="text-4xl md:text-5xl font-bold">
            Escolha como criar seu <span className="text-primary">orçamento</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-4">
            Selecione uma das opções abaixo para começar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Opção de IA */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">Geração com IA</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <CardDescription className="text-center">
                Deixe nossa Inteligência Artificial criar uma proposta personalizada para você em segundos.
              </CardDescription>

              {isAIBlocked ? (
                <Button variant="hero" className="w-full" disabled>
                  {profile?.plan_type === "gratuito"
                    ? "Disponível apenas no plano Pro"
                    : "Limite de uso atingido"}
                </Button>
              ) : (
                <Link to="/propostas/ia" className="w-full">
                  <Button variant="hero" className="w-full">Usar IA</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Opção Manual */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-center">Criação Manual</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <CardDescription className="text-center">
                Preencha os campos e escolha um de nossos templates profissionais.
              </CardDescription>
              <Link to="/propostas/manual?template=profissional" className="w-full">
                <Button variant="cta" className="w-full">
                  Começar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Nova seção para orçamentos salvos */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Já tem um orçamento salvo?</h2>
          <p className="text-muted-foreground mb-6">
            Acesse e gerencie suas propostas salvas a qualquer momento.
          </p>
          <Link to="/propostas/salvas">
            <Button variant="outline" size="lg">
              <ListTodo className="h-5 w-5 mr-2" /> Meus Orçamentos
            </Button>
          </Link>
        </div>

        {/* Como funciona */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold mb-2">Escolha o método</h3>
              <p className="text-muted-foreground text-sm">Selecione entre geração automática com IA ou criação manual com templates</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold mb-2">Preencha os dados</h3>
              <p className="text-muted-foreground text-sm">Insira as informações do seu projeto e cliente de forma simples e rápida</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold mb-2">Baixe o orçamento</h3>
              <p className="text-muted-foreground text-sm">Revise, edite se necessário e baixe em PDF profissional</p>
            </div>
          </div>
        </div>

        {/* Principais benefícios */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Principais benefícios</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Rapidez</h3>
              <p className="text-muted-foreground text-sm">Crie orçamentos profissionais em minutos</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">✨</span>
              </div>
              <h3 className="font-semibold mb-2">Profissional</h3>
              <p className="text-muted-foreground text-sm">Templates modernos e personalizáveis</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">🤖</span>
              </div>
              <h3 className="font-semibold mb-2">Inteligente</h3>
              <p className="text-muted-foreground text-sm">IA que entende seu negócio</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold">💾</span>
              </div>
              <h3 className="font-semibold mb-2">Organizado</h3>
              <p className="text-muted-foreground text-sm">Salve e gerencie todos seus orçamentos</p>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas frequentes</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Como funciona a geração com IA?</h3>
              <p className="text-muted-foreground text-sm">Nossa IA analisa as informações do seu projeto e gera automaticamente um orçamento detalhado e profissional, incluindo descrições dos serviços e valores sugeridos.</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Posso editar o orçamento depois de criado?</h3>
              <p className="text-muted-foreground text-sm">Sim! Você pode editar qualquer informação do orçamento antes de salvá-lo ou baixá-lo em PDF. Tudo é personalizável.</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Os orçamentos ficam salvos na nuvem?</h3>
              <p className="text-muted-foreground text-sm">Sim, todos os seus orçamentos ficam salvos na sua conta e podem ser acessados de qualquer dispositivo.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalsPage;