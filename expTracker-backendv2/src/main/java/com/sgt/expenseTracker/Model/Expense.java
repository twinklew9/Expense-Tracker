package com.sgt.expenseTracker.Model;

import java.time.LocalDateTime;

public class Expense {
    private int expenseId;
    private String title;
    private String description;
    private double amount;
    private LocalDateTime date;
    private Integer categoryId;
    private int userId;
    private int activeYN;

    // ADDED: New fields mapped to React frontend and Database
    private String type;
    private String icon;

    // --- Getters and Setters ---

    public int getExpenseId() { return expenseId; }
    public void setExpenseId(int expenseId) { this.expenseId = expenseId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getActiveYN() { return activeYN; }
    public void setActiveYN(int activeYN) { this.activeYN = activeYN; }

    // ADDED: Getters and Setters for the new fields
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}