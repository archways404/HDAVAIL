CREATE TABLE status_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),     -- Unique identifier for each message
    message TEXT NOT NULL,                             -- The message content
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error')),  -- Message type (info, warning, error)
    active BOOLEAN NOT NULL DEFAULT TRUE,              -- Indicates whether the message is currently active
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- When the message was created
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- When the message was last updated
);
