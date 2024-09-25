CREATE OR REPLACE FUNCTION get_users_available_for_slot(slot_id UUID)
RETURNS TABLE (
    user_uuid UUID,
    username VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.uuid, u.username
    FROM users u
    JOIN user_availability ua ON u.uuid = ua.user_uuid
    WHERE ua.slot_uuid = slot_id;
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT * FROM get_users_available_for_slot('SLOT_UUID_HERE');
