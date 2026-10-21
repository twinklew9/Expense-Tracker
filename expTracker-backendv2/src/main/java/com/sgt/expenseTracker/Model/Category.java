package com.sgt.expenseTracker.Model;

public class Category {
    private int categoryId;
    private String name;
    private int userId;
    private int activeYn;

    // Getters and Setters
    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getActiveYn() { return activeYn; }
    public void setActiveYn(int activeYn) { this.activeYn = activeYn; }
}
