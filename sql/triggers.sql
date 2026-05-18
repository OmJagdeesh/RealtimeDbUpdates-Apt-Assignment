CREATE OR REPLACE FUNCTION notify_order_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_payload JSON;
BEGIN
  notification_payload = json_build_object(
    'operation', TG_OP,
    'order', CASE
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
      ELSE row_to_json(NEW)
    END,
    'timestamp', NOW()
  );

  PERFORM pg_notify('orders_changes', notification_payload::text);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_notify_change ON orders;

CREATE TRIGGER orders_notify_change
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_change();
