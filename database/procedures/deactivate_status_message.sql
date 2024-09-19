CREATE OR REPLACE PROCEDURE deactivate_status_message(
    p_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Deactivate the status message
    UPDATE status_messages
    SET 
        active = FALSE,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

    -- Raise an exception if the message was not found
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Status message with id % does not exist', p_id;
    END IF;
END $$;

-- USAGE:

CALL deactivate_status_message('some-uuid');
