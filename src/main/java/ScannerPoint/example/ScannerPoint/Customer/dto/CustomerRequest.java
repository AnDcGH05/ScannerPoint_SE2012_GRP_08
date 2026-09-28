package ScannerPoint.example.ScannerPoint.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CustomerRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Email
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String address;

    public CustomerRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}