package com.example.jpa3_serverside.entites;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

//@NoArgsConstructor
//@AllArgsConstructor
@Data  // get set
@ToString
@Embeddable  // לא טבלה בפני עצמה, השדות יכולות להכנס לטבלה אחרת
public class Credentional {
    private String password;
    private String email;

//    public Credentional(String email, String password) {
//    }
    public Credentional(){

    }
    public Credentional(String email, String password) {
        this.email=email;
        this.password=password;
    }



    public String getEmail() {
        return  email;
    }

    public String getPassword() {
        return password;
    }
}

