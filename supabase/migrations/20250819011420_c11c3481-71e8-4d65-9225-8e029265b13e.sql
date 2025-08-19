-- Disable email confirmation requirement
-- This allows users to sign up and login immediately without email confirmation
-- Update the auth configuration to not require email confirmation
UPDATE auth.config 
SET enable_signup = true, 
    enable_email_confirmations = false,
    enable_email_autoconfirm = true
WHERE true;