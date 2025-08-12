package com.example.jpa3_serverside.entites;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;

import java.time.LocalDate;
import java.util.Objects;

// ודא שה-enum מוגדר כאן או בקובץ נפרד
enum Category {FOOD, ELECTRONIC, RESTAURANT, VACATION, HEALTH, SPORTS, CAMPING,OTHER};

@Entity
public class Coupon {
    @Id
    private int id;
    private String name;
    private String description;
    private String image;
    private String title;
    private float discount;
    private int amount;
    @Enumerated(EnumType.STRING)
    private Category category;
    private LocalDate expiryDate;
    private int companyID;

    public Coupon() {}

    public Coupon(int id,String name, String description, float discount, int amount, Category category, LocalDate expiryDate,int CompanyID,String title,String image) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.discount = discount;
        this.amount = amount;
        this.category = category;
        this.expiryDate = expiryDate;
        this.companyID = CompanyID;
        this.title = title;
        this.image = image;
    }

    public int getCompanyID() {
        return companyID;
    }

    public void setCompanyID(int companyID) {
        this.companyID = companyID;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public float getDiscount() {
        return discount;
    }

    public void setDiscount(float discount) {
        this.discount = discount;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Coupon coupon = (Coupon) o;
        return id == coupon.id;
    }

    @Override
    public String toString() {
        return "Coupon{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", image='" + image + '\'' +
                ", title='" + title + '\'' +
                ", discount=" + discount +
                ", amount=" + amount +
                ", category=" + category +
                ", expiryDate=" + expiryDate +
                ", CompanyID=" + companyID +
                '}';
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}