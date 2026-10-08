package billing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** SERVICE_TYPE – the three service packages customers choose from. */
@Entity
@Table(name = "service_type")
public class ServiceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_type_id")
    private Integer id;

    @Column(name = "service_name", nullable = false, unique = true, length = 60)
    private String name;

    @Column(name = "includes_work", nullable = false, length = 255)
    private String includesWork;

    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_type", nullable = false)
    private PricingType pricingType;

    /** Package price, or the diagnostic fee for a VARIABLE package. */
    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "deposit_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal depositPercent = new BigDecimal("50.00");

    /** Per hour, for approved additional work. */
    @Column(name = "labour_rate", nullable = false, precision = 8, scale = 2)
    private BigDecimal labourRate;

    @Column(name = "service_interval_km")
    private Integer serviceIntervalKm;

    @Column(name = "service_interval_months", columnDefinition = "tinyint unsigned")
    private Integer serviceIntervalMonths;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    /** The deposit a customer pays when booking (50% of the price or diagnostic fee). */
    public BigDecimal depositAmount() {
        return basePrice.multiply(depositPercent).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIncludesWork() { return includesWork; }
    public void setIncludesWork(String includesWork) { this.includesWork = includesWork; }
    public PricingType getPricingType() { return pricingType; }
    public void setPricingType(PricingType pricingType) { this.pricingType = pricingType; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public BigDecimal getDepositPercent() { return depositPercent; }
    public void setDepositPercent(BigDecimal depositPercent) { this.depositPercent = depositPercent; }
    public BigDecimal getLabourRate() { return labourRate; }
    public void setLabourRate(BigDecimal labourRate) { this.labourRate = labourRate; }
    public Integer getServiceIntervalKm() { return serviceIntervalKm; }
    public void setServiceIntervalKm(Integer serviceIntervalKm) { this.serviceIntervalKm = serviceIntervalKm; }
    public Integer getServiceIntervalMonths() { return serviceIntervalMonths; }
    public void setServiceIntervalMonths(Integer serviceIntervalMonths) { this.serviceIntervalMonths = serviceIntervalMonths; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
