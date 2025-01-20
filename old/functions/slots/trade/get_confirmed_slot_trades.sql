CREATE OR REPLACE FUNCTION get_confirmed_slot_trades()
RETURNS TABLE (
    owner_uuid UUID,
    slot_uuid UUID,
    trade_with_uuid UUID,
    requested_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT ust.owner_uuid, ust.slot_uuid, ust.trade_with_uuid, ust.requested_date
    FROM user_slot_trades ust
    WHERE ust.trade_with_confirmed = TRUE;
END;
$$ LANGUAGE plpgsql;



-- USAGE

SELECT * FROM get_confirmed_slot_trades();
