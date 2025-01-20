CREATE OR REPLACE FUNCTION get_slots_user_is_available_for(user_id UUID)
RETURNS TABLE (
    slot_uuid UUID,
    shift_type VARCHAR(50),
    shift_date DATE,
    start_time TIME,
    end_time TIME
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.uuid, s.shift_type, s.shift_date, s.start_time, s.end_time
    FROM slots s
    JOIN user_availability ua ON s.uuid = ua.slot_uuid
    WHERE ua.user_uuid = user_id;
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT * FROM get_slots_user_is_available_for('USER_UUID_HERE');
