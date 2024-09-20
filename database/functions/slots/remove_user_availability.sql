CREATE OR REPLACE FUNCTION remove_user_availability(user_id UUID, slot_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM user_availability
    WHERE user_uuid = user_id AND slot_uuid = slot_id;
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT remove_user_availability('USER_UUID', 'SLOT_UUID');
