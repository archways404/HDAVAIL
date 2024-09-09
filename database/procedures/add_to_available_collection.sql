CREATE OR REPLACE PROCEDURE add_to_available_collection(
    p_user_uuid UUID,
    p_availability_uuid UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Ensure the user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE uuid = p_user_uuid) THEN
        RAISE EXCEPTION 'User with UUID % does not exist', p_user_uuid;
    END IF;

    -- Ensure the availability entry exists
    IF NOT EXISTS (SELECT 1 FROM availability WHERE uuid = p_availability_uuid) THEN
        RAISE EXCEPTION 'Availability with UUID % does not exist', p_availability_uuid;
    END IF;

    -- Insert into available_collection
    INSERT INTO available_collection (user_uuid, availability_uuid)
    VALUES (p_user_uuid, p_availability_uuid);
END $$;


-- EXAMPLE USAGE

CALL add_to_available_collection(
    'user-uuid-example',        -- Replace with actual user UUID
    'availability-uuid-example' -- Replace with actual availability UUID
);
