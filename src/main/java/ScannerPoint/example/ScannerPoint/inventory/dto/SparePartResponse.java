package ScannerPoint.example.ScannerPoint.inventory.dto;

public class SparePartResponse {

    private Long id;
    private String partNumber;
    private String name;
    private String description;
    private Double price;
    private Integer quantityInStock;
    private Integer reorderLevel;
    private Boolean isLowStock;
    private Long supplierId;
    String supplierName;

    public SparePartResponse(Long id, String partNumber, String name, String description,
                             Double price, Integer quantityInStock, Integer reorderLevel,
                             Boolean isLowStock, Long supplierId, String supplierName) {
        this.id = id;
        this.partNumber = partNumber;
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantityInStock = quantityInStock;
        this.reorderLevel = reorderLevel;
        this.isLowStock = isLowStock;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
    }

    public Long getId() { return id; }
    public String getPartNumber() { return partNumber; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Double getPrice() { return price; }
    public Integer getQuantityInStock() { return quantityInStock; }
    public Integer getReorderLevel() { return reorderLevel; }
    public Boolean getIsLowStock() { return isLowStock; }
    public Long getSupplierId() { return supplierId; }
    public String getSupplierName() { return supplierName; }
}