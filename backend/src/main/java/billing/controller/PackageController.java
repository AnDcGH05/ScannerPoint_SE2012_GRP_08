package billing.controller;

import ScannerPoint.example.ScannerPoint.billing.dto.PackageRequest;
import ScannerPoint.example.ScannerPoint.billing.dto.PackageResponse;
import ScannerPoint.example.ScannerPoint.billing.service.PackageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    private final PackageService packageService;

    public PackageController(PackageService packageService) {
        this.packageService = packageService;
    }

    /** Public: the package cards on the booking wizard. */
    @GetMapping
    public List<PackageResponse> active() {
        return packageService.list(false);
    }

    @GetMapping("/{id}")
    public PackageResponse get(@PathVariable Integer id) {
        return packageService.get(id);
    }

    /** Admin page shows inactive packages too. */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PackageResponse> all() {
        return packageService.list(true);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public PackageResponse create(@Valid @RequestBody PackageRequest request) {
        return packageService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PackageResponse update(@PathVariable Integer id, @Valid @RequestBody PackageRequest request) {
        return packageService.update(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public PackageResponse deactivate(@PathVariable Integer id) {
        return packageService.setActive(id, false);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public PackageResponse activate(@PathVariable Integer id) {
        return packageService.setActive(id, true);
    }
}
