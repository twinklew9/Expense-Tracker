package com.sgt.expenseTracker.Repository;

import com.sgt.expenseTracker.Model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Map;

@Repository
public class ExpRepository {

    @Autowired
    JdbcTemplate jdbcTemplate;

    // ==========================================
    //            USER & AUTH METHODS
    // ==========================================

    public void addUser(String name, String username, String email, String password, String mobile) {
        String query = "INSERT INTO users(name, username, email, password, phone_number) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(query, name, username, email, password, mobile);
    }

    public User findByEmail(String email) {
        String query = "SELECT user_id, name, username, email, password, phone_number, active_yn FROM users WHERE email = ?";
        try {
            return jdbcTemplate.queryForObject(query, (resultSet, rownum) -> {
                User u = new User();
                u.setId(resultSet.getInt("user_id"));
                u.setName(resultSet.getString("name"));
                u.setUsername(resultSet.getString("username"));
                u.setEmail(resultSet.getString("email"));
                u.setPassword(resultSet.getString("password"));
                u.setPhone(resultSet.getString("phone_number"));
                u.setActiveYN(resultSet.getInt("active_yn"));
                return u;
            }, email);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public User findByUsername(String username) {
        String query = "SELECT user_id, name, username, email, password, phone_number, active_yn FROM users WHERE username = ?";
        try {
            return jdbcTemplate.queryForObject(query, (resultSet, rownum) -> {
                User u = new User();
                u.setId(resultSet.getInt("user_id"));
                u.setName(resultSet.getString("name"));
                u.setUsername(resultSet.getString("username"));
                u.setEmail(resultSet.getString("email"));
                u.setPassword(resultSet.getString("password"));
                u.setPhone(resultSet.getString("phone_number"));
                u.setActiveYN(resultSet.getInt("active_yn"));
                return u;
            }, username);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public int saveToken(String token, LocalDateTime expiry, int userId) {
        String query = "INSERT INTO auth_tokens(token, user_id, expiry, used_yn) VALUES (?, ?, ?, 0)";
        return jdbcTemplate.update(query, token, userId, expiry);
    }

    public Integer validateToken(String token) {
        String query = "SELECT user_id, expiry, used_yn FROM auth_tokens WHERE token = ?";
        try {
            Map<String, Object> result = jdbcTemplate.queryForMap(query, token);
            Integer userId = (Integer) result.get("user_id");
            Object usedYnObj = result.get("used_yn");
            int usedYn = (usedYnObj instanceof Boolean) ? (((Boolean) usedYnObj) ? 1 : 0) : ((Number) usedYnObj).intValue();
            java.sql.Timestamp dbTimestamp = (java.sql.Timestamp) result.get("expiry");
            LocalDateTime expiryDate = dbTimestamp.toLocalDateTime();
            if (usedYn == 1 || expiryDate.isBefore(LocalDateTime.now())) return null;
            return userId;
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public void updatePassword(int userId, String hashedPassword) {
        String query = "UPDATE users SET password = ? WHERE user_id = ?";
        jdbcTemplate.update(query, hashedPassword, userId);
    }

    public void markTokenAsUsed(String token) {
        String query = "UPDATE auth_tokens SET used_yn = 1 WHERE token = ?";
        jdbcTemplate.update(query, token);
    }

    public void invalidateAllTokens(int userId) {
        String query = "UPDATE auth_tokens SET used_yn = 1 WHERE user_id = ? AND used_yn = 0";
        jdbcTemplate.update(query, userId);
    }
}