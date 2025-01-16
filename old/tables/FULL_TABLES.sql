CREATE TABLE users (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    reset_token VARCHAR(255) UNIQUE
);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE slots (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_type VARCHAR(50) NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_modified TIMESTAMPTZ NULL
);

CREATE TABLE user_slots (
    user_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
    slot_uuid UUID REFERENCES slots(uuid) ON DELETE CASCADE,
    PRIMARY KEY (user_uuid, slot_uuid)
);

CREATE TABLE slot_types (
    slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_name_short VARCHAR(50) NOT NULL,
    slot_name_long VARCHAR(255) NOT NULL
);

CREATE TABLE user_slot_trades (
    owner_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
    slot_uuid UUID REFERENCES slots(uuid) ON DELETE CASCADE,
    trade_with_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
    trade_with_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    requested_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (owner_uuid, slot_uuid, trade_with_uuid)
);

CREATE TABLE user_availability (
    user_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
    slot_uuid UUID REFERENCES slots(uuid) ON DELETE CASCADE,
    PRIMARY KEY (user_uuid, slot_uuid)
);

CREATE TABLE template_entries (
    template_entry_id SERIAL PRIMARY KEY, -- Optional: unique identifier for entries
    template_id UUID NOT NULL REFERENCES templates(template_id) ON DELETE CASCADE,
    slot_type UUID NOT NULL REFERENCES slot_types(slot_id) ON DELETE CASCADE,
    weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7), -- 1 = Monday, 7 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE TABLE status_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),     -- Unique identifier for each message
    message TEXT NOT NULL,                             -- The message content
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error')),  -- Message type (info, warning, error)
    active BOOLEAN NOT NULL DEFAULT TRUE,              -- Indicates whether the message is currently active
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- When the message was created
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- When the message was last updated
);





