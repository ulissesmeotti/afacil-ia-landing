import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/auth-provider';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    checkOnboardingStatus();
  }, [session]);

  const checkOnboardingStatus = async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Verificar se o perfil existe e se o onboarding foi concluído
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar onboarding:', error);
        setIsLoading(false);
        return;
      }

      // Se não há perfil ou onboarding não foi concluído, mostrar onboarding
      if (!profile || !profile.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Erro ao verificar status do onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!session?.user?.id) return;

    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', session.user.id);

      setShowOnboarding(false);
    } catch (error) {
      console.error('Erro ao marcar onboarding como concluído:', error);
    }
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding
  };
};