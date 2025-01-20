CREATE TABLE user_slots (
    user_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
    slot_uuid UUID REFERENCES slots(uuid) ON DELETE CASCADE,
    PRIMARY KEY (user_uuid, slot_uuid)
);