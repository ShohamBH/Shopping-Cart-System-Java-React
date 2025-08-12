package com.example.jpa3_serverside.controller;

import com.example.jpa3_serverside.entites.Companies;
import com.example.jpa3_serverside.entites.Customer;
import com.example.jpa3_serverside.servise.AdminService;
import com.example.jpa3_serverside.servise.CompanyService;
//import com.example.jpa3_serverside.servise.CustomerService;
import com.example.jpa3_serverside.servise.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/Admin")
//@PreAuthorize("hasRole('ADMIN')")

public class AdminController {
    @Autowired
    private AdminService _adminService;
    @Autowired
    private CustomerService _customerService;
    @Autowired
    private CompanyService _companyService;

    @GetMapping( "/getAllCustomer")
    public List<Customer> getAllCustomer() {
        return _adminService.GetAllCustomers();
    }

    @PostMapping("/addCustomer")
    public ResponseEntity<Customer> addCustomer(@RequestBody Customer c) {
        if (_adminService.addCustomer(c)) { // הסר את הנקודה-פסיק והוסף סוגריים מסולסלים לבלוק ה-if
            return ResponseEntity.ok(c);
        } else { // הוסף בלוק else לטיפול במקרה של false
            // הוסף הודעת שגיאה ברורה יותר
            return null;
        }
    }

    @GetMapping("/getCustomerById/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable int id) {
        Customer c = _adminService.getCustomerById(id);
        if (c != null) {
            return ResponseEntity.ok(c);
        } else {
            return ResponseEntity.notFound().build(); // return 404 if the coupon is not found
        }
    }


    @DeleteMapping("/deleteCustomerById/{id}")
//    @PreAuthorize("hasRole('ADMIN')") // Ensure that only ADMIN can access
    public void deleteCustomerById(@PathVariable int id) {
        Customer c = _adminService.getCustomerById(id);
        if (c != null) {
            if (_adminService.deleteCustomerById(id)) {
                System.out.println("Delete Customer Success");
            }
        }
    }


    @PutMapping("/updateCustomer/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable int id, @RequestBody Customer customer) {
        Customer existingCustomer =  _adminService.updateCustomer(id, customer); // חשוב לוודא שזו באמת מבצעת save
        return ResponseEntity.ok(existingCustomer);
    }


    @GetMapping( "/getAllCompany")
    public List<Companies> getAllCompany() {
        return _adminService.GetAllCompanies();
    }

    @GetMapping("/getCompanyById/{id}")
    public ResponseEntity<Companies> getCompanyById(@PathVariable int id) {
        Companies c = _adminService.getCompanyById(id);
        if (c != null) {
            return ResponseEntity.ok(c);
        } else {
            return ResponseEntity.notFound().build(); // return 404 if the coupon is not found
        }
    }

    @PostMapping("/addCompany")
    public Companies addCompany(@RequestBody Companies c) {
        _adminService.AddCompany(c);
        return c;
    }

    @PutMapping("/updateCompany/{id}")
    public ResponseEntity<Companies> updateCompany(@PathVariable int id, @RequestBody Companies c) {
        Companies existingCompany = _adminService.getCompanyById(id); // <-- זו השורה שצריכה להיות

        if (existingCompany == null)
            return ResponseEntity.notFound().build(); // 404 אם לא קיימת חבר
        _adminService.updateCompany(id,c); // שורת העדכון נשארת אותו דבר

        return ResponseEntity.ok(c); // מחזיר את החברה המעודכנת
    }

    @DeleteMapping("/deleteCompanyById/{id}")
    public Companies deleteCompanyById(@PathVariable int id) {
        Companies c = _adminService.getCompanyById(id);
        if (c == null) {
            System.out.println("id not found");
             return null;
        }
        _adminService.deleteCompanyById(id);
        return c;
    }

    @GetMapping("/getTopCompanyByCouponsAmount")
    public ResponseEntity<Companies> getTopCompanyByCouponsAmount() {
        Companies company = _adminService.getTopCompanyByCouponsAmount();
        if (company != null) {
            return ResponseEntity.ok(company);
        }
        return ResponseEntity.noContent().build(); // 204 No Content אם לא נמצאה חברה
    }


}
