

package com.example.jpa3_serverside.controller;

import com.example.jpa3_serverside.entites.Coupon;
import com.example.jpa3_serverside.entites.Customer;
import com.example.jpa3_serverside.servise.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // ודא שזה תואם את פורט ה-React שלך, והוסף פורטים נוספים אם צריך
@RestController
@RequestMapping("/Customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // שינוי: ה-ID הוא PathVariable
    @DeleteMapping("/deleteById")
    public ResponseEntity<String> deleteCustomerById() {
        try {
            boolean deleted = customerService.deleteCustomerById();
            if (deleted) {
                return ResponseEntity.ok("Customer deleted successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found or could not be deleted.");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting customer: " + e.getMessage());
        }
    }

    // מתודת עדכון עבור לקוח (לשימוש על ידי הלקוח עצמו)
    @PutMapping("/updateMyDetails")
    public ResponseEntity<?> updateMyDetails( @RequestBody Customer customerDetails) {
        try {
            Customer updatedCustomer = customerService.updateCustomer( customerDetails);
            return ResponseEntity.ok(updatedCustomer);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // מתודת עדכון עבור מנהל (אם תרצה להפריד)
    // @PutMapping("/update/{id}")
    // public ResponseEntity<?> updateCustomer(@PathVariable int id, @RequestBody Customer customer) {
    //     try {
    //         Customer updatedCustomer = customerService.updateCustomer(id, customer);
    //         return ResponseEntity.ok(updatedCustomer);
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    //     }
    // }

    @GetMapping("/getCustomerById")
    public ResponseEntity<?> getCustomerById() {

        Customer c = customerService.getCustomerById();
        if(c!=null)
        {
            return ResponseEntity.ok(c);
        }

        return ResponseEntity.notFound().build();

    }

    @GetMapping("/getAllCoupons")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        try {
            List<Coupon> coupons = customerService.getAllCoupons();
            return ResponseEntity.ok(coupons);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    /*/*/
    // שינוי: מקבל int ישירות
    @PostMapping("/addCoupons/{couponId}")
    public ResponseEntity<String> purchaseCoupon( @PathVariable int couponId) {
        try {
            customerService.purchaseCoupon( couponId);
            return ResponseEntity.ok("Coupon " + couponId + " purchased successfully by customer ");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error purchasing coupon: " + e.getMessage());
        }
    }

    // נקודת קצה חדשה למחיקת קופון מלקוח
    @DeleteMapping("/removeCoupon/{couponId}")
    public ResponseEntity<String> removeCouponFromCustomer( @PathVariable int couponId) {
        try {
            customerService.removeCouponFromCustomer( couponId);
            return ResponseEntity.ok("Coupon " + couponId + " removed successfully .");
        } catch (NoSuchElementException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error removing coupon: " + e.getMessage());
        }
    }

    @GetMapping("/getCouponsByCustomer")
    public ResponseEntity<?> getCouponsByCustomer() {
        try {
            List<Coupon> customerCoupons = customerService.getCouponsByCustomer();
            return ResponseEntity.ok(customerCoupons);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching coupons for customer: " + e.getMessage());
        }
    }
}