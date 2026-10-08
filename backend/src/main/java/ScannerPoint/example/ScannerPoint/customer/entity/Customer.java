package ScannerPoint.example.ScannerPoint.customer.entity;

import ScannerPoint.example.ScannerPoint.user.entity.Role;
import ScannerPoint.example.ScannerPoint.user.entity.UserAccount;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

/** CUSTOMER – subclass of USER_ACCOUNT (customer_id = user_id). */
@Entity
@Table(name = "customer")
@DiscriminatorValue("CUSTOMER")
@PrimaryKeyJoinColumn(name = "customer_id")
public class Customer extends UserAccount {

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 12)
    private String nic;

    @Column(nullable = false, length = 100)
    private String street;

    @Column(nullable = false, length = 50)
    private String city;

    @Column(name = "postal_code", length = 5)
    private String postalCode;

    @Column(name = "registered_date", nullable = false)
    private LocalDate registeredDate = LocalDate.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "customer_phone", joinColumns = @JoinColumn(name = "customer_id"))
    private Set<CustomerPhone> phones = new LinkedHashSet<>();

    @Override
    public Role getRole() {
        return Role.CUSTOMER;
    }

    @Override
    public String getFullName() {
        return firstName + " " + lastName;
    }

    /** The first mobile number, used for SMS. */
    public String getMobile() {
        return phones.stream()
                .filter(p -> p.getPhoneType() == PhoneType.MOBILE)
                .map(CustomerPhone::getPhoneNo)
                .findFirst()
                .orElse(phones.stream().map(CustomerPhone::getPhoneNo).findFirst().orElse(null));
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public LocalDate getRegisteredDate() { return registeredDate; }
    public void setRegisteredDate(LocalDate registeredDate) { this.registeredDate = registeredDate; }
    public Set<CustomerPhone> getPhones() { return phones; }
    public void setPhones(Set<CustomerPhone> phones) { this.phones = phones; }
}
