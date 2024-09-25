CREATE OR REPLACE FUNCTION get_trade_requests_by_user(owner_id UUID)
RETURNS TABLE (
    slot_uuid UUID,
    trade_with_uuid UUID,
    trade_with_confirmed BOOLEAN,
    requested_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT ust.slot_uuid, ust.trade_with_uuid, ust.trade_with_confirmed, ust.requested_date
    FROM user_slot_trades ust
    WHERE ust.owner_uuid = owner_id;
END;
$$ LANGUAGE plpgsql;

-- USAGE

SELECT * FROM get_trade_requests_by_user('OWNER_UUID_HERE');








-- OLD
CREATE OR REPLACE FUNCTION get_trade_requests_by_user(owner_id UUID)
RETURNS TABLE (
    slot_uuid UUID,
    trade_with_uuid UUID,
    trade_with_confirmed BOOLEAN,
    requested_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT slot_uuid, trade_with_uuid, trade_with_confirmed, requested_date
    FROM user_slot_trades
    WHERE owner_uuid = owner_id;
END;
$$ LANGUAGE plpgsql;