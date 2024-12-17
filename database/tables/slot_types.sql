CREATE TABLE slot_types (
    slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_name_short VARCHAR(50) NOT NULL,
    slot_name_long VARCHAR(255) NOT NULL
);