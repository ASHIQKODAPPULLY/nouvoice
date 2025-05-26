-- Create table to store training data examples
CREATE TABLE IF NOT EXISTS fine_tuning_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt TEXT NOT NULL,
  completion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_in_training BOOLEAN DEFAULT FALSE,
  source VARCHAR(255) NOT NULL DEFAULT 'user_feedback',
  quality_score FLOAT DEFAULT 0.5
);

-- Create table to track fine-tuning jobs
CREATE TABLE IF NOT EXISTS fine_tuning_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  examples_count INTEGER NOT NULL DEFAULT 0,
  validation_loss FLOAT,
  training_loss FLOAT,
  fine_tuned_model_id VARCHAR(255),
  metadata JSONB
);

-- Enable RLS
ALTER TABLE fine_tuning_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE fine_tuning_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admin access to fine_tuning_examples" ON fine_tuning_examples;
CREATE POLICY "Admin access to fine_tuning_examples"
ON fine_tuning_examples
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin access to fine_tuning_jobs" ON fine_tuning_jobs;
CREATE POLICY "Admin access to fine_tuning_jobs"
ON fine_tuning_jobs
USING (auth.role() = 'authenticated');

-- Add to realtime
alter publication supabase_realtime add table fine_tuning_examples;
alter publication supabase_realtime add table fine_tuning_jobs;