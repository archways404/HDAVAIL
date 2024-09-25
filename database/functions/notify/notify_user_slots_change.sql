CREATE OR REPLACE FUNCTION notify_user_slots_change()
RETURNS trigger AS $$
BEGIN
    PERFORM pg_notify('user_slots_change', 'Change detected in user_slots table');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
