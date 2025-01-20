CREATE TABLE templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_owner_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
    template_name VARCHAR(255) UNIQUE NOT NULL,
    private BOOLEAN NOT NULL DEFAULT FALSE
);