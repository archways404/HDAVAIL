CREATE TABLE available_for_shift (
    id BIGSERIAL PRIMARY KEY,
    shift_type_id UUID NOT NULL,
    user_id UUID NOT NULL,
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE
);
