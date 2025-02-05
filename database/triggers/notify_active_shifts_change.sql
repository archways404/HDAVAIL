CREATE OR REPLACE FUNCTION notify_active_shifts_change() 
RETURNS trigger AS $$
DECLARE
    payload text;
BEGIN
    -- Build a JSON payload with the schedule_group_id depending on the operation
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        payload := json_build_object('schedule_group_id', NEW.schedule_group_id)::text;
    ELSIF (TG_OP = 'DELETE') THEN
        payload := json_build_object('schedule_group_id', OLD.schedule_group_id)::text;
    END IF;
    
    -- Send the notification on the 'active_shifts_channel'
    PERFORM pg_notify('active_shifts_channel', payload);
    
    -- For AFTER triggers, you typically return NULL
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;