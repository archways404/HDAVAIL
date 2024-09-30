CREATE TRIGGER slots_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON slots
FOR EACH ROW EXECUTE FUNCTION notify_slots_change();

-- USAGE

SELECT pg_notify('slots_change', 'Manual test notification');
