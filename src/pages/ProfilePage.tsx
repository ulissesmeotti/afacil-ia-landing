// src/pages/ProfilePage.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const { session } = useAuth();

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
  
  const handleUpdatePlan = async (planType) => {
    if (!session) {
      toast.error("Você precisa estar logado para mudar de plano.");
      return;
    }

    setIsUpdating(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ plan_type: planType })
      .eq('id', session.user.id)
      .select('*')
      .single();

    if (error) {
      toast.error("Erro ao atualizar o plano. Tente novamente.");
      console.error("Supabase error:", error);
    } else {
      setProfile(data);
      toast.success(`Plano atualizado para "${planType}" com sucesso!`);
    }
    setIsUpdating(false);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  const currentPlan = profile?.plan_type;
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
              <CardTitle>Plano Atual: <span className="text-primary">{planDetails?.name}</span></CardTitle>
              <CardDescription>
                {profile?.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Uso de Orçamentos Manuais: <span className="font-semibold">{profile?.manual_usage_count || 0} / {planDetails?.manualLimit === Infinity ? "Ilimitado" : planDetails?.manualLimit}</span></p>
              <p>Uso de Orçamentos com IA: <span className="font-semibold">{profile?.ai_usage_count || 0} / {planDetails?.aiLimit === Infinity ? "Ilimitado" : planDetails?.aiLimit}</span></p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-4 text-center">Planos Disponíveis</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(plans).map(([key, plan]) => (
              <Card key={key} className={cn("text-center", { "border-primary-glow border-2 shadow-lg": key === currentPlan })}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <h3 className="text-3xl font-bold mt-2">{plan.price}</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> {plan.manualLimit === Infinity ? "Criação Manual Ilimitada" : `${plan.manualLimit} Orçamentos Manuais`}</p>
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> {plan.aiLimit === Infinity ? "Criação com IA Ilimitada" : `${plan.aiLimit} Orçamentos com IA`}</p>
                  {currentPlan === key ? (
                    <Button disabled className="w-full mt-4">Plano Atual</Button>
                  ) : (
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => handleUpdatePlan(key)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Atualizando..." : "Selecionar Plano"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;