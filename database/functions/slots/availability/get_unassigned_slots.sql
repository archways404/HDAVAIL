CREATE OR REPLACE FUNCTION get_unassigned_slots()
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
    WHERE NOT EXISTS (
        SELECT 1
        FROM user_slots us
        WHERE us.slot_uuid = s.uuid
    );
END;
$$ LANGUAGE plpgsql;



-- USAGE

SELECT * FROM get_unassigned_slots();
