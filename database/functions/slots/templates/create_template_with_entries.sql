CREATE OR REPLACE FUNCTION create_template_with_entries(
    p_template_owner_id UUID,
    p_template_name VARCHAR(255),
    p_private BOOLEAN,
    p_entries JSONB
) RETURNS UUID AS $$
DECLARE
    v_template_id UUID;
    entry JSONB; -- Declare the loop variable as JSONB
BEGIN
    -- Insert the new template into the templates table
    INSERT INTO templates (template_owner_id, template_name, private)
    VALUES (p_template_owner_id, p_template_name, p_private)
    RETURNING template_id INTO v_template_id;

    -- Loop through the JSONB array of entries to insert into template_entries
    FOR entry IN SELECT jsonb_array_elements(p_entries) LOOP
        INSERT INTO template_entries (template_id, slot_type, weekday, start_time, end_time)
        VALUES (
            v_template_id,
            (entry->>'slot_type')::UUID,
            (entry->>'weekday')::SMALLINT,
            (entry->>'start_time')::TIME,
            (entry->>'end_time')::TIME
        );
    END LOOP;

    -- Return the ID of the newly created template
    RETURN v_template_id;
END;
$$ LANGUAGE plpgsql;




-- USAGE

SELECT create_template_with_entries(
    '5e2eba4c-e6d6-4619-818f-0d7e1a0296c2', -- Template owner ID
    'TestTemplate 3',                       -- Template name
    TRUE,                                   -- Private
    '[{"slot_type": "35ff055a-98cb-4f2e-9271-8ab1489652f3",
       "weekday": 1,
        "start_time": "09:00:00",
        "end_time": "11:00:00"},
      {"slot_type": "35ff055a-98cb-4f2e-9271-8ab1489652f3",
       "weekday": 7,  
        "start_time": "14:00:00",
        "end_time": "16:00:00"}]'::JSONB -- Entries JSONB
);

