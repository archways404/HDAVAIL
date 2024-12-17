CREATE OR REPLACE FUNCTION get_template_entries(p_template_id UUID)
RETURNS TABLE (
    template_entry_id INTEGER,
    template_name VARCHAR,
    template_owner_name VARCHAR,
    template_owner_username VARCHAR,
    slot_name_short VARCHAR,
    slot_name_long VARCHAR,
    weekday SMALLINT,
    start_time TIME,
    end_time TIME
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        te.template_entry_id,
        t.template_name,
        (u.first_name || ' ' || u.last_name)::VARCHAR AS template_owner_name,
        u.username AS template_owner_username,
        st.slot_name_short,
        st.slot_name_long,
        te.weekday,
        te.start_time,
        te.end_time
    FROM template_entries te
    JOIN templates t ON te.template_id = t.template_id
    JOIN users u ON t.template_owner_id = u.uuid
    JOIN slot_types st ON te.slot_type = st.slot_id
    WHERE te.template_id = p_template_id;
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT * FROM get_template_entries('your-template-id-here');





/* SIMPLER
CREATE OR REPLACE FUNCTION get_template_entries(p_template_id UUID)
RETURNS TABLE (
    template_entry_id INTEGER,
    slot_type UUID,
    start_date TIMESTAMP,
    end_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        te.template_entry_id,
        te.slot_type,
        te.start_date,
        te.end_date
    FROM template_entries te
    WHERE te.template_id = p_template_id;
END;
$$ LANGUAGE plpgsql;
*/