CREATE OR REPLACE FUNCTION login_process(
    p_email VARCHAR(255),
    p_password VARCHAR(255),
    p_ip VARCHAR(45)
)
RETURNS TABLE (
    user_id UUID,
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    notification_email VARCHAR(255),
    role VARCHAR(255),
    error TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
    v_password VARCHAR(255);
    v_locked BOOLEAN DEFAULT FALSE;
    v_unlock_time TIMESTAMP;
    v_failed_attempts INT DEFAULT 0;
BEGIN
    -- Step 1: Check if the email exists
    SELECT a.user_id, a.password
    INTO v_user_id, v_password
    FROM account a
    WHERE a.email = p_email;

    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, 
            'Account with email does not exist';
        RETURN;
    END IF;

    -- Step 2: Ensure a lockout record exists for the user
    PERFORM 1
    FROM account_lockout l
    WHERE l.user_id = v_user_id;

    IF NOT FOUND THEN
        INSERT INTO account_lockout (user_id, failed_attempts, locked, unlock_time)
        VALUES (v_user_id, 0, FALSE, NULL);
    END IF;

    -- Step 3: Check if the account is locked
    SELECT l.locked, l.unlock_time, l.failed_attempts
    INTO v_locked, v_unlock_time, v_failed_attempts
    FROM account_lockout l
    WHERE l.user_id = v_user_id;

    IF v_locked THEN
        -- Step 3a: If the unlock_time is older than the current time, unlock the account
        IF v_unlock_time <= CURRENT_TIMESTAMP THEN
            UPDATE account_lockout
            SET locked = FALSE,
                failed_attempts = 0,
                unlock_time = NULL
            WHERE account_lockout.user_id = v_user_id;
        ELSE
            RETURN QUERY SELECT 
                NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, 
                'Account is locked until ' || v_unlock_time::TEXT;
            RETURN;
        END IF;
    END IF;

    -- Step 4: Verify the password
    IF v_password = p_password THEN
        -- Reset failed attempts on successful login
        UPDATE account_lockout
        SET failed_attempts = 0,
            locked = FALSE,
            unlock_time = NULL
        WHERE account_lockout.user_id = v_user_id;

        -- Return user information on success
        RETURN QUERY
        SELECT a.user_id, a.email, a.first_name, a.last_name, a.notification_email, a.role, NULL
        FROM account a
        WHERE a.user_id = v_user_id;

    ELSE
        -- Step 5: Handle failed login
        -- Increment failed attempts
        UPDATE account_lockout
        SET failed_attempts = failed_attempts + 1,
            last_failed_ip = p_ip,
            last_failed_time = CURRENT_TIMESTAMP
        WHERE account_lockout.user_id = v_user_id;

        -- Check if the account should be locked
        SELECT l.failed_attempts
        INTO v_failed_attempts
        FROM account_lockout l
        WHERE l.user_id = v_user_id;

        IF v_failed_attempts >= 5 THEN
            UPDATE account_lockout
            SET locked = TRUE,
                unlock_time = CURRENT_TIMESTAMP + INTERVAL '15 minutes'
            WHERE account_lockout.user_id = v_user_id;

            RETURN QUERY SELECT 
                NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, 
                'Account locked due to too many failed attempts';
            RETURN;
        END IF;

        -- Return error for invalid password
        RETURN QUERY SELECT 
            NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, 
            'Invalid password';
        RETURN;
    END IF;
END;
$$;


-- EXAMPLE

SELECT * FROM login_process('test@test.com', 'test', '192.168.1.1');

SELECT * FROM login_process('test@test.com', 'wrong', '192.168.1.1');