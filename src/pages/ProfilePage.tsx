import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useSubscription } from "@/hooks/useSubscription";
import { ArrowLeft, Check, Crown, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const plans = {
  gratuito: {
    name: "Gratuito",
    price: "R$ 0,00",
    description: "Ideal para começar.",
    manualLimit: 5,
    aiLimit: 0,
  },
  pro: {
    name: "Pro",
    price: "R$ 29,90",
    description: "Mais recursos e uso de IA.",
    manualLimit: 40,
    aiLimit: 10,
  },
  enterprise: {
    name: "Enterprise",
    price: "R$ 129,90",
    description: "Criação ilimitada.",
    manualLimit: Infinity,
    aiLimit: Infinity,
  },
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const { subscription, isLoading: subscriptionLoading, isCreatingCheckout, checkSubscription, createCheckout, manageSubscription } = useSubscription();

  // Check if user just returned from successful payment
  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success("Pagamento realizado! Sua assinatura foi ativada com sucesso.");
      checkSubscription();
    } else if (searchParams.get('cancelled')) {
      toast.error("Pagamento cancelado. O processo de pagamento foi cancelado.");
    }
  }, [searchParams, checkSubscription]);

  const fetchProfile = async () => {
    setIsLoading(true);
    if (session) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: session.user.id, email: session.user.email, plan_type: 'gratuito' });
        if (insertError) {
          toast.error("Erro ao criar perfil. Tente novamente.");
          console.error("Supabase error:", insertError);
        } else {
          toast.info("Seu perfil foi criado!");
          fetchProfile();
        }
      } else if (error) {
        toast.error("Erro ao carregar perfil.");
        console.error("Supabase error:", error);
      } else {
        setProfile(data);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);
  
  const handlePlanAction = async (planType) => {
    if (!session?.user?.id) return;

    if (planType === 'gratuito') {
      // For free plan, just update in database
      setIsUpdating(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ plan_type: planType })
          .eq('id', session.user.id);

        if (error) {
          toast.error("Erro ao atualizar plano.");
        } else {
          toast.success("Plano atualizado para gratuito!");
          fetchProfile();
        }
      } catch (error) {
        toast.error("Erro ao atualizar plano.");
      } finally {
        setIsUpdating(false);
      }
    } else {
      // For paid plans, redirect to Stripe checkout
      const priceId = planType === 'pro' 
        ? 'price_1RwX5rRbGgmNCJQtWCcTETGW' 
        : 'price_1RwX66RbGgmNCJQtRpLEESUE';
      
      await createCheckout(priceId);
    }
  };
  
  if (isLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  // Determine current plan based on subscription or profile
  const currentPlan = subscription.subscribed && subscription.subscription_tier 
    ? subscription.subscription_tier 
    : profile?.plan_type || 'gratuito';
  const planDetails = plans[currentPlan];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-8 md:p-12">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <Link to="/propostas">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
            </Link>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Plano Atual: <span className="text-primary capitalize">{planDetails?.name}</span></CardTitle>
              <CardDescription>
                {profile?.email}
                {subscription.subscribed && subscription.subscription_end && (
                  <span className="block text-xs mt-1">
                    Renovação: {new Date(subscription.subscription_end).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Uso de Orçamentos Manuais: <span className="font-semibold">{profile?.manual_usage_count || 0} / {planDetails?.manualLimit === Infinity ? "Ilimitado" : planDetails?.manualLimit}</span></p>
              <p>Uso de Orçamentos com IA: <span className="font-semibold">{profile?.ai_usage_count || 0} / {planDetails?.aiLimit === Infinity ? "Ilimitado" : planDetails?.aiLimit}</span></p>
              {subscription.subscribed && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={manageSubscription}
                    variant="outline"
                    className="w-full"
                  >
                    Gerenciar Assinatura no Stripe
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-4 text-center">Planos Disponíveis</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(plans).map(([key, plan]) => {
              const isCurrentPlan = currentPlan === key;
              const isSubscribedPlan = subscription.subscribed && subscription.subscription_tier === key;
              
              return (
                <Card key={key} className={cn("text-center relative", { "border-primary-glow border-2 shadow-lg": isCurrentPlan })}>
                  {isCurrentPlan && (
                    <div className="absolute -top-2 left-4 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      {key === 'enterprise' && <Crown className="h-3 w-3" />}
                      {key === 'pro' && <Zap className="h-3 w-3" />}
                      Seu Plano
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      {key === 'enterprise' && <Crown className="h-5 w-5 text-yellow-500" />}
                      {key === 'pro' && <Zap className="h-5 w-5 text-blue-500" />}
                      {plan.name}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <h3 className="text-3xl font-bold mt-2">{plan.price}</h3>
                    {key !== 'gratuito' && (
                      <div className="text-sm text-muted-foreground">por mês</div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> {plan.manualLimit === Infinity ? "Criação Manual Ilimitada" : `${plan.manualLimit} Orçamentos Manuais`}</p>
                    <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> {plan.aiLimit === Infinity ? "Criação com IA Ilimitada" : `${plan.aiLimit} Orçamentos com IA`}</p>
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => handlePlanAction(key)}
                      disabled={isUpdating || isCreatingCheckout || isCurrentPlan}
                      variant={isCurrentPlan ? "secondary" : "default"}
                    >
                      {isCreatingCheckout ? "Processando..." :
                       isCurrentPlan ? "Plano Atual" :
                       key === 'gratuito' ? "Downgrade" : 
                       isSubscribedPlan ? "Atual no Stripe" : "Assinar Agora"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;