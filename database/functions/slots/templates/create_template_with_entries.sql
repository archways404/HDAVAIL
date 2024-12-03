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
        INSERT INTO template_entries (template_id, slot_type, start_date, end_date)
        VALUES (
            v_template_id,
            (entry->>'slot_type')::UUID,
            (entry->>'start_date')::TIMESTAMP,
            (entry->>'end_date')::TIMESTAMP
        );
    END LOOP;

    -- Return the ID of the newly created template
    RETURN v_template_id;
END;
$$ LANGUAGE plpgsql;



-- USAGE

SELECT create_template_with_entries(
    '5e2eba4c-e6d6-4619-818f-0d7e1a0296c2', -- Template owner ID
    'TestTemplate 1',                       -- Template name
    TRUE,                                   -- Private
    '[{"slot_type": "35ff055a-98cb-4f2e-9271-8ab1489652f3",
       "start_date": "2024-12-01T08:00:00",
       "end_date": "2024-12-01T10:00:00"},
      {"slot_type": "35ff055a-98cb-4f2e-9271-8ab1489652f3",
       "start_date": "2024-12-01T10:00:00",
       "end_date": "2024-12-01T12:00:00"}]'::JSONB -- Entries JSONB
);

