// CustomerRepository.java
package com.example.jpa3_serverside.repositories;

import com.example.jpa3_serverside.entites.Credentional;
import com.example.jpa3_serverside.entites.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Customer findByCredentionalPassword(String pass); // הוסף את זה
    Customer findByCredentionalEmail(String email); // הוסף את זה

    boolean existsByCredentional(Credentional credentional); // אם אתה משתמש בזה, ודא שה-Credentional אובייקט עם שניהם email ו-password.
    @Query("SELECT c.id FROM Customer c WHERE c.credentional.email = ?1")
    int findIdByCredentionalEmail(String email); // הוסף את זה

//    int findIdById(Credentional currentUser);
//    Customer delete(Customer customer);
}