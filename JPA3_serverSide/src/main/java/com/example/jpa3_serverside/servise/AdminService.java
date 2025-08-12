
package com.example.jpa3_serverside.servise;

import com.example.jpa3_serverside.entites.Companies;
import com.example.jpa3_serverside.entites.Coupon;
import com.example.jpa3_serverside.entites.Customer;
import com.example.jpa3_serverside.repositories.CompanyRepository;
import com.example.jpa3_serverside.repositories.CouponRepository;
import com.example.jpa3_serverside.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private CustomerRepository _customerRepository;

    @Autowired
    private CompanyRepository _companyRepository;

    @Autowired
    private CouponRepository _couponRepository;

//    @Override
    public boolean Login(String email, String password) {
        if(email!=null && password!=null)
            return email.equals("admin@admin.com") && password.equals("admin");
        return false;
    }

    public List<Customer> GetAllCustomers() {
        return _customerRepository.findAll();
    }

    public boolean addCustomer(Customer customer) { // ודא ששם המתודה הוא addCustomer (אות קטנה
        if (!_customerRepository.existsById(customer.getId())) {
            _customerRepository.save(customer);
            return true;
        }
        // אם ה-ID כבר קיים, נחזיר false
        return false;
    }
        public Customer updateCustomer(int id, Customer customerDetails) {
        Customer existingCustomer = _customerRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Customer not found with id " + id + ", cannot update."));
        // עדכן רק את השדות שאפשר לעדכן
        existingCustomer.setName(customerDetails.getName());
        existingCustomer.setAge(customerDetails.getAge());
        existingCustomer.setCoupons((List<Coupon>) customerDetails.getCoupons());
        existingCustomer.setLastName(customerDetails.getLastName());
        existingCustomer.setNumCoupons(customerDetails.getNumCoupons());
        // אל תאפשר עדכון של credentional (מייל, סיסמה) מפה, אלא אם כן יש לזה מסלול ייעודי

        return _customerRepository.save(existingCustomer);
    }
//    public Customer deleteCustomer(Customer customer) {
//        _customerRepository.delete(customer);
//        return customer;
//    }
    public Customer getCustomerById(int customerId) {
     return _customerRepository.findById(customerId)
            .orElseThrow(() -> new NoSuchElementException("Customer not found with id " + customerId));
    }
    public boolean deleteCustomerById(int id) {
        // Optionally, you can check if the customer exists before deleting
        if (!_customerRepository.existsById(id)) {
            System.out.println("ID not found");
            return false;
        }
        _customerRepository.deleteById(id);
        return true;
    }

    public boolean AddCompany(Companies companies) {
        if (!_companyRepository.existsById(companies.getId())) {
            _companyRepository.save(companies);
            return true;
        }
        return false;
    }

    public List<Companies> GetAllCompanies() {
        return _companyRepository.findAll();
    }

    // Corrected method: accepts the ID from the path
    public Companies updateCompanies(int id, Companies companies) {
        return _companyRepository.findById(id)
                .map(existingCompany -> {
                    existingCompany.setName(companies.getName()); // Update allowed fields
                    existingCompany.setCredentional(companies.getCredentional());
                    existingCompany.setCoupons(companies.getCoupons());
//                    existingCompany.se(companies.getAmount());

                    // Save and return updated entity
                    _companyRepository.save(existingCompany);
                    return existingCompany;
                }).orElse(null);
    }
    public boolean updateCompany(int id,Companies company) {
        Companies existingC = _companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Companies not found with id " + id));


        if (existingC!=null) {
//            Companies existingC = existingCompanyOptional.get();
            existingC.setName(company.getName());
            existingC.setCoupons(company.getCoupons());
            existingC.setNumCoupons(company.getNumCoupons());
//            existingC.setCredentional(new Credentional(.getCredentional().getEmail(),company.getCredentional().getEmail()));
            _companyRepository.save(existingC);
            return true;
        }
        return false;
    }
    public Companies getCompanyById(int companyId) {
        return _companyRepository.findById(companyId).orElse(null);
    }

    public void deleteCompanyById(int id) {
        if (_companyRepository.existsById(id)) {
            _companyRepository.deleteById(id);
        }
    }

    // פונקציה לקבלת החברה עם כמות הקופונים הגבוהה ביותר
    public Companies getTopCompanyByCouponsAmount() {
        return _companyRepository.findTopByOrderByCouponsAmountDesc();
    }

    // פונקציה לסינון קופונים לפי מזהה חברה ומחיר מקסימלי
//    public List<Coupon> getCouponsByCompanyAndMaxPrice(int companyId, float maxPrice) {
//        List<Coupon> coupons = _couponRepository.);
//        if (coupons != null) {
//            return coupons.stream()
//                    .filter(coupon -> coupon.getDiscount() <= maxPrice)
//                    .collect(Collectors.toList());
//        }
//        return Collections.emptyList();
//    }

}