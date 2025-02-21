CREATE OR REPLACE FUNCTION get_pending_trades_for_user(user_id UUID)
RETURNS TABLE (
    owner_uuid UUID,
    slot_uuid UUID,
    trade_with_confirmed BOOLEAN,
    requested_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT ust.owner_uuid, ust.slot_uuid, ust.trade_with_confirmed, ust.requested_date
    FROM user_slot_trades ust
    WHERE ust.trade_with_uuid = user_id AND ust.trade_with_confirmed = FALSE;
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT * FROM get_pending_trades_for_user('USER_UUID_HERE');





-- OLD
CREATE OR REPLACE FUNCTION get_pending_trades_for_user(user_id UUID)
RETURNS TABLE (
    owner_uuid UUID,
    slot_uuid UUID,
    trade_with_confirmed BOOLEAN,
    requested_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT owner_uuid, slot_uuid, trade_with_confirmed, requested_date
    FROM user_slot_trades
    WHERE trade_with_uuid = user_id AND trade_with_confirmed = FALSE;
END;
$$ LANGUAGE plpgsql;