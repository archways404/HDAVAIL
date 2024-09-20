CREATE OR REPLACE FUNCTION execute_slot_trade()
RETURNS TRIGGER AS $$
BEGIN
    -- Only perform the swap if trade_with_confirmed is set to TRUE
    IF NEW.trade_with_confirmed = TRUE THEN
        -- Remove the owner from the slot in user_slots
        DELETE FROM user_slots
        WHERE user_uuid = NEW.owner_uuid AND slot_uuid = NEW.slot_uuid;
        
        -- Assign the owner’s slot to the user they traded with
        INSERT INTO user_slots (user_uuid, slot_uuid)
        VALUES (NEW.trade_with_uuid, NEW.slot_uuid);

        -- Remove the user from the slot in user_slots
        DELETE FROM user_slots
        WHERE user_uuid = NEW.trade_with_uuid AND slot_uuid = NEW.slot_uuid;

        -- Assign the traded slot to the original owner
        INSERT INTO user_slots (user_uuid, slot_uuid)
        VALUES (NEW.owner_uuid, NEW.slot_uuid);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
