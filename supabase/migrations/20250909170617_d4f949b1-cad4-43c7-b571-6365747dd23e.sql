-- Fix critical security vulnerability: Restrict subscribers table UPDATE policy
-- Current policy allows any authenticated user to update any subscription record
-- This fixes it to only allow users to update their own subscription records

-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "update_own_subscription" ON subscribers;

-- Create a secure update policy that only allows users to update their own records
CREATE POLICY "update_own_subscription" 
ON subscribers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Note: Edge functions use the service role key which bypasses RLS entirely,
-- so they can still update subscription records as needed for Stripe integration