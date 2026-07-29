-- Self-service booking hours, so admins can change hours without a code deploy.
-- Single-row table; values are minutes-from-midnight (matches BookDateTimePicker.tsx constants).

create table if not exists booking_settings (
  id                  int  primary key default 1,
  day_start_min       int  not null default 600,   -- 10:00 AM
  regular_end_min     int  not null default 1140,  -- 7:00 PM  — late night starts
  premium_start_min   int  not null default 1260,  -- 9:00 PM  — premium tier (+$20)
  late_night_end_min  int  not null default 1320,  -- 10:00 PM
  buffer_min          int  not null default 10,
  max_per_day         int  not null default 12,
  booking_notice_min  int  not null default 360,   -- 6hr advance notice
  updated_at          timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into booking_settings (id) values (1) on conflict (id) do nothing;

alter table booking_settings enable row level security;

-- Anyone can read (the public booking page needs this to build time slots)
create policy "select_booking_settings" on booking_settings
  for select using (true);

-- Only admins can change hours
create policy "update_booking_settings" on booking_settings
  for update
  using (exists (select 1 from admins where email = auth.email()))
  with check (exists (select 1 from admins where email = auth.email()));
