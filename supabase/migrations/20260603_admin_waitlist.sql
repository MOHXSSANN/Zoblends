-- ── Admins table ─────────────────────────────────────────────────────────────
create table if not exists admins (
  email text primary key
);

-- Seed with current admin — update this to Zowad's actual email when ready
insert into admins (email) values ('mo.hxssan360@gmail.com')
  on conflict do nothing;

-- ── Update bookings RLS to include admin access ───────────────────────────────
drop policy if exists "select_own_bookings"  on bookings;
drop policy if exists "cancel_own_bookings"  on bookings;

create policy "select_bookings" on bookings
  for select using (
    user_id = auth.uid()
    or email = auth.email()
    or exists (select 1 from admins where email = auth.email())
  );

create policy "update_bookings" on bookings
  for update using (
    user_id = auth.uid()
    or email = auth.email()
    or exists (select 1 from admins where email = auth.email())
  );

-- ── Waitlist table ────────────────────────────────────────────────────────────
create table if not exists waitlist (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  email        text        not null,
  phone        text        not null,
  desired_date date        not null,
  status       text        not null default 'waiting'
               check (status in ('waiting','notified','cancelled')),
  created_at   timestamptz not null default now()
);

alter table waitlist enable row level security;

create policy "insert_waitlist" on waitlist
  for insert with check (true);

create policy "select_waitlist" on waitlist
  for select using (
    email = auth.email()
    or exists (select 1 from admins where email = auth.email())
  );

create policy "update_waitlist" on waitlist
  for update using (
    email = auth.email()
    or exists (select 1 from admins where email = auth.email())
  );
