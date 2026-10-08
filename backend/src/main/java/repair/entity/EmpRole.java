package ScannerPoint.example.ScannerPoint.repair.entity;

import ScannerPoint.example.ScannerPoint.user.entity.Role;

/** Disjoint specialisation of EMPLOYEE, stored in employee.emp_role. */
public enum EmpRole {
    RECEPTIONIST, MECHANIC, STOREKEEPER, ADMIN;

    public Role toRole() {
        return Role.valueOf(name());
    }
}
