////package com.example.jpa3_serverside.controller;
////
////import com.example.jpa3_serverside.servise.AdminService;
////import com.example.jpa3_serverside.servise.CustomerService;
////import com.example.jpa3_serverside.entites.Credentional;
////import com.example.jpa3_serverside.jwt.JwtUtil;
////import com.example.jpa3_serverside.servise.AdminService;
////import com.example.jpa3_serverside.servise.CompanyService;
////import com.example.jpa3_serverside.servise.CustomerService;
////import org.springframework.beans.factory.annotation.Autowired;
////import org.springframework.http.HttpStatus;
////import org.springframework.http.ResponseEntity;
////import org.springframework.web.bind.annotation.*;
////
////@CrossOrigin(origins = "http://localhost:5174")
////@RestController
////@RequestMapping("/auth")
////public class AuthController {
////
////    @Autowired
////    private AdminService adminService;
////    @Autowired private CustomerService personService;
////    @Autowired private JwtUtil jwtUtil;
////
////    @PostMapping("/login")
////    public ResponseEntity<?> login(@RequestBody Credentional cred) {
////        System.out.println("Login request: " + cred.getEmail());
////
////        String email="www@gmail.com";
////        if(cred.getEmail() != null)
////         email = cred.getEmail();
////        String password = cred.getPassword();
////
////        if (adminService.Login(email,password)) {
////            String token = jwtUtil.generateToken(email, "ROLE_ADMIN");
////            return ResponseEntity.ok(token);
////        } else if (personService.Login(email, password)) {
////            String token = jwtUtil.generateToken(email, "ROLE_PERSON");
////            return ResponseEntity.ok(token);
////        } else {
////            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed");
////        }
////    }
////}
//package com.example.jpa3_serverside.controller;
//
//import com.example.jpa3_serverside.servise.AdminService;
//import com.example.jpa3_serverside.servise.CustomerService;
//import com.example.jpa3_serverside.servise.CompanyService;
//import com.example.jpa3_serverside.entites.Credentional;
//import com.example.jpa3_serverside.jwt.JwtUtil;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@CrossOrigin(origins = "http://localhost:5173")
//@RestController
//@RequestMapping("/auth")
//public class AuthController {
//
//    @Autowired
//    private AdminService adminService;
//
//    @Autowired
//    private CustomerService customerService;
//
//    @Autowired
//    private CompanyService companyService;
//
//    @Autowired
//    private JwtUtil jwtUtil;
//
//    @PostMapping("/login")
//    public ResponseEntity<?> login(String email, String password) {
////        System.out.println("Login request: " + cred.getEmail());
//
////        String email = cred.getEmail() != null ? cred.getEmail() : "www@gmail.com";
////        String password = cred.getPassword();
//        System.out.println("Login request: " + email);
//
//        // Check for Admin login
//        if (adminService.Login(email, password)) {
//            String token = jwtUtil.generateToken(email, "ROLE_ADMIN");
//            return ResponseEntity.ok(token);
//        }
//        // Check for Customer login
////        else if (customerService.Login(email, password)) {
////            String token = jwtUtil.generateToken(email, "ROLE_CUSTOMER");
////            return ResponseEntity.ok(token);
////        }
//        // Check for Company login
////        else if (companyService.Login(email, password)) {
////            String token = jwtUtil.generateToken(email, "ROLE_COMPANY");
////            return ResponseEntity.ok(token);
////        }
//        // If no valid login is found
//        else {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed");
//        }
//    }
//}



package com.example.jpa3_serverside.controller;

import com.example.jpa3_serverside.servise.AdminService;
//import com.example.jpa3_serverside.servise.CustomerService;
import com.example.jpa3_serverside.servise.CompanyService;
import com.example.jpa3_serverside.entites.Credentional;
import com.example.jpa3_serverside.jwt.JwtUtil;
import com.example.jpa3_serverside.servise.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired private AdminService adminService;
    @Autowired private CustomerService customerService;
    @Autowired private CompanyService companyService;
    @Autowired private JwtUtil jwtUtil;
//@PreAuthorize("hasRole("//")")
    @PostMapping("/login")
    public ResponseEntity<?> login(@org.jetbrains.annotations.NotNull @RequestBody Credentional cred) {
        String email = cred.getEmail();
        String password = cred.getPassword();
        System.out.println("Login request: " + email);

        // Check for Admin login
        if (adminService.Login(email, password)) {
            String token = jwtUtil.generateToken(email, "ROLE_ADMIN");
            return ResponseEntity.ok(token);
        }
        // Check for Customer login
        else if (customerService.Login(email, password)) {
            String token = jwtUtil.generateToken(email, "ROLE_CUSTOMER");
            return ResponseEntity.ok(token);
        }
        // Check for Company login
        else if (companyService.Login(email, password)) {
            String token = jwtUtil.generateToken(email, "ROLE_COMPANY");
            return ResponseEntity.ok(token);
        }
        // If no valid login is found
        else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed");
        }
    }
}