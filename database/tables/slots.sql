CREATE TABLE slots (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_type VARCHAR(50) NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_modified TIMESTAMPTZ NULL
);
