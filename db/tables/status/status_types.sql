CREATE TABLE status_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL,
    priority BIGINT NOT NULL
);
