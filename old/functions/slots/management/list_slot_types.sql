CREATE OR REPLACE FUNCTION list_slot_types() RETURNS TABLE (
    slot_id UUID,
    slot_name_short VARCHAR,
    slot_name_long VARCHAR
) AS $$
BEGIN
    -- Use table alias to avoid ambiguity
    RETURN QUERY 
    SELECT st.slot_id, st.slot_name_short, st.slot_name_long 
    FROM slot_types st;
END;
$$ LANGUAGE plpgsql;



-- USAGE

SELECT * FROM list_slot_types();