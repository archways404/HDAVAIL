CREATE TABLE shift_trades (
    trade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    req_user_id UUID NOT NULL,
    rec_user_id UUID NOT NULL,
    shift_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (req_user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (rec_user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES active_shifts(shift_id) ON DELETE CASCADE
);
