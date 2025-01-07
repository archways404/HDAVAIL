CREATE TABLE shift_types (
    shift_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_long VARCHAR(255) NOT NULL,
    name_short VARCHAR(100) NOT NULL
);
