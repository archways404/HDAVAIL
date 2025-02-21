CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE account (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
	notification_email VARCHAR(255) NOT NULL,
    recovery_key VARCHAR(255) UNIQUE,
    role VARCHAR(255) NOT NULL
);

CREATE TABLE account_lockout (
    lockout_id SERIAL PRIMARY KEY,                                       -- Unique ID for each lockout record
    user_id UUID NOT NULL UNIQUE,                                        -- Unique constraint on user_id
    failed_attempts INT DEFAULT 0 NOT NULL,                              -- Number of failed login attempts
    last_failed_ip VARCHAR(45),                                          -- Last IP address for failed login
    locked BOOLEAN DEFAULT FALSE NOT NULL,                               -- Indicates whether the account is locked
    unlock_time TIMESTAMP,                                               -- Time when the account will be unlocked
    last_failed_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                -- Timestamp of the last failed login attempt
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE  -- Ensures lockout records are removed if a user is deleted
);

CREATE TABLE schedule_groups (
    group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique ID for each schedule group
    name VARCHAR(255) NOT NULL,                           -- Name of the schedule group
    description VARCHAR(255)                              -- Optional description of the group
);

CREATE TABLE account_schedule_groups (
    id SERIAL PRIMARY KEY,                                -- Unique ID for each association
    user_id UUID NOT NULL,                                -- References the user account
    group_id UUID NOT NULL,                               -- References the schedule group
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE,
    UNIQUE (user_id, group_id)                            -- Prevent duplicate entries
);

CREATE TABLE auth_logs (
    log_id BIGSERIAL PRIMARY KEY,                   -- Unique log ID
    user_id UUID,                                   -- UUID of the account attempting to log in
    ip_address VARCHAR(45) NOT NULL,                -- IP address of the login attempt
    fingerprint VARCHAR(255) NOT NULL,              -- Device/browser fingerprint
    success BOOLEAN NOT NULL,                       -- Indicates whether the login attempt was successful
    error_message VARCHAR(255),                     -- Error message if login failed (e.g., "wrong password")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of the login attempt
);

CREATE TABLE general_logs (
    log_id BIGSERIAL PRIMARY KEY,                   -- Unique log ID
    user_id UUID,                                   -- UUID of the user performing the action
    action_type VARCHAR(100) NOT NULL,              -- Type of action (e.g., "CREATE", "UPDATE", "DELETE")
    success BOOLEAN NOT NULL,                       -- Indicates whether the action was successful
    error_message VARCHAR(255),                     -- Error message if the action failed
    creation_method VARCHAR(50) NOT NULL,           -- "trigger" or "manual"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the action was logged
);

CREATE TABLE shift_types (
    shift_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_long VARCHAR(255) NOT NULL,
    name_short VARCHAR(100) NOT NULL
);

CREATE TABLE active_shifts (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique ID for each active shift
    shift_type_id UUID NOT NULL,                          -- References the type of the shift
    assigned_to UUID,                                     -- References the user assigned to the shift
    start_time TIME NOT NULL,                             -- Start time of the shift
    end_time TIME NOT NULL,                               -- End time of the shift
    date DATE NOT NULL,                                   -- Date of the shift
    description TEXT,                                     -- Description of the shift (new column)
    schedule_group_id UUID NOT NULL,                      -- References the schedule group for this shift
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES account(user_id) ON DELETE SET NULL,
    FOREIGN KEY (schedule_group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE
);

CREATE TABLE archived_shifts (
    shift_id UUID PRIMARY KEY,                            -- Unique ID for each archived shift
    assigned_to UUID,                                     -- References the user assigned to the shift
    shift_type_id UUID NOT NULL,                          -- References the type of the shift
    start_time TIME NOT NULL,                             -- Start time of the shift
    end_time TIME NOT NULL,                               -- End time of the shift
    date DATE NOT NULL,                                   -- Date of the shift
    schedule_group_id UUID NOT NULL,                      -- References the schedule group for this shift
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES account(user_id) ON DELETE SET NULL,
    FOREIGN KEY (schedule_group_id) REFERENCES schedule_groups(group_id) ON DELETE CASCADE
);

CREATE TABLE available_for_shift (
    id BIGSERIAL PRIMARY KEY,
    shift_id UUID NOT NULL,
    user_id UUID NOT NULL,
    FOREIGN KEY (shift_id) REFERENCES active_shifts(shift_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE
);

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


CREATE TABLE template_meta (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    private BOOLEAN DEFAULT FALSE NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES account(user_id) ON DELETE CASCADE
);

CREATE TABLE templates (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique identifier for each shift
    template_id UUID NOT NULL,                            -- References template_meta
    shift_type_id UUID NOT NULL,                          -- References shift_types
    weekday INT NOT NULL,                                 -- Day of the week (0 = Sunday, 1 = Monday, ...)
    start_time TIME NOT NULL,                             -- Shift start time
    end_time TIME NOT NULL,                               -- Shift end time
    FOREIGN KEY (template_id) REFERENCES template_meta(template_id) ON DELETE CASCADE, -- Deletes shifts if the template is deleted
    FOREIGN KEY (shift_type_id) REFERENCES shift_types(shift_type_id) ON DELETE CASCADE -- Deletes shifts if the shift type is deleted
);

CREATE TABLE status (
    status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    mode VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remove_at TIMESTAMP,
    visible BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

CREATE OR REPLACE FUNCTION notify_active_shifts_change() 
RETURNS trigger AS $$
DECLARE
    payload text;
BEGIN
    -- Build a JSON payload with the schedule_group_id depending on the operation
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        payload := json_build_object('schedule_group_id', NEW.schedule_group_id)::text;
    ELSIF (TG_OP = 'DELETE') THEN
        payload := json_build_object('schedule_group_id', OLD.schedule_group_id)::text;
    END IF;
    
    -- Send the notification on the 'active_shifts_channel'
    PERFORM pg_notify('active_shifts_channel', payload);
    
    -- For AFTER triggers, you typically return NULL
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to notify changes
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('status_channel', row_to_json(NEW)::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update `updated_at` automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER active_shifts_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON active_shifts
FOR EACH ROW 
EXECUTE FUNCTION notify_active_shifts_change();

-- Create a trigger for INSERT, UPDATE, DELETE on the `status` table
DROP TRIGGER IF EXISTS status_notify_trigger ON status;
CREATE TRIGGER status_changes_trigger
AFTER INSERT OR UPDATE OR DELETE
ON status
FOR EACH ROW
EXECUTE FUNCTION notify_status_change();

-- Create trigger to call function before every update
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON status
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();













