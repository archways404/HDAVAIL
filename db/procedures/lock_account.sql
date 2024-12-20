CREATE OR REPLACE PROCEDURE lock_account(
    p_user_id UUID,
    p_lock_duration INTERVAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE account_lockout
    SET locked = TRUE,
        unlock_time = CURRENT_TIMESTAMP + p_lock_duration
    WHERE user_id = p_user_id;
END;
$$;


-- EXAMPLE

CALL lock_account('user-uuid', INTERVAL '15 minutes');