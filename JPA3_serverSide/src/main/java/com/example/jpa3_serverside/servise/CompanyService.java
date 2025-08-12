package com.example.jpa3_serverside.servise;

import com.example.jpa3_serverside.entites.Companies;
import com.example.jpa3_serverside.entites.Coupon;
//import com.example.jpa3_serverside.entites.Category;
import com.example.jpa3_serverside.entites.Credentional;
import com.example.jpa3_serverside.entites.Customer;
import com.example.jpa3_serverside.repositories.CompanyRepository;
import com.example.jpa3_serverside.repositories.CouponRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CompanyService extends ClientServices{

    @Autowired
    private CouponRepository _couponRepository;

    @Autowired
    private CompanyRepository _companyRepository;

    public String getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return  authentication.getName(); // זה השם שהכנסת ל־subject של ה־JWT
    }

//    public boolean Login(String email, String password) {
//        // Find a company by the provided email
//        Companies company = _companyRepository.findByCredentional(new Credentional(email,password));
//
//        // Check if the company is present
//        if (company != null) {
//            // Verify password
//            if (company.getCredentional().getPassword().equals(password)) {
//                // Login successful
//                return true;
//            }
//        }
//
//        // Login failed
//        return false;
//    }

    @Override
    public boolean Login(String email, String password) {
        Companies company = _companyRepository.findByCredentionalEmail(email);
        if (company != null) {
            return company.getCredentional().getPassword().equals(password);
        }
        return false;
    }


    public List<Coupon> getAllCoupons() {
        return _couponRepository.findAll();
    }
//        int companyId=_companyRepository.findIdByCredentionalEmail(getCurrentUser());

    public boolean addCoupon(Coupon coupon) {

        Coupon existingCoupon = _couponRepository.findByTitleAndCompanyID(coupon.getTitle(), coupon.getCompanyID());
        if (existingCoupon == null) {
            _couponRepository.save(coupon);
            return true;
        }
        return false;
    }


    public Coupon getCouponById( int couponId) {
        int companyId=_companyRepository.findIdByCredentionalEmail(getCurrentUser());
        Coupon coupon = _couponRepository.findCouponByCompanyIDAndId(companyId,couponId); // Use companyId to fetch coupons

        // Check if coupons list is empty or if the couponId is out of bounds
        if (coupon == null ) {
            return null; // Return null if no coupons are found or index is out of bounds
        }

        return coupon;
    }

    public boolean updateCoupon(int id,Coupon coupon) {
//        List<Coupon> couponsByCompanyId = getCouponsByCompanyId(compID);
        Optional<Coupon> existingCouponOptional = _couponRepository.findById(id);
        if (existingCouponOptional.isPresent()) {
            Coupon existingCoupon = existingCouponOptional.get();
            existingCoupon.setTitle(coupon.getTitle());
            existingCoupon.setDescription(coupon.getDescription());
            existingCoupon.setDiscount(coupon.getDiscount());
            existingCoupon.setAmount(coupon.getAmount());
            existingCoupon.setCategory(coupon.getCategory());
            existingCoupon.setExpiryDate(coupon.getExpiryDate());
            existingCoupon.setImage(coupon.getImage());
            existingCoupon.setName(coupon.getName()); // הוסף Name לעדכון
            _couponRepository.save(existingCoupon);
            return true;
        }
        return false;
    }

//    public boolean deleteCouponById( int couponId) {
//        int companyId=_companyRepository.findIdByCredentionalEmail(getCurrentUser());
//
//        Coupon c = _couponRepository.findCouponByCompanyIDAndId(companyId, couponId); // Ensure this fetches correctly
//        if (c != null) {
//            _couponRepository.delete(c); // Deletes the coupon
//            return true; // Return true if deletion is successful
//        }
//        return false; // Return false if the coupon is not found
//    }
public boolean deleteCouponById(int couponId) {
    try {
        String userEmail = getCurrentUser();
        int companyId = _companyRepository.findIdByCredentionalEmail(userEmail);

        if (companyId == 0) {
            System.out.println("Company ID not found for user: " + userEmail);
            return false;
        }

        Coupon c = _couponRepository.findCouponByCompanyIDAndId(companyId, couponId);

        if (c == null) {
            System.out.println("Coupon not found with companyId=" + companyId + " and couponId=" + couponId);
            return false;
        }

        _couponRepository.delete(c);
        System.out.println("Coupon deleted successfully: " + couponId);
        return true;

    } catch (Exception e) {
        System.err.println("Error deleting coupon: " + e.getMessage());
        e.printStackTrace();
        return false;
    }
}

    // פונקציה זו הועברה ל-AdminService
    // public List<Coupon> getCouponsByCompanyAndMaxPrice(int companyId, float maxPrice) {
    //     List<Coupon> coupons = _couponRepository.findByCompanyID(companyId);
    //     if (coupons != null) {
    //         return coupons.stream()
    //                 .filter(coupon -> coupon.getDiscount() <= maxPrice)
    //                 .collect(Collectors.toList());
    //     }
    //     return Collections.emptyList();
    // }


    public boolean updateCompany(Companies company) {
        int companyId=_companyRepository.findIdByCredentionalEmail(getCurrentUser());
        Companies existingC = _companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Companies not found with id " + companyId));
        if (existingC!=null) {
//            Companies existingC = existingCompanyOptional.get();
            if (company.getName() != null) {
                existingC.setName(company.getName());
            }
            if (company.getCoupons() != null) {
                existingC.setCoupons(company.getCoupons());
            }
            if (company.getNumCoupons() != 0) {
                existingC.setNumCoupons(company.getNumCoupons());
            }

//            existingC.setCredentional(new Credentional(.getCredentional().getEmail(),company.getCredentional().getEmail()));
            _companyRepository.save(existingC);
            return true;
        }
        return false;
    }

    // פונקציה זו הועברה ל-AdminService
    // public Companies getTopCompanyByCouponsAmount() {
    //     return _companyRepository.findTopByOrderByCouponsAmountDesc();
    // }

    public List<Coupon> getCouponsByNameContaining(String name) {
        return _couponRepository.findByNameContaining(name);
    }

    @Transactional
    public int deleteCouponsByExpiryDate(LocalDate date) {
        String userEmail = getCurrentUser();
        Integer companyId = _companyRepository.findIdByCredentionalEmail(userEmail);

        if (companyId == null) {
            // אפשר לזרוק חריגה או להחזיר 0 למחיקה
            return 0;
        }

        // שולח companyId לקריאות מחיקה לרפוזיטורי
        int companyLinks = _couponRepository.deleteCompanyCouponLinksBeforeDate(date, companyId);
        int customerLinks = _couponRepository.deleteCustomerCouponLinksBeforeDate(date, companyId);
        int deleted = _couponRepository.deleteCouponsByExpiryDate(date, companyId);

        return deleted;
    }


//    public List<Coupon> getCouponsByCategory(Cat category) {
//        return _couponRepository.findByCategory(category);
//    }

    public List<Coupon> getCouponsByExpiryDateBetween(LocalDate startDate, LocalDate endDate) {
        return _couponRepository.findByExpiryDateBetween(startDate, endDate);
    }

    public List<Coupon> getCouponsByCompanyId() {
        Integer companyId = _companyRepository.findIdByCredentionalEmail(getCurrentUser());
        if (companyId == null) {
            // המשתמש אינו חברה, נחזיר רשימה ריקה של קופונים
            return Collections.emptyList();
        }
        return _couponRepository.findListCouponsByCompanyID(companyId);
    }

    public Companies getCompanyDetails() {
        Integer companyId = _companyRepository.findIdByCredentionalEmail(getCurrentUser());
        if (companyId == null) {
            return null;
        }
        return _companyRepository.findById(companyId).orElse(null);
    }

}