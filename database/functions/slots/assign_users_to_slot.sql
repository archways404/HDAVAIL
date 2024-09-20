CREATE OR REPLACE FUNCTION assign_users_to_slot(slot_id UUID, user_ids UUID[])
RETURNS VOID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Loop through each user UUID in the array
    FOREACH user_id IN ARRAY user_ids
    LOOP
        -- Insert the user-slot relationship into user_slots table
        INSERT INTO user_slots (user_uuid, slot_uuid)
        VALUES (user_id, slot_id)
        ON CONFLICT DO NOTHING; -- Prevents errors if the relationship already exists
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- USAGE

SELECT assign_users_to_slot('SLOT_UUID_HERE', ARRAY['USER_UUID_1', 'USER_UUID_2']::UUID[]);
