CREATE TABLE availability (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique identifier
    kronox_uuid VARCHAR(255) NOT NULL,                -- Kronox unique identifier
    available BOOLEAN NOT NULL,                       -- Availability flag
    type VARCHAR(50) NOT NULL,                        -- Type field
    date DATE NOT NULL,                               -- Date of availability
    start_time TIME NOT NULL,                         -- Start time
    end_time TIME NOT NULL,                           -- End time
    kronox_created_date DATE NOT NULL,                -- Date created in Kronox
    kronox_created_time TIME NOT NULL,                -- Time created in Kronox
    kronox_last_modified_date DATE NOT NULL,          -- Last modified date in Kronox
    kronox_last_modified_time TIME NOT NULL,          -- Last modified time in Kronox
    database_created_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- Record created date in DB
    database_created_time TIME NOT NULL DEFAULT CURRENT_TIME,  -- Record created time in DB
    database_last_modified_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- Last modified date in DB
    database_last_modified_time TIME NOT NULL DEFAULT CURRENT_TIME   -- Last modified time in DB
);
