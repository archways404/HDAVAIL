CREATE OR REPLACE FUNCTION get_user_slots(p_user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    uuid UUID,
    shift_type VARCHAR,
    shift_date DATE,
    start_time TIME,
    end_time TIME,
    created TIMESTAMPTZ,
    last_modified TIMESTAMPTZ,
    username VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.uuid, s.shift_type, s.shift_date, s.start_time, s.end_time, s.created, s.last_modified,
           u.username, u.first_name, u.last_name
    FROM slots s
    JOIN user_slots us ON s.uuid = us.slot_uuid
    JOIN users u ON us.user_uuid = u.uuid
    WHERE (p_user_uuid IS NULL OR us.user_uuid = p_user_uuid);
END;
$$ LANGUAGE plpgsql;

-- USAGE

SELECT * FROM get_user_slots();

SELECT * FROM get_user_slots('your-user-uuid-here');