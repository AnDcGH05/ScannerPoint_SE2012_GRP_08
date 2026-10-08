package ScannerPoint.example.ScannerPoint.billing.pricing;

import ScannerPoint.example.ScannerPoint.billing.entity.PricingType;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/** Picks the pricing strategy for a package's pricing type. */
@Component
public class PricingStrategyFactory {

    private final Map<PricingType, PricingStrategy> strategies = new EnumMap<>(PricingType.class);

    public PricingStrategyFactory(List<PricingStrategy> all) {
        all.forEach(s -> strategies.put(s.type(), s));
    }

    public PricingStrategy forType(PricingType type) {
        PricingStrategy s = strategies.get(type);
        if (s == null) {
            throw new IllegalStateException("No pricing strategy for " + type);
        }
        return s;
    }
}
