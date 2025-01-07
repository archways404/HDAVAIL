CREATE TABLE templates (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique identifier for each shift
    template_id UUID NOT NULL,                            -- References template_meta
    shift_type_id UUID NOT NULL,                          -- References shift_types
    weekday INT NOT NULL,                                 -- Day of the week (0 = Sunday, 1 = Monday, ...)
    start_time TIME NOT NULL,                             -- Shift start time
    end_time TIME NOT NULL,                               -- Shift end time
    FOREIGN KEY (template_id) REFERENCES template_meta(template_id) ON DELETE CASCADE, -- Deletes shifts if the template is deleted
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE -- Deletes shifts if the shift type is deleted
);
