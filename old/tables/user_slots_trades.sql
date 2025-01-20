CREATE TABLE user_slot_trades (
    owner_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
    slot_uuid UUID REFERENCES slots(uuid) ON DELETE CASCADE,
    trade_with_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
    trade_with_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    requested_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (owner_uuid, slot_uuid, trade_with_uuid)
);
