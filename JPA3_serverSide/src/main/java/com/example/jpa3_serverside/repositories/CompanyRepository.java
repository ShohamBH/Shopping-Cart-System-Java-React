package com.example.jpa3_serverside.repositories;

import com.example.jpa3_serverside.entites.Companies;
import com.example.jpa3_serverside.entites.Coupon;
import com.example.jpa3_serverside.entites.Credentional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CompanyRepository  extends JpaRepository<Companies, Integer> {

    Companies findTopByOrderByCouponsAmountDesc();
    Companies findByCredentionalEmail(String email);
    @Query("SELECT c.id FROM Companies c WHERE c.credentional.email = ?1")
    Integer findIdByCredentionalEmail(String email); // הוסף את זה

}
