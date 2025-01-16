CREATE OR REPLACE FUNCTION add_user_availability(user_id UUID, slot_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_availability (user_uuid, slot_uuid)
    VALUES (user_id, slot_id)
    ON CONFLICT DO NOTHING;  -- Avoid inserting duplicate availability
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT add_user_availability('USER_UUID', 'SLOT_UUID');