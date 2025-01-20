CREATE OR REPLACE FUNCTION notify_slots_change()
RETURNS trigger AS $$
BEGIN
    PERFORM pg_notify('slots_change', 'Change detected in slots table');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
