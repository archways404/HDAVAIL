CREATE OR REPLACE FUNCTION auto_create_slots(input_data JSONB)
RETURNS VOID AS $$
DECLARE
    slot_data JSONB;
    slot_shift_type VARCHAR(50);
    slot_date DATE;
    slot_start_time TIME;
    slot_end_time TIME;
BEGIN
    -- Loop through each item in the JSONB array
    FOR slot_data IN SELECT * FROM jsonb_array_elements(input_data)
    LOOP
        -- Extract necessary values from JSONB object
        slot_shift_type := slot_data->>'location'; -- using "location" field for shift_type
        slot_date := (slot_data->>'date')::DATE;
        slot_start_time := (slot_data->>'start_time')::TIME;
        slot_end_time := (slot_data->>'end_time')::TIME;
        
        -- Insert into slots table
        INSERT INTO slots (shift_type, shift_date, start_time, end_time, created, last_modified)
        VALUES (slot_shift_type, slot_date, slot_start_time, slot_end_time, NOW(), NULL);
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- USAGE

SELECT auto_create_slots('[
  {
    "uid": "20240809_000000161",
    "moment": "Ledig",
    "location": "Teknikutlåning",
    "date": "2024-09-24",
    "start_time": "07:00:00.000Z",
    "end_time": "11:00:00.000Z",
    "hours": "4.0",
    "created_date": "2024-08-09",
    "created_time": "08:34:50.000Z",
    "last_modified_date": "2024-09-19",
    "last_modified_time": "07:28:58.000Z"
  },
  {
    "uid": "20240809_000000077",
    "moment": "Ledig",
    "location": "HDORKBIBA",
    "date": "2024-09-26",
    "start_time": "10:30:00.000Z",
    "end_time": "15:00:00.000Z",
    "hours": "4.5",
    "created_date": "2024-08-09",
    "created_time": "08:26:57.000Z",
    "last_modified_date": "2024-08-09",
    "last_modified_time": "08:26:57.000Z"
  }
]'::JSONB);
