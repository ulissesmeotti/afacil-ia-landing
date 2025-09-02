-- Adicionar campo onboarding_completed à tabela profiles
ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Criar tabela para assinaturas digitais
CREATE TABLE public.digital_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela digital_signatures
ALTER TABLE public.digital_signatures ENABLE ROW LEVEL SECURITY;

-- Políticas para assinaturas digitais
CREATE POLICY "Usuários podem ver assinaturas de suas próprias propostas" 
ON public.digital_signatures 
FOR SELECT 
USING (
  proposal_id IN (
    SELECT id FROM public.proposals WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Qualquer um pode criar assinaturas" 
ON public.digital_signatures 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar assinaturas de suas próprias propostas" 
ON public.digital_signatures 
FOR UPDATE 
USING (
  proposal_id IN (
    SELECT id FROM public.proposals WHERE user_id = auth.uid()
  )
);

-- Trigger para atualizar timestamps
CREATE TRIGGER update_digital_signatures_updated_at
BEFORE UPDATE ON public.digital_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar índices para performance
CREATE INDEX idx_digital_signatures_proposal_id ON public.digital_signatures(proposal_id);
CREATE INDEX idx_digital_signatures_signer_email ON public.digital_signatures(signer_email);