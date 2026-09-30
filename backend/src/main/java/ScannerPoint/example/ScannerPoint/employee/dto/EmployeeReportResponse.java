package ScannerPoint.example.ScannerPoint.employee.dto;

import java.util.List;

public class EmployeeReportResponse {

    private Double totalRevenue;      // from billing payments
    private Double totalSalaryPaid;   // from salary payments
    private Double netIncome;         // revenue - salaries
    private Double monthlyPayroll;    // sum of salaries of active employees
    private Long activeEmployees;
    private List<EmployeeRow> employees;

    public EmployeeReportResponse(Double totalRevenue, Double totalSalaryPaid, Double netIncome,
                                  Double monthlyPayroll, Long activeEmployees, List<EmployeeRow> employees) {
        this.totalRevenue = totalRevenue;
        this.totalSalaryPaid = totalSalaryPaid;
        this.netIncome = netIncome;
        this.monthlyPayroll = monthlyPayroll;
        this.activeEmployees = activeEmployees;
        this.employees = employees;
    }

    public Double getTotalRevenue() { return totalRevenue; }
    public Double getTotalSalaryPaid() { return totalSalaryPaid; }
    public Double getNetIncome() { return netIncome; }
    public Double getMonthlyPayroll() { return monthlyPayroll; }
    public Long getActiveEmployees() { return activeEmployees; }
    public List<EmployeeRow> getEmployees() { return employees; }

    public static class EmployeeRow {
        private Long employeeId;
        private String fullName;
        private String position;
        private Boolean active;
        private Long jobCardsAssigned;
        private Long jobCardsCompleted;
        private Double salaryPaid;

        public EmployeeRow(Long employeeId, String fullName, String position, Boolean active,
                           Long jobCardsAssigned, Long jobCardsCompleted, Double salaryPaid) {
            this.employeeId = employeeId;
            this.fullName = fullName;
            this.position = position;
            this.active = active;
            this.jobCardsAssigned = jobCardsAssigned;
            this.jobCardsCompleted = jobCardsCompleted;
            this.salaryPaid = salaryPaid;
        }

        public Long getEmployeeId() { return employeeId; }
        public String getFullName() { return fullName; }
        public String getPosition() { return position; }
        public Boolean getActive() { return active; }
        public Long getJobCardsAssigned() { return jobCardsAssigned; }
        public Long getJobCardsCompleted() { return jobCardsCompleted; }
        public Double getSalaryPaid() { return salaryPaid; }
    }
}
