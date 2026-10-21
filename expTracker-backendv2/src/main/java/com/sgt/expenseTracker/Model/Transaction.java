package com.sgt.expense_tracker.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
public class Transaction {
    private int id;
    private int userId;
    private double amount;
    private int categoryId;
    private LocalDate dateOfTransaction;
    private String notes;
    private int activeYN;

    private String categoryName;
    private String categoryType;
}