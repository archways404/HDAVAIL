CREATE OR REPLACE FUNCTION request_slot_trade(owner_id UUID, slot_id UUID, trade_with_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_slot_trades (owner_uuid, slot_uuid, trade_with_uuid, trade_with_confirmed, requested_date)
    VALUES (owner_id, slot_id, trade_with_id, FALSE, NOW())
    ON CONFLICT DO NOTHING;  -- Avoid duplicate trade requests
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT request_slot_trade('OWNER_UUID', 'SLOT_UUID', 'TRADE_WITH_UUID');
