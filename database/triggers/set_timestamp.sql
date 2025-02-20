-- Create trigger to call function before every update
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON status
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();