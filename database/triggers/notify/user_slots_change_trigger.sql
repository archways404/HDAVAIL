CREATE TRIGGER user_slots_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_slots
FOR EACH ROW EXECUTE FUNCTION notify_user_slots_change();

-- USAGE

SELECT pg_notify('user_slots_change', 'Manual test notification');