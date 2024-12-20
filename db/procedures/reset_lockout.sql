CREATE OR REPLACE PROCEDURE reset_lockout(
    p_user_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE account_lockout
    SET failed_attempts = 0,
        locked = FALSE,
        unlock_time = NULL
    WHERE user_id = p_user_id;
END;
$$;
