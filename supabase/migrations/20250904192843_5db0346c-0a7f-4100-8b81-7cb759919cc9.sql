-- Add UPDATE policy for proposals table so users can update their own proposals
CREATE POLICY "Users can update their own proposals" 
ON public.proposals 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);