CREATE OR REPLACE FUNCTION get_slots_by_user(user_id UUID)
RETURNS TABLE (
    uuid UUID,
    shift_type VARCHAR(50),
    shift_date DATE,
    start_time TIME,
    end_time TIME,
    created TIMESTAMPTZ,
    last_modified TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.uuid, s.shift_type, s.shift_date, s.start_time, s.end_time, s.created, s.last_modified
    FROM slots s
    JOIN user_slots us ON s.uuid = us.slot_uuid
    WHERE us.user_uuid = user_id;
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT * FROM get_slots_by_user('USER_UUID_HERE');
