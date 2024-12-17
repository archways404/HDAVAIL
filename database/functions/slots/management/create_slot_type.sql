CREATE OR REPLACE FUNCTION create_slot_type(
    p_slot_name_short VARCHAR(50),
    p_slot_name_long VARCHAR(255)
) RETURNS UUID AS $$
DECLARE
    v_slot_id UUID;
BEGIN
    -- Insert the new slot type into the table
    INSERT INTO slot_types (slot_name_short, slot_name_long)
    VALUES (p_slot_name_short, p_slot_name_long)
    RETURNING slot_id INTO v_slot_id;

    -- Return the generated UUID of the new slot type
    RETURN v_slot_id;
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT create_slot_type('Short Name', 'Long Name');
