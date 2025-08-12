package com.example.jpa3_serverside.entites;

import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

import java.util.List;

@Entity
public class Customer {
    @Id
    private int id;
//    private String email;
    private String name;
    private String lastName;

    private int age;
    @OneToMany
    private List<Coupon> coupons;
    private  int numCoupons;
    @Embedded
    private Credentional credentional;
    public Customer() {
    }

    public Customer(int id, String name, int age, List<Coupon> coupons, String email,String lastName,int numCoupons,Credentional credentional) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.coupons = coupons;
//        this.email = email;
        this.lastName = lastName;
        this.numCoupons = numCoupons;
        this.credentional = credentional;
    }


//    public String getEmail() {
//        return email;
//    }

//    public void setEmail(String email) {
//        this.email = email;
//    }

    public List<Coupon> getCoupons() {
        return coupons;
    }

    public void setCoupons(List<Coupon> coupons) {
        this.coupons = coupons;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public int getNumCoupons() {
        return numCoupons;
    }

    public void setNumCoupons(int numCoupons) {
        this.numCoupons = numCoupons;
    }

    public Credentional getCredentional() {
        return credentional;
    }

    public void setCredentional(Credentional credentional) {
        this.credentional = credentional;
    }

    @Override
    public String toString() {
        return "Customer{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", lastName='" + lastName + '\'' +
                ", age=" + age +
                ", coupons=" + coupons +
                ", numCoupons=" + numCoupons +
                ", email=" + credentional.getEmail() +
                ", password=" + credentional.getPassword() +
                '}';
    }
}
