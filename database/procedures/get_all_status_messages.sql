CREATE OR REPLACE FUNCTION get_all_status_messages()
RETURNS TABLE (
    id UUID,
    message TEXT,
    type VARCHAR(50),
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Return all status messages (active and inactive)
    RETURN QUERY
    SELECT id, message, type, active, created_at, updated_at
    FROM status_messages
    ORDER BY created_at DESC;
END $$;

-- USAGE:

SELECT * FROM get_all_status_messages();
