CREATE OR REPLACE FUNCTION delete_slot_type(p_slot_id UUID) RETURNS VOID AS $$
BEGIN
    -- Attempt to delete the slot type
    DELETE FROM slot_types
    WHERE slot_id = p_slot_id;

    -- Optionally, you can check if the delete occurred and raise an exception if it did not
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Slot type with ID % does not exist', p_slot_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- USAGE

SELECT delete_slot_type('your-slot-id-here');