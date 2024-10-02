CREATE OR REPLACE FUNCTION get_user_by_uuid(p_uuid UUID)
RETURNS TABLE(
    uuid UUID,
    username VARCHAR(255),
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    type VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Return all columns except password and reset_token for the given uuid
    RETURN QUERY 
    SELECT users.uuid, users.username, users.email, users.first_name, users.last_name, users.type
    FROM users
    WHERE users.uuid = p_uuid;
END;
$$;

-- USAGE

SELECT * FROM get_user_by_uuid('your-uuid-here');
