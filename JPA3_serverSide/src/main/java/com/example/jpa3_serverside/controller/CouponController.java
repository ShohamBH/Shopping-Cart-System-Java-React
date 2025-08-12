package com.example.jpa3_serverside.controller;

import com.example.jpa3_serverside.entites.Coupon;
import com.example.jpa3_serverside.servise.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/coupon")

public class CouponController {
    @Autowired
    private CouponService couponService;
    public CouponController() {}
    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping( "/getAll")
    public List<Coupon> getAllCoupon() {
        return couponService.getAllCoupons();
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<Coupon> getCouponById(@PathVariable int id) {
        Coupon coupon = couponService.getCouponById(id);
        if (coupon != null) {
            return ResponseEntity.ok(coupon);
        } else {
            return ResponseEntity.notFound().build(); // return 404 if the coupon is not found
        }
    }

    @PostMapping("/add")
    public Coupon addCoupon(@RequestBody Coupon coupon) {
        couponService.addCoupon(coupon);
        return coupon;
    }

    @DeleteMapping("/deleteById")
    public Coupon deleteCouponById(@RequestParam int id) {
        Coupon coupon = couponService.getCouponById(id);
        if (coupon != null) {
            couponService.deleteCouponById(id);
            return coupon;
        }
        System.out.println("id not found");
       return null;
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable int id, @RequestBody Coupon coupon) {
        // בודקים אם הקופון קיים
        Coupon existingCoupon = couponService.getCouponById(id);
        if (existingCoupon == null) {
            return ResponseEntity.notFound().build(); // החזרת קוד 404 אם הקופון לא נמצא
        }

        existingCoupon.setName(coupon.getName());
        existingCoupon.setDescription(coupon.getDescription());
        existingCoupon.setDiscount(coupon.getDiscount());
        existingCoupon.setAmount(coupon.getAmount());

        couponService.updateCoupon(id, existingCoupon); // מעדכנים במסד הנתונים
        return ResponseEntity.ok(existingCoupon); // החזרת הקופון המעודכן
    }

    @GetMapping("/coupons/category/{category}")
    public ResponseEntity<List<Coupon>> getCouponsByCategory(@PathVariable Locale.Category category) {
        List<Coupon> coupons = couponService.getCouponsByCategory(category);
        if (coupons.isEmpty()) {
            return ResponseEntity.noContent().build(); // החזרת קוד 204 אם אין קופונים בקטגוריה
        }
        return ResponseEntity.ok(coupons); // החזרת רשימת הקופונים
    }


}

