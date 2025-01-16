CREATE TABLE active_shifts (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique ID for each active shift
    shift_type_id UUID NOT NULL,                          -- References the type of the shift
    assigned_to UUID,                                     -- References the user assigned to the shift
    start_time TIME NOT NULL,                             -- Start time of the shift
    end_time TIME NOT NULL,                               -- End time of the shift
    date DATE NOT NULL,                                   -- Date of the shift
    schedule_group_id UUID NOT NULL,                      -- References the schedule group for this shift
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES account(user_id) ON DELETE SET NULL,
    FOREIGN KEY (schedule_group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE
);
