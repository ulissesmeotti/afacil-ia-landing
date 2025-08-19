import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import usePlanLimits from "@/hooks/usePlanLimits";
import { useAuth } from "@/providers/auth-provider";
import { Brain, FileText, ListTodo, Star, Zap } from "lucide-react";
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
        <div className="mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Como funciona</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Três passos simples para criar orçamentos profissionais
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Linha conectora */}
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30"></div>
            
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-bold text-lg mb-3">Escolha o método</h3>
              <p className="text-muted-foreground">Selecione entre geração automática com IA ou criação manual com templates profissionais</p>
            </div>
            
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-bold text-lg mb-3">Preencha os dados</h3>
              <p className="text-muted-foreground">Insira as informações do seu projeto e cliente de forma simples e intuitiva</p>
            </div>
            
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-bold text-lg mb-3">Baixe o orçamento</h3>
              <p className="text-muted-foreground">Revise, personalize e baixe seu orçamento em PDF profissional pronto para envio</p>
            </div>
          </div>
        </div>

        {/* Separador visual */}
        <div className="mt-24 mb-20">
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
        </div>

        {/* Principais benefícios */}
        <div className="mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Principais benefícios</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja por que milhares de profissionais escolhem nossa plataforma
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">Rapidez</h3>
              <p className="text-muted-foreground">Crie orçamentos profissionais em minutos, não em horas</p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">Profissional</h3>
              <p className="text-muted-foreground">Templates modernos e layouts que impressionam clientes</p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">Inteligente</h3>
              <p className="text-muted-foreground">IA avançada que entende seu negócio e sugere valores</p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">Organizado</h3>
              <p className="text-muted-foreground">Salve, gerencie e acesse todos seus orçamentos na nuvem</p>
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