import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { ArrowLeft, ArrowRight, BarChart3, Check, FileText, Users, X, Zap } from "lucide-react";
import { useState } from "react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao OrçaFacil IA!",
    description: "Vamos te ensinar como criar orçamentos profissionais em minutos",
    icon: <Zap className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Você está prestes a descobrir a forma mais rápida e inteligente de criar orçamentos profissionais.
        </p>
        <div className="bg-primary/5 rounded-lg p-4">
          <h4 className="font-semibold mb-2">O que você vai aprender:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Como usar a IA para gerar orçamentos</li>
            <li>• Como criar orçamentos manuais</li>
            <li>• Como gerenciar seus clientes e propostas</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "ai-generation",
    title: "Geração com IA 🤖",
    description: "Deixe nossa IA criar orçamentos personalizados para você",
    icon: <Zap className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Nossa IA analisa as informações do seu projeto e gera automaticamente:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/10 rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-1">Itens Inteligentes</h4>
            <p className="text-xs text-muted-foreground">Sugestões baseadas no seu negócio</p>
          </div>
          <div className="bg-secondary/10 rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-1">Preços Sugeridos</h4>
            <p className="text-xs text-muted-foreground">Valores de mercado atualizados</p>
          </div>
        </div>
        <div className="bg-primary/5 border-l-4 border-primary p-3 rounded">
          <p className="text-sm font-medium">💡 Dica: Seja específico na descrição do projeto para melhores resultados!</p>
        </div>
      </div>
    )
  },
  {
    id: "manual-creation",
    title: "Criação Manual 📝",
    description: "Templates profissionais para criar orçamentos do seu jeito",
    icon: <FileText className="h-8 w-8 text-secondary" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Prefere ter controle total? Use nossos templates profissionais:
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-semibold text-sm">Templates Personalizáveis</h4>
              <p className="text-xs text-muted-foreground">Escolha entre diferentes estilos profissionais</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
            <Users className="h-5 w-5 text-secondary" />
            <div>
              <h4 className="font-semibold text-sm">Dados do Cliente</h4>
              <p className="text-xs text-muted-foreground">Salve informações para reutilizar depois</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "digital-signature",
    title: "Assinatura Digital ✍️",
    description: "Feche negócios mais rápido com assinatura integrada",
    icon: <Check className="h-8 w-8 text-accent" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Transforme orçamentos em contratos assinados instantaneamente:
        </p>
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Processo Simplificado:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</div>
              <span>Envie o orçamento para o cliente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</div>
              <span>Cliente responde de forma prática</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</div>
              <span>Você coloca como proposta aceita</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "dashboard",
    title: "Painel de Controle 📊",
    description: "Gerencie tudo em um só lugar",
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Acompanhe seus orçamentos e vendas com relatórios completos:
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-card rounded-lg p-3 border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Orçamentos Salvos</h4>
              <span className="text-lg font-bold text-primary">12</span>
            </div>
            <p className="text-xs text-muted-foreground">Acesse e edite a qualquer momento</p>
          </div>
          <div className="bg-card rounded-lg p-3 border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Taxa de Conversão</h4>
              <span className="text-lg font-bold text-secondary">68%</span>
            </div>
            <p className="text-xs text-muted-foreground">Acompanhe suas aprovações</p>
          </div>
        </div>
      </div>
    )
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const { session } = useAuth();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsOpen(false);
    
    // Marcar onboarding como concluído no perfil do usuário
    if (session?.user?.id) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', session.user.id);
    }
    
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step.icon}
              <div>
                <DialogTitle className="text-xl">{step.title}</DialogTitle>
                <DialogDescription className="text-base">{step.description}</DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="py-6">
          {step.content}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Pular tutorial
            </Button>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              )}
              
              <Button onClick={handleNext} variant={isLastStep ? "hero" : "default"}>
                {isLastStep ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Começar a usar!
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};