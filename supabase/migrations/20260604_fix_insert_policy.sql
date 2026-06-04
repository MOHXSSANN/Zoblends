-- Ensure anon insert is allowed on bookings
drop policy if exists "insert_bookings" on bookings;

create policy "insert_bookings" on bookings
  for insert with check (true);

-- Same for waitlist
drop policy if exists "insert_waitlist" on waitlist;

create policy "insert_waitlist" on waitlist
  for insert with check (true);
