package ScannerPoint.example.ScannerPoint.customer.repository;

import ScannerPoint.example.ScannerPoint.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    boolean existsByNicIgnoreCase(String nic);

    List<Customer> findAllByOrderByLastNameAscFirstNameAsc();

    /** Receptionist search box: name, NIC, phone or number plate (returns customer ids). */
    @Query(value = """
            SELECT DISTINCT c.customer_id
            FROM customer c
            LEFT JOIN customer_phone p ON p.customer_id = c.customer_id
            LEFT JOIN vehicle v        ON v.customer_id = c.customer_id
            WHERE CONCAT(c.first_name, ' ', c.last_name) LIKE CONCAT('%', :q, '%')
               OR c.nic LIKE CONCAT('%', :q, '%')
               OR p.phone_no LIKE CONCAT('%', :q, '%')
               OR v.registration_no LIKE CONCAT('%', :q, '%')""", nativeQuery = true)
    List<Integer> searchIds(@Param("q") String q);
}
