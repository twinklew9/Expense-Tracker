package com.sgt.expenseTracker.Repository;

import com.sgt.expenseTracker.Model.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class CategoryRepository {

    @Autowired
    JdbcTemplate jdbcTemplate;

    // FIXED: Only inserting user_id and name (the database handles category_id and active_yn automatically)
    public void createCategory(int userId, String name) {
        String query = "INSERT INTO categories (user_id, name) VALUES (?, ?)";
        jdbcTemplate.update(query, userId, name);
    }

    // FIXED: Only selecting columns that actually exist in your DB
    public List<Map<String,Object>> getAllCategories(int userId) {
        String query = "SELECT category_id AS categoryId, user_id AS userId, name FROM categories WHERE user_id = ? AND active_yn = 1";
        return jdbcTemplate.queryForList(query, userId);
    }

    // FIXED: Only updating the name
    public void updateCategory(int categoryId, String name, int userId) {
        String query = "UPDATE categories SET name = ? WHERE category_id = ? AND user_id = ?";
        jdbcTemplate.update(query, name, categoryId, userId);
    }

    public void deleteCategory(int categoryId, int userId) {
        String query = "UPDATE categories SET active_yn = 0 WHERE category_id = ? AND user_id = ?";
        jdbcTemplate.update(query, categoryId, userId);
    }

    // FIXED: Removed 'type' from the SQL query since the DB doesn't have a type column for categories
    public Category findByNameTypeAndUserId(String name, String type, int userId){
        String sql = "SELECT category_id, user_id, name, active_yn FROM categories WHERE name = ? AND user_id = ? AND active_yn = 1";

        List<Category> results = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Category c = new Category();
            // Depending on your Model, this might be setId() instead of setCategoryId()
            c.setCategoryId(rs.getInt("category_id"));
            c.setUserId(rs.getInt("user_id"));
            c.setName(rs.getString("name"));
            return c;
        }, name, userId);

        return results.isEmpty() ? null : results.get(0);
    }

    public List<Category> findAllByUserID(int userId) {
        String sql = "SELECT category_id, user_id, name, active_yn " +
                "FROM categories " +
                "WHERE user_id = ? AND active_yn = 1";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Category category = new Category();
            category.setCategoryId(rs.getInt("category_id"));
            category.setUserId(rs.getInt("user_id"));
            category.setName(rs.getString("name"));
            return category;
        }, userId);
    }
}