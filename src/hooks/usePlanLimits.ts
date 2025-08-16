// src/hooks/usePlanLimits.ts
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type PlanKey = "gratuito" | "pro" | "enterprise";
type UsageType = "manual" | "ai";

const plans = {
  gratuito: { manualLimit: 5, aiLimit: 0 },
  pro: { manualLimit: 40, aiLimit: 10 },
  enterprise: { manualLimit: Infinity, aiLimit: Infinity },
};

export default function usePlanLimits(userId?: string | null) {
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      setError(error.message || "Erro ao buscar perfil");
      setProfile(null);
    } else {
      setProfile(data);
      setError(null);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const planDetails = ((): { manualLimit: number; aiLimit: number } => {
    const planType = (profile?.plan_type as PlanKey) || "gratuito";
    return plans[planType] ?? plans.gratuito;
  })();

  function getUsageField(type: UsageType) {
    return type === "manual" ? "manual_usage_count" : "ai_usage_count";
  }

  function getLimitFor(type: UsageType) {
    return type === "manual" ? planDetails.manualLimit : planDetails.aiLimit;
  }

  const canCreate = (type: UsageType) => {
    if (!profile) return false;
    const used = profile[getUsageField(type)] ?? 0;
    const limit = getLimitFor(type);
    if (limit === Infinity) return true;
    return used < limit;
  };

  const incrementUsage = async (type: UsageType) => {
    if (!profile) throw new Error("Perfil não carregado.");
    const field = getUsageField(type);
    const current = profile[field] ?? 0;
    const limit = getLimitFor(type);
    if (limit !== Infinity && current >= limit) {
      throw new Error(`Limite atingido para ${type}`);
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ [field]: current + 1 })
      .eq("id", profile.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    setProfile(data);
    return data;
  };

  const refresh = async () => {
    await fetchProfile();
  };

  return {
    profile,
    isLoading,
    error,
    planDetails,
    canCreate,
    incrementUsage,
    refresh,
  };
}