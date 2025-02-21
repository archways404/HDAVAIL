CREATE TABLE template_entries (
    template_entry_id SERIAL PRIMARY KEY, -- Optional: unique identifier for entries
    template_id UUID NOT NULL REFERENCES templates(template_id) ON DELETE CASCADE,
    slot_type UUID NOT NULL REFERENCES slot_types(slot_id) ON DELETE CASCADE,
    weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7), -- 1 = Monday, 7 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);
