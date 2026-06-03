-- Ensure only mo.hxssan360@gmail.com is in the admins table.
-- Delete any other rows (in case the table was seeded with extras).
delete from admins where email != 'mo.hxssan360@gmail.com';

-- Re-insert the sole admin in case the row was missing.
insert into admins (email) values ('mo.hxssan360@gmail.com')
  on conflict do nothing;

-- Lock down the admins table so only the service role can mutate it.
-- No RLS needed for insert/update/delete — just revoke from anon/authenticated.
revoke insert, update, delete on admins from anon, authenticated;
