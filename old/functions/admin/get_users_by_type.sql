CREATE OR REPLACE FUNCTION get_users_by_type(p_type VARCHAR(50) DEFAULT NULL)
RETURNS TABLE(uuid UUID, username VARCHAR(255), first_name VARCHAR(255), last_name VARCHAR(255))
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if the input type is provided
    IF p_type IS NULL THEN
        -- Return all users if no type is provided
        RETURN QUERY 
        SELECT users.uuid, users.username, users.first_name, users.last_name
        FROM users;
    ELSE
        -- Return users filtered by type if type is provided
        RETURN QUERY 
        SELECT users.uuid, users.username, users.first_name, users.last_name
        FROM users
        WHERE users.type = p_type;
    END IF;
END;
$$;

-- USAGE

SELECT * FROM get_users_by_type();


SELECT * FROM get_users_by_type('worker');
