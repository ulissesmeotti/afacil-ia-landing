-- Fix security vulnerability: Restrict INSERT operations on subscribers table
-- to only allow authenticated users to create their own subscription records

-- Drop the existing insecure INSERT policy
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create a secure INSERT policy that only allows authenticated users 
-- to create subscription records for themselves
CREATE POLICY "Users can only create their own subscription records" 
ON public.subscribers 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  auth.email() = email
);

-- Also ensure user_id column is not nullable for security
-- (This prevents creating subscription records without a user_id)
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;