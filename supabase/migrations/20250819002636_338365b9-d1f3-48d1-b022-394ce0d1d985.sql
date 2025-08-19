-- Add creation_type column to proposals table to distinguish between AI and manual proposals
ALTER TABLE public.proposals 
ADD COLUMN creation_type TEXT NOT NULL DEFAULT 'manual' 
CHECK (creation_type IN ('ai', 'manual'));