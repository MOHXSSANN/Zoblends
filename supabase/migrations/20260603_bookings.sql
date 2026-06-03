create table if not exists bookings (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        references auth.users(id) on delete set null,
  name           text        not null,
  email          text        not null,
  phone          text        not null,
  service_id     text        not null,
  service_name   text        not null,
  service_price  text        not null,
  service_duration text      not null,
  starts_at      timestamptz not null,
  status         text        not null default 'confirmed'
                             check (status in ('confirmed','cancelled','completed','no_show')),
  created_at     timestamptz not null default now()
);

alter table bookings enable row level security;

-- Anyone (including guests) can insert a booking
create policy "insert_bookings" on bookings
  for insert with check (true);

-- Signed-in users see bookings that match their user_id or their email
create policy "select_own_bookings" on bookings
  for select using (
    user_id = auth.uid()
    or email = (select email from auth.users where id = auth.uid())
  );

-- Users can cancel their own bookings
create policy "cancel_own_bookings" on bookings
  for update
  using (
    user_id = auth.uid()
    or email = (select email from auth.users where id = auth.uid())
  )
  with check (status = 'cancelled');
