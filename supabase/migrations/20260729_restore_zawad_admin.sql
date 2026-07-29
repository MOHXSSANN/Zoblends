-- Restore Zawad's database-level admin access.
-- The admins table (used by RLS on bookings/waitlist/settings) was locked
-- down to only mo.hxssan360@gmail.com in 20260603_admin_lock.sql, but the
-- frontend ADMIN_EMAILS check in Admin.tsx/AdminFinance.tsx always included
-- zawadsamin@gmail.com — so he could see the admin UI but RLS silently
-- blocked most of the actual data. Restoring parity between the two checks.

insert into admins (email) values ('zawadsamin@gmail.com')
  on conflict do nothing;
