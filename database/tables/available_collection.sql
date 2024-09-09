CREATE TABLE available_collection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique identifier for each entry
    user_uuid UUID NOT NULL,                        -- Reference to users.uuid
    availability_uuid UUID NOT NULL,                -- Reference to availability.uuid
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp of insertion
    CONSTRAINT fk_user
        FOREIGN KEY (user_uuid) 
        REFERENCES users(uuid) 
        ON DELETE CASCADE,  -- If a user is deleted, delete associated records
    CONSTRAINT fk_availability
        FOREIGN KEY (availability_uuid)
        REFERENCES availability(uuid)
        ON DELETE CASCADE   -- If availability is deleted, delete associated records
);
