-- Fix select policy to use auth.email() instead of subquery
drop policy if exists "select_own_bookings" on bookings;

create policy "select_own_bookings" on bookings
  for select using (
    user_id = auth.uid()
    or email = auth.email()
  );

-- Fix cancel policy the same way
drop policy if exists "cancel_own_bookings" on bookings;

create policy "cancel_own_bookings" on bookings
  for update
  using (
    user_id = auth.uid()
    or email = auth.email()
  )
  with check (status = 'cancelled');
