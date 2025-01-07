CREATE TABLE status (
    status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status_type UUID NOT NULL,
    message VARCHAR(255) NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated TIMESTAMP,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    FOREIGN KEY (status_type) REFERENCES status_types(id) ON DELETE CASCADE
);
