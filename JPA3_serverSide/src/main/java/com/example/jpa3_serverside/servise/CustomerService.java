

package com.example.jpa3_serverside.servise;//// CustomerService.java

import com.example.jpa3_serverside.entites.Coupon;
import com.example.jpa3_serverside.entites.Customer;
import com.example.jpa3_serverside.repositories.CouponRepository;
import com.example.jpa3_serverside.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CustomerService extends ClientServices { // שים לב לשם החבילה אם שינית אותו
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private CouponRepository couponRepository;

    public String getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return  authentication.getName(); // זה השם שהכנסת ל־subject של ה־JWT
    }


    public Customer getCustomerById() {
        int customerId=customerRepository.findIdByCredentionalEmail(getCurrentUser());
        System.out.println(customerId);
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new NoSuchElementException("Customer not found with id " + customerId));
    }

    public boolean deleteCustomerById() {
        int id=customerRepository.findIdByCredentionalEmail((getCurrentUser()));
        if (!customerRepository.existsById(id)) {
            throw new NoSuchElementException("Customer with ID " + id + " not found, cannot delete.");
        }
        customerRepository.deleteById(id);
        System.out.println("Customer with ID " + id + " deleted successfully.");

        return true;
    }
// CustomerService.java

    public Customer updateCustomer(Customer customerDetails) {
        int id = customerRepository.findIdByCredentionalEmail(getCurrentUser());
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Customer not found with id " + id + ", cannot update."));

        existingCustomer.setName(customerDetails.getName());
        existingCustomer.setAge(customerDetails.getAge());
        existingCustomer.setLastName(customerDetails.getLastName());
        // השורה הבאה לא נחוצה ועלולה ליצור בעיות:
        // existingCustomer.setCoupons((List<Coupon>) customerDetails.getCoupons());
        // גם השורה הבאה עלולה להיות בעייתית אם נשלח null
        // existingCustomer.setNumCoupons(customerDetails.getNumCoupons());

        return customerRepository.save(existingCustomer);
    }
//    public Customer updateCustomer( Customer customerDetails) {
//        int id=customerRepository.findIdByCredentionalEmail((getCurrentUser()));
//
//        Customer existingCustomer = customerRepository.findById(id)
//
//                .orElseThrow(() -> new NoSuchElementException("Customer not found with id " + id + ", cannot update."));
//        // עדכן רק את השדות שאפשר לעדכן
//        existingCustomer.setName(customerDetails.getName());
//        existingCustomer.setAge(customerDetails.getAge());
//        existingCustomer.setCoupons((List<Coupon>) customerDetails.getCoupons());
//        existingCustomer.setLastName(customerDetails.getLastName());
//        existingCustomer.setNumCoupons(customerDetails.getNumCoupons());
//        // אל תאפשר עדכון של credentional (מייל, סיסמה) מפה, אלא אם כן יש לזה מסלול ייעודי
//
//        return customerRepository.save(existingCustomer);
//    }

    // CustomerService.java

    public void purchaseCoupon(int couponId) {
        int customerId = customerRepository.findIdByCredentionalEmail((getCurrentUser()));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id " + customerId + ". Cannot purchase coupon."));

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found with id " + couponId + ". Cannot be purchased."));

        if (coupon.getAmount() <= 0) {
            throw new IllegalArgumentException("Coupon " + coupon.getTitle() + " is out of stock.");
        }
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Coupon " + coupon.getTitle() + " has expired.");
        }

        if (customer.getCoupons().contains(coupon)) {
            throw new IllegalArgumentException("Customer already owns coupon " + coupon.getTitle() + ".");
        }

        coupon.setAmount(coupon.getAmount() - 1);
        customer.getCoupons().add(coupon);

        // *** התיקון: מוסיפים קופון למונה של הלקוח ***
        customer.setNumCoupons(customer.getNumCoupons() + 1);

        couponRepository.save(coupon);
        customerRepository.save(customer);
    }

//    // פונקציה חדשה: הסרת קופון מלקוח
//    public void removeCouponFromCustomer( int couponId) {
//        int customerId=customerRepository.findIdByCredentionalEmail((getCurrentUser()));
//
//        Customer customer = customerRepository.findById(customerId)
//
//                .orElseThrow(() -> new NoSuchElementException("Customer not found with id " + customerId + ". Cannot remove coupon."));
//
//        Coupon couponToRemove = couponRepository.findById(couponId)
//                .orElseThrow(() -> new NoSuchElementException("Coupon not found with id " + couponId + ". Cannot be removed."));
//
//        if (!customer.getCoupons().remove(couponToRemove)) {
//            throw new IllegalArgumentException("Customer " + customerId + " does not own coupon " + couponId + ".");
//        }
//            customerRepository.save(customer);
//    }
// CustomerService.java

    // פונקציה חדשה: הסרת קופון מלקוח
    public void removeCouponFromCustomer(int couponId) {
        int customerId = customerRepository.findIdByCredentionalEmail(getCurrentUser());
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new NoSuchElementException("Customer not found with id " + customerId + ". Cannot remove coupon."));

        Coupon couponToRemove = couponRepository.findById(couponId)
                .orElseThrow(() -> new NoSuchElementException("Coupon not found with id " + couponId + ". Cannot be removed."));

        if (!customer.getCoupons().remove(couponToRemove)) {
            throw new IllegalArgumentException("Customer " + customerId + " does not own coupon " + couponId + ".");
        }

        // *** התיקונים: הורדת קופון מהמונה של הלקוח והחזרת הקופון למלאי ***
        if (customer.getNumCoupons() > 0) {
            customer.setNumCoupons(customer.getNumCoupons() - 1);
        }
        couponToRemove.setAmount(couponToRemove.getAmount() + 1); // החזרת קופון למלאי

        customerRepository.save(customer);
        couponRepository.save(couponToRemove);
    }
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public List<Coupon> getCouponsByCustomer() {
        int customerId=customerRepository.findIdByCredentionalEmail((getCurrentUser()));
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new NoSuchElementException("Customer not found with id " + customerId));

        return customer.getCoupons();
    }


@Override
public boolean Login(String email, String password) {
    Customer customer = customerRepository.findByCredentionalEmail(email);
    if (customer != null) {
        return customer.getCredentional().getPassword().equals(password);
    }
    return false;
}

}