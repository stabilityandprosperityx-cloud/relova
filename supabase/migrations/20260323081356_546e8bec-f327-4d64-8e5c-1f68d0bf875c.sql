ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS paddle_customer_id text,
ADD COLUMN IF NOT EXISTS paddle_subscription_id text;