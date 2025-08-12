package com.example.jpa3_serverside.servise;


import com.example.jpa3_serverside.entites.Customer;
import com.example.jpa3_serverside.repositories.CompanyRepository;
import com.example.jpa3_serverside.repositories.CouponRepository;
import com.example.jpa3_serverside.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public abstract class ClientServices {

    @Autowired
    public CouponRepository _couponRepository;;
//    @Autowired
//    private CustomerRepository _customerRepository;
//
//    @Autowired
//    private CompanyRepository _companyRepository;


    public abstract boolean Login(String email,String password);



}
