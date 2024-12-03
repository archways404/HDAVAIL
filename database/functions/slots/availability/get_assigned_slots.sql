CREATE OR REPLACE FUNCTION get_assigned_slots()
RETURNS TABLE (
    slot_uuid UUID,
    shift_type VARCHAR(50),
    shift_date DATE,
    start_time TIME,
    end_time TIME,
    created TIMESTAMPTZ,
    last_modified TIMESTAMPTZ,
    user_uuid UUID,
    username VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.uuid AS slot_uuid, s.shift_type, s.shift_date, s.start_time, s.end_time, 
           s.created, s.last_modified, u.uuid AS user_uuid, u.username
    FROM slots s
    JOIN user_slots us ON s.uuid = us.slot_uuid
    JOIN users u ON u.uuid = us.user_uuid;
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT * FROM get_assigned_slots();












-- OLD
CREATE OR REPLACE FUNCTION get_assigned_slots()
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
    WHERE EXISTS (
        SELECT 1
        FROM user_slots us
        WHERE us.slot_uuid = s.uuid
    );
END;
$$ LANGUAGE plpgsql;