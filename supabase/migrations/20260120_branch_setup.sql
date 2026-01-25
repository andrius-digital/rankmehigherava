-- Add branch setup columns to client_tech_stack_choices table
ALTER TABLE client_tech_stack_choices
ADD COLUMN IF NOT EXISTS branch_dev BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS branch_staging BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS branch_main BOOLEAN DEFAULT false;
