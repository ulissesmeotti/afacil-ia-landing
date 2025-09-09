-- Fix security vulnerability: Remove overly permissive policy that allows anyone to view signatures
-- This prevents unauthorized access to sensitive signature data

-- Drop the problematic policy that allows anyone to view signatures for pending proposals
DROP POLICY IF EXISTS "Anyone can view signatures for pending proposals" ON digital_signatures;

-- Add a more secure policy that allows signers to view only their own signatures
-- This allows the signer to see their signature after they've signed
CREATE POLICY "Signers can view their own signatures" 
ON digital_signatures 
FOR SELECT 
USING (signer_email = auth.email());

-- The existing policy "Users can view signatures for their own proposals" remains intact
-- This ensures proposal owners can still view signatures for their proposals