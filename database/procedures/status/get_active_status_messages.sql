CREATE OR REPLACE FUNCTION get_active_status_messages()
RETURNS TABLE(
    id UUID,
    message TEXT,
    type VARCHAR(50),
    created_at TIMESTAMP
) 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Return all active messages
    RETURN QUERY
    SELECT id, message, type, created_at
    FROM status_messages
    WHERE active = TRUE
    ORDER BY created_at DESC;
END $$;


-- USAGE:

SELECT * FROM get_active_status_messages();


