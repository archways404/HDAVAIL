CREATE OR REPLACE PROCEDURE execute_trade(owner_id UUID, slot_id UUID, trade_with_id UUID)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Start transaction (implicitly handled within a procedure)
    
    -- Assign the slot to the trade_with_id (the new owner)
    INSERT INTO user_slots (user_uuid, slot_uuid)
    VALUES (trade_with_id, slot_id)
    ON CONFLICT DO NOTHING;  -- Prevents duplicate entries if already assigned
    
    -- Remove the original owner from the slot
    DELETE FROM user_slots
    WHERE user_uuid = owner_id AND slot_uuid = slot_id;

    -- Commit transaction (implicitly handled)
END;
$$;


-- USAGE

CALL execute_trade('OWNER_UUID', 'SLOT_UUID', 'TRADE_WITH_UUID');
