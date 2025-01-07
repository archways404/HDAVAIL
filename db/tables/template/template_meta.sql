CREATE TABLE template_meta (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    private BOOLEAN DEFAULT FALSE NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES account(user_id) ON DELETE CASCADE
);
