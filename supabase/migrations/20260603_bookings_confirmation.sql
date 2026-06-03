alter table bookings
  add column if not exists confirmation_number text unique;
