CREATE TABLE account_schedule_groups (
    id SERIAL PRIMARY KEY,                                -- Unique ID for each association
    user_id UUID NOT NULL,                                -- References the user account
    group_id UUID NOT NULL,                               -- References the schedule group
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE,
    UNIQUE (user_id, group_id)                            -- Prevent duplicate entries
);