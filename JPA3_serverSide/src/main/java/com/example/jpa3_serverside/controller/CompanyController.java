
package com.example.jpa3_serverside.controller;

import com.example.jpa3_serverside.entites.Companies;
import com.example.jpa3_serverside.entites.Coupon;
//import com.example.jpa3_serverside.entites.Category;
import com.example.jpa3_serverside.repositories.CouponRepository;
import com.example.jpa3_serverside.servise.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/Company")
public class CompanyController {

    @Autowired
    private CompanyService _companyService;
    @Autowired
    private CouponRepository _couponRepository;

    @GetMapping("/getAll")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        List<Coupon> coupons = _companyService.getAllCoupons();
        if (coupons.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(coupons);
    }

    @GetMapping("/getMyCoupons")
    public ResponseEntity<List<Coupon>> getMyCoupons() {
        List<Coupon> coupons = _companyService.getCouponsByCompanyId();
        if (coupons == null || coupons.isEmpty()) { // Check if the list is null or empty
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(coupons);
    }


    @GetMapping("/getCompanyDetails")
    public ResponseEntity<Companies> getCompanyDetails() {
        Companies company = _companyService.getCompanyDetails();
        if (company != null) {
            return ResponseEntity.ok(company);
        }
        return ResponseEntity.notFound().build();
    }

    // פונקציה זו הועברה ל-AdminController
    // @GetMapping("/getCouponsByCompanyAndMaxPrice")
    // public ResponseESntity<List<Coupon>> getCouponsByCompanyAndMaxPrice(
    //         @RequestParam int companyId,
    //         @RequestParam float maxPrice) {
    //     List<Coupon> coupons = _companyService.getCouponsByCompanyAndMaxPrice(companyId, maxPrice);
    //     if (coupons.isEmpty()) {
    //         return ResponseEntity.noContent().build();
    //     }
    //     return ResponseEntity.ok(coupons);
    // }


    @PostMapping("/addCoupon")
    public ResponseEntity<Coupon> addCoupon(@RequestBody Coupon c) {
        if (_companyService.addCoupon(c)) {
            return ResponseEntity.status(HttpStatus.CREATED).body(c);
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }


    @GetMapping("/getMyCouponById/{couponId}") // Corrected path variable naming
    public ResponseEntity<Coupon> getCouponById( @PathVariable int couponId) {
        Coupon coupon = _companyService.getCouponById( couponId);
        if (coupon != null) {
            return ResponseEntity.ok(coupon);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/updateCompany")
    public ResponseEntity<Companies> updateCompany(@RequestBody Companies c) {
        if (_companyService.updateCompany(c)) {
            return ResponseEntity.ok(c);
        }
        return ResponseEntity.notFound().build();
    }
    /*/*/
    @PutMapping("/updateCoupon/{id}")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable int id, @RequestBody Coupon coupon) {
        if (_companyService.updateCoupon(id, coupon)) {
            return ResponseEntity.ok(coupon);
        }
        return ResponseEntity.notFound().build();
    }


@DeleteMapping("/deleteById/{couponId}")
public ResponseEntity<Void> deleteCouponById(@PathVariable int couponId) {
    boolean deleted = _companyService.deleteCouponById(couponId);
    if (deleted) {
        return ResponseEntity.noContent().build();  // 204
    } else {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 אם אין הרשאה
        // או ResponseEntity.notFound().build(); אם פשוט לא נמצא
    }
}

    @GetMapping("/getByNameContaining")
    public ResponseEntity<List<Coupon>> getCouponsByNameContaining(@RequestParam String name) {
        List<Coupon> coupons = _companyService.getCouponsByNameContaining(name);
        if (coupons.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(coupons);
    }

    @DeleteMapping("/deleteByExpiryDate")
    public ResponseEntity<Void> deleteCouponsByExpiryDate(@RequestParam String date) {
        try {
            LocalDate expiryDate = LocalDate.parse(date);
            int deletedCount = _companyService.deleteCouponsByExpiryDate(expiryDate);

            if (deletedCount > 0) {
                return ResponseEntity.noContent().build(); // 204
            } else {
                return ResponseEntity.notFound().build(); // 404
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build(); // 400
        }
    }


//    @GetMapping("/getByCategory")
//    public ResponseEntity<List<Coupon>> getCouponsByCategory(@RequestParam String category) {
//        try {
//            Cate couponCategory = Category.valueOf(category.toUpperCase());
//            List<Coupon> coupons = _companyService.getCouponsByCategory(couponCategory);
//            if (coupons.isEmpty()) {
//                return ResponseEntity.noContent().build();
//            }
//            return ResponseEntity.ok(coupons);
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }

    @GetMapping("/getByExpiryDateBetween")
    public ResponseEntity<List<Coupon>> getCouponsByExpiryDateBetween(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<Coupon> coupons = _companyService.getCouponsByExpiryDateBetween(start, end);
            if (coupons.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}