package ScannerPoint.example.ScannerPoint.inventory.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

/**
 * Observer pattern: the stock services only publish a LowStockEvent; this listener
 * (the observer) reacts to it. It runs after the transaction commits, keeps the latest
 * alerts for the storekeeper/admin dashboards and logs a message for the storekeeper.
 * More observers (e.g. an e-mail sender) can be added without touching the stock code.
 */
@Component
public class LowStockAlertListener {

    private static final Logger log = LoggerFactory.getLogger(LowStockAlertListener.class);
    private static final int MAX_ALERTS = 50;

    private final Deque<Alert> alerts = new ArrayDeque<>();

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onLowStock(LowStockEvent e) {
        Alert alert = new Alert(e.partId(), e.partCode(), e.partName(), e.inStock(), e.reorderLevel(), LocalDateTime.now());
        synchronized (alerts) {
            alerts.removeIf(a -> a.partId().equals(e.partId()));
            alerts.addFirst(alert);
            while (alerts.size() > MAX_ALERTS) {
                alerts.removeLast();
            }
        }
        log.warn("[Low stock] {} {} - {} left (re-order level {}). Storekeeper notified.",
                e.partCode(), e.partName(), e.inStock(), e.reorderLevel());
    }

    public List<Alert> latest() {
        synchronized (alerts) {
            return new ArrayList<>(alerts);
        }
    }

    public record Alert(Integer partId, String partCode, String partName, int inStock, int reorderLevel,
                        LocalDateTime raisedAt) {
    }
}
