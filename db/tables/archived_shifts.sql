CREATE TABLE archived_shifts (
    shift_id UUID PRIMARY KEY,
    assigned_to UUID,
    shift_type_id UUID NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES account(user_id) ON DELETE SET NULL
);
