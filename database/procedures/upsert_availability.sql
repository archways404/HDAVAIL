CREATE OR REPLACE PROCEDURE upsert_availability(
    p_kronox_uuid VARCHAR,
    p_available BOOLEAN,
    p_type VARCHAR,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_kronox_created_date DATE,
    p_kronox_created_time TIME,
    p_kronox_last_modified_date DATE,
    p_kronox_last_modified_time TIME
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if a matching record exists
    IF EXISTS (
        SELECT 1
        FROM availability
        WHERE kronox_uuid = p_kronox_uuid
        AND type = p_type
        AND date = p_date
        AND start_time = p_start_time
        AND end_time = p_end_time
    ) THEN
        -- Update the existing record if there's a difference
        UPDATE availability
        SET available = p_available,
            kronox_created_date = p_kronox_created_date,
            kronox_created_time = p_kronox_created_time,
            kronox_last_modified_date = p_kronox_last_modified_date,
            kronox_last_modified_time = p_kronox_last_modified_time,
            database_last_modified_date = CURRENT_DATE,
            database_last_modified_time = CURRENT_TIME
        WHERE kronox_uuid = p_kronox_uuid
        AND type = p_type
        AND date = p_date
        AND start_time = p_start_time
        AND end_time = p_end_time;

    ELSE
        -- Insert a new record
        INSERT INTO availability (
            kronox_uuid, available, type, date, start_time, end_time, 
            kronox_created_date, kronox_created_time, 
            kronox_last_modified_date, kronox_last_modified_time,
            database_created_date, database_created_time,
            database_last_modified_date, database_last_modified_time
        )
        VALUES (
            p_kronox_uuid, p_available, p_type, p_date, p_start_time, p_end_time,
            p_kronox_created_date, p_kronox_created_time, 
            p_kronox_last_modified_date, p_kronox_last_modified_time,
            CURRENT_DATE, CURRENT_TIME, CURRENT_DATE, CURRENT_TIME
        );
    END IF;
END $$;



-- USAGE

-- EXAMPLE USAGE (SHOULD RUN AUTOMATICALLY)

CALL upsert_availability(
    '20240603_000000791',    -- kronox_uuid
    TRUE,                    -- available
    'HDORKBIBB',             -- type
    '2024-09-09',            -- date
    '11:00:00',              -- start_time
    '15:00:00',              -- end_time
    '2024-06-03',     	     -- kronox_created_date
    '13:04:50',              -- kronox_created_time
    '2024-09-08',            -- kronox_last_modified_date
    '07:33:48'               -- kronox_last_modified_time
);