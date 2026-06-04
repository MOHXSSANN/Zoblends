CREATE TABLE IF NOT EXISTS shop_orders (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT        UNIQUE,
  customer_email    TEXT,
  customer_name     TEXT,
  items             JSONB       NOT NULL DEFAULT '[]',
  total_cents       INTEGER     NOT NULL DEFAULT 0,
  status            TEXT        NOT NULL DEFAULT 'paid',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (admin panel uses service role via API)
CREATE POLICY "service role only" ON shop_orders
  USING (false);
