-- Add domain registrar columns to client_tech_stack_choices table
ALTER TABLE client_tech_stack_choices
ADD COLUMN IF NOT EXISTS domain_registrar TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS domain_login_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS domain_username TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS domain_password TEXT DEFAULT NULL;
