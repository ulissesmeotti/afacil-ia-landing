-- Adicionar coluna de status na tabela proposals
ALTER TABLE public.proposals 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

-- Comentário para validação dos valores possíveis
COMMENT ON COLUMN public.proposals.status IS 'Status da proposta: pending (aguardando), accepted (aceita), rejected (rejeitada)';