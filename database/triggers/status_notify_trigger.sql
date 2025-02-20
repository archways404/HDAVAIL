-- Create a trigger for INSERT, UPDATE, DELETE on the `status` table
DROP TRIGGER IF EXISTS status_notify_trigger ON status;
CREATE TRIGGER status_changes_trigger
AFTER INSERT OR UPDATE OR DELETE
ON status
FOR EACH ROW
EXECUTE FUNCTION notify_status_change();