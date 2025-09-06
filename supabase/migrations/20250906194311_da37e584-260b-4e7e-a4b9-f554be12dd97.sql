-- Fix security vulnerability in digital_signatures table
-- Replace the overly permissive INSERT policy with proper validation

-- First, drop the insecure policy
DROP POLICY IF EXISTS "Qualquer um pode criar assinaturas" ON public.digital_signatures;

-- Create a more secure policy that validates:
-- 1. The proposal exists and is in a signable state
-- 2. No signature already exists for this proposal
-- 3. Basic validation of signer information
CREATE POLICY "Signatures can only be created for valid pending proposals"
ON public.digital_signatures
FOR INSERT
WITH CHECK (
  -- Proposal must exist and be in pending status
  EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE id = proposal_id 
    AND status = 'pending'
  )
  -- No existing signature for this proposal
  AND NOT EXISTS (
    SELECT 1 FROM public.digital_signatures ds
    WHERE ds.proposal_id = digital_signatures.proposal_id
  )
  -- Signer email must be provided and valid format
  AND signer_email IS NOT NULL 
  AND signer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- Signer name must be provided
  AND signer_name IS NOT NULL 
  AND length(trim(signer_name)) > 0
  -- Signature data must be provided
  AND signature_data IS NOT NULL 
  AND length(signature_data) > 0
);

-- Add a policy to allow viewing signatures for proposals that can be signed publicly
-- This allows the signature page to check if a proposal is already signed
CREATE POLICY "Anyone can view signatures for pending proposals"
ON public.digital_signatures
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE id = proposal_id 
    AND status = 'pending'
  )
);

-- Update the existing SELECT policy to be more specific for authenticated users
DROP POLICY IF EXISTS "Usuários podem ver assinaturas de suas próprias propostas" ON public.digital_signatures;

CREATE POLICY "Users can view signatures for their own proposals"
ON public.digital_signatures
FOR SELECT
USING (
  proposal_id IN (
    SELECT id FROM public.proposals 
    WHERE user_id = auth.uid()
  )
);