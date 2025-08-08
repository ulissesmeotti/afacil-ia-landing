import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import usePlanLimits from "@/hooks/usePlanLimits";
import { useSession } from "@supabase/auth-helpers-react";
import { Brain, FileText, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";

const ProposalsPage = () => {
  const session = useSession();
  const { loading, limits } = usePlanLimits(session?.user?.id);

  const isAIBlocked =
    !loading &&
    limits &&
    (limits.planType === "gratuito" || limits.aiUsed >= limits.aiLimit);

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
                  {limits?.planType === "gratuito"
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
      </div>
    </div>
  );
};

export default ProposalsPage;
