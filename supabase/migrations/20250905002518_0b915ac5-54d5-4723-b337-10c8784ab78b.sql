-- Adicionar colunas para salvar informações de template nas propostas
ALTER TABLE public.proposals 
ADD COLUMN template_id text DEFAULT 'default',
ADD COLUMN template_colors jsonb DEFAULT '{"primary": "#6366f1", "background": "#ffffff", "text": "#000000", "accent": "#f3f4f6"}'::jsonb;