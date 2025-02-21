CREATE TRIGGER active_shifts_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON active_shifts
FOR EACH ROW 
EXECUTE FUNCTION notify_active_shifts_change();