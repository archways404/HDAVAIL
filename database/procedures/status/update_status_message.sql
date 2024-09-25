CREATE OR REPLACE PROCEDURE update_status_message(
    p_id UUID,
    p_message TEXT,
    p_type VARCHAR(50),
    p_active BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update the status message
    UPDATE status_messages
    SET 
        message = p_message,
        type = p_type,
        active = p_active,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

    -- Raise an exception if the message was not found
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Status message with id % does not exist', p_id;
    END IF;
END $$;

-- USAGE:

CALL update_status_message(
    'some-uuid',
    'The maintenance has been postponed.',
    'info',
    TRUE
);
