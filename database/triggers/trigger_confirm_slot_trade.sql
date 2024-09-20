CREATE TRIGGER trigger_confirm_slot_trade
AFTER UPDATE OF trade_with_confirmed
ON user_slot_trades
FOR EACH ROW
WHEN (NEW.trade_with_confirmed = TRUE)
EXECUTE FUNCTION execute_slot_trade();
