CREATE TABLE template_entries (
    template_entry_id SERIAL PRIMARY KEY, -- Optional: unique identifier for entries
    template_id UUID NOT NULL REFERENCES templates(template_id) ON DELETE CASCADE,
    slot_type UUID NOT NULL REFERENCES slot_types(slot_id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    CONSTRAINT valid_time_range CHECK (end_date > start_date)
);