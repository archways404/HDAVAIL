CREATE TABLE auth_logs (
    log_id BIGSERIAL PRIMARY KEY,                   -- Unique log ID
    user_id UUID,                                   -- UUID of the account attempting to log in
    ip_address VARCHAR(45) NOT NULL,                -- IP address of the login attempt
    fingerprint VARCHAR(255) NOT NULL,              -- Device/browser fingerprint
    success BOOLEAN NOT NULL,                       -- Indicates whether the login attempt was successful
    error_message VARCHAR(255),                     -- Error message if login failed (e.g., "wrong password")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of the login attempt
);
