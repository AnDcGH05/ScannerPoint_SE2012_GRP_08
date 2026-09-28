package ScannerPoint.example.ScannerPoint.customer.repository;

import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
}