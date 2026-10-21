package com.sgt.expenseTracker.Model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class User {
    private int id;
    private String name;
    private String username;
    private String email;
    private String password;
    private String phone;
    private int activeYN;
}