CREATE OR REPLACE FUNCTION cancel_slot_trade(owner_id UUID, slot_id UUID, trade_with_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM user_slot_trades
    WHERE owner_uuid = owner_id AND slot_uuid = slot_id AND trade_with_uuid = trade_with_id;
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT cancel_slot_trade('OWNER_UUID', 'SLOT_UUID', 'TRADE_WITH_UUID');