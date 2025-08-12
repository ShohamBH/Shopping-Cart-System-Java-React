package com.example.jpa3_serverside.entites;

import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

import java.util.List;

@Entity
public class Companies {

    @Id
    private int id;
    private String name;
//    private String email;
//    private String password;
    @OneToMany
    private List<Coupon> coupons;
    @Embedded
    private Credentional credentional;
    private int numCoupons;

    public Companies(){}

    public Companies(int id, String name, String email, String password,  Credentional credentional,int num) {
        this.id = id;
        this.name = name;
//        this.email = email;
//        this.password = password;
//        this.coupons = coupons;
        this.credentional = credentional;
        this.numCoupons=num;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
    public int getNumCoupons() {
        return numCoupons;
    }

    public void setNumCoupons(int num) {
        this.numCoupons = num;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

//    public String getEmail() {
//        return email;
//    }

//    public void setEmail(String email) {
//        this.email = email;
//    }

//    public String getPassword() {
//        return password;
//    }

//    public void setPassword(String password) {
//        this.password = password;
//    }

    public List<Coupon> getCoupons() {
        return coupons;
    }

    public void setCoupons(List<Coupon> coupons) {
        this.coupons = coupons;
    }

    public Credentional getCredentional() {
        return credentional;
    }

    public void setCredentional(Credentional credentional) {
        this.credentional = credentional;
    }

    @Override
    public String toString() {
        return "Companies{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", password='" + credentional.getPassword() + '\'' +
                ", coupons=" + coupons +
                ", email=" + credentional.getEmail() +
                ",num Coupons"+numCoupons+
                '}';
    }
}
