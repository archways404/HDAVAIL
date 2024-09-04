CREATE OR REPLACE PROCEDURE create_user_if_not_exists(
    p_username VARCHAR(255), 
    p_email VARCHAR(255), 
    p_type VARCHAR(50), 
    p_reset_token VARCHAR(255)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if the user already exists by username or email
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username OR email = p_email) THEN
        RAISE EXCEPTION 'User with this username or email already exists';
    END IF;

    -- Check if the reset token already exists
    IF EXISTS (SELECT 1 FROM users WHERE reset_token = p_reset_token) THEN
        RAISE EXCEPTION 'Reset token already exists';
    END IF;

    -- Insert the new user if no conflicts were found
    INSERT INTO users (username, email, type, reset_token)
    VALUES (p_username, p_email, p_type, p_reset_token);

END;
$$;
