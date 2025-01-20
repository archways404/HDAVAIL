CREATE TABLE general_logs (
    log_id BIGSERIAL PRIMARY KEY,                   -- Unique log ID
    user_id UUID,                                   -- UUID of the user performing the action
    action_type VARCHAR(100) NOT NULL,              -- Type of action (e.g., "CREATE", "UPDATE", "DELETE")
    success BOOLEAN NOT NULL,                       -- Indicates whether the action was successful
    error_message VARCHAR(255),                     -- Error message if the action failed
    creation_method VARCHAR(50) NOT NULL,           -- "trigger" or "manual"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the action was logged
);
