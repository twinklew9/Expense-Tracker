package com.sgt.expenseTracker.Model;

import java.time.LocalDate;

public class RecurringTransaction {

    private Integer recurringId;
    private Integer userId;
    private String title;
    private Double amount;
    private Integer categoryId;
    private String type;
    private String frequency;
    private LocalDate nextRunDate;

    public Integer getRecurringId() {
        return recurringId;
    }

    public void setRecurringId(Integer recurringId) {
        this.recurringId = recurringId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public LocalDate getNextRunDate() {
        return nextRunDate;
    }

    public void setNextRunDate(LocalDate nextRunDate) {
        this.nextRunDate = nextRunDate;
    }
}