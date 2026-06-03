-- Prevent two confirmed bookings at the same time slot.
-- Uses a partial unique index so cancelled/completed slots can be reused.
create unique index if not exists bookings_no_double_confirmed
  on bookings (starts_at)
  where status = 'confirmed';
