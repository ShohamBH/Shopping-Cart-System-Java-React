package com.example.jpa3_serverside.repositories;

import com.example.jpa3_serverside.entites.Coupon;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Repository
public interface CouponRepository  extends JpaRepository<Coupon, Integer> {

    boolean existsByName(String name);
//    List<Coupon> findByName(String name);
    List<Coupon> findByNameContaining(String name);

    @Modifying
    @Query(value = "DELETE cc FROM companies_coupons cc " +
            "JOIN coupon c ON cc.coupons_id = c.id " +  // שים לב: coupons_id במקום coupon_id
            "WHERE c.expiry_date < :date " +
            "AND cc.companies_id = :companyId", nativeQuery = true)
    int deleteCompanyCouponLinksBeforeDate(@Param("date") LocalDate date, @Param("companyId") Integer companyId);

    @Modifying
    @Query(value = "DELETE custc FROM customer_coupons custc " +
            "JOIN coupon c ON custc.coupons_id = c.id " +
            "WHERE c.expiry_date < :date " +
            "AND c.companyid = :companyId", nativeQuery = true)
    int deleteCustomerCouponLinksBeforeDate(@Param("date") LocalDate date, @Param("companyId") Integer companyId);

    @Modifying
    @Query(value = "DELETE FROM coupon c " +
            "WHERE c.expiry_date < :date " +
            "AND c.companyid = :companyId", nativeQuery = true)
    int deleteCouponsByExpiryDate(@Param("date") LocalDate date, @Param("companyId") Integer companyId);



    //    List<Coupon> findByExpiryDate(LocalDate date);
    List<Coupon> findByCategory(Locale.Category category);

    Coupon findByTitleAndCompanyID(String title, int CompanyID);

    List<Coupon> findListCouponsByCompanyID(int companyId);

//  Optional<Object> findByCompanyId(int companyId);

    List<Coupon> findByExpiryDateBetween(LocalDate startDate, LocalDate endDate);
    Coupon findCouponByCompanyIDAndId(int companyID, int couponID);

}
