package ScannerPoint.example.ScannerPoint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class ScannerPointApplication {

	public static void main(String[] args) {
		// Booking times, the 24-hour cancellation rule and reminders all use Sri Lankan time,
		// whatever time zone the laptop running the server is set to.
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Colombo"));
		SpringApplication.run(ScannerPointApplication.class, args);
	}

}
