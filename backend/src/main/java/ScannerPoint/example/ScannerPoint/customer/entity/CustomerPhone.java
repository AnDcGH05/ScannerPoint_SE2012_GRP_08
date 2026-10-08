package ScannerPoint.example.ScannerPoint.customer.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.util.Objects;

/** One row of CUSTOMER_PHONE – the multivalued "phone" attribute of CUSTOMER. */
@Embeddable
public class CustomerPhone {

    @Column(name = "phone_no", nullable = false, length = 10)
    private String phoneNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "phone_type", nullable = false)
    private PhoneType phoneType = PhoneType.MOBILE;

    protected CustomerPhone() {
    }

    public CustomerPhone(String phoneNo, PhoneType phoneType) {
        this.phoneNo = phoneNo;
        this.phoneType = phoneType == null ? PhoneType.MOBILE : phoneType;
    }

    public String getPhoneNo() { return phoneNo; }
    public PhoneType getPhoneType() { return phoneType; }

    @Override
    public boolean equals(Object o) {
        return o instanceof CustomerPhone other && Objects.equals(phoneNo, other.phoneNo);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(phoneNo);
    }
}
