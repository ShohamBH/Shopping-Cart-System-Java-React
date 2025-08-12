package com.example.jpa3_serverside.servise;

import com.example.jpa3_serverside.entites.Coupon;
import com.example.jpa3_serverside.repositories.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public void addCoupon(Coupon coupon) {
        if(!couponRepository.existsById(coupon.getId())) {
            couponRepository.save(coupon); //הוספה או עידכון במסד הנתונים
            System.out.println("add");
        }
    }

     public Coupon getCouponById(int id) {
        if(!couponRepository.existsById(id))
            return null;
         return couponRepository.findById(id).get();
     }


     public void deleteCouponById(int id) {
        if (!couponRepository.existsById(id)  )
        {
            System.out.println("id not found");
             return;
        }
        couponRepository.deleteById(id);
     }

    public void updateCoupon(int id, Coupon coupon) {
        Coupon existingCoupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id " + id));

        existingCoupon.setName(coupon.getName()); // הנחה שיש שדה בשם 'name'
        existingCoupon.setCategory(coupon.getCategory()); // לדוגמה, גם קטגוריה
        // הוסף כאן שדות נוספים שאתה רוצה לעדכן
        couponRepository.save(existingCoupon);
    }

    public List<Coupon> getCouponsByCategory(Locale.Category category) {
        return couponRepository.findByCategory(category);
    }

}
