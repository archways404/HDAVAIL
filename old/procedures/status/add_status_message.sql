CREATE OR REPLACE PROCEDURE add_status_message(
    p_message TEXT,
    p_type VARCHAR(50),
    p_active BOOLEAN DEFAULT TRUE
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert the new status message
    INSERT INTO status_messages (message, type, active)
    VALUES (p_message, p_type, p_active);
END $$;


-- USAGE:

CALL add_status_message(
    'The system will be down for maintenance at 10 PM.',
    'warning',
    TRUE
);
