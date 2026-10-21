package com.sgt.expenseTracker.Repository;

import com.sgt.expenseTracker.Model.Expense;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class TransactionsRepository {

    @Autowired
    JdbcTemplate jdbcTemplate;

    public void addExpense(Expense expense) {
        String query = "INSERT INTO expenses (title, description, amount, date, category_id, user_id, type, icon, active_yn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)";
        jdbcTemplate.update(query, expense.getTitle(), expense.getDescription(), expense.getAmount(), expense.getDate(), expense.getCategoryId(), expense.getUserId(), expense.getType(), expense.getIcon());
    }

    public List<Map<String, Object>> getAllExpenses(int userId) {
        String query = """
                SELECT 
                    e.expense_id AS expenseId,
                    e.title,
                    e.amount,
                    e.date,
                    e.description,
                    e.type,
                    e.icon,
                    c.category_id AS categoryId,
                    c.name AS categoryName
                FROM expenses e
                LEFT JOIN categories c ON c.category_id = e.category_id
                WHERE 
                    e.user_id = ? 
                    AND e.active_yn = 1
                ORDER BY e.date DESC""";
        return jdbcTemplate.queryForList(query, userId);
    }

    public Map<String, Object> getDynamicFilteredExpenses(int userId, String categoryName, LocalDateTime start, LocalDateTime end, String type, String pageNumber, String numberOfRecordsPerPage) {

        // 1. Build the dynamic condition filters first (used for both queries)
        StringBuilder conditionQuery = new StringBuilder();
        List<Object> conditionParams = new ArrayList<>();

        if (categoryName != null && !categoryName.trim().isEmpty()) {
            conditionQuery.append(" AND c.name = ?");
            conditionParams.add(categoryName);
        }

        if (type != null && !type.trim().isEmpty()) {
            conditionQuery.append(" AND e.type = ?");
            conditionParams.add(type);
        }

        if (start == null && end != null) {
            conditionQuery.append(" AND e.date BETWEEN ? AND ?");
            conditionParams.add(end.minusDays(30));
            conditionParams.add(end);
        } else if (start != null && end == null) {
            conditionQuery.append(" AND e.date BETWEEN ? AND ?");
            conditionParams.add(start);
            conditionParams.add(start.plusDays(30));
        } else if (start != null && end != null) {
            conditionQuery.append(" AND e.date BETWEEN ? AND ?");
            conditionParams.add(start);
            conditionParams.add(end);
        }

        // 2. Count Total Pages using your SQL CEIL logic
        int totalPages = 1;
        if (numberOfRecordsPerPage != null && !numberOfRecordsPerPage.trim().isEmpty()) {
            String countQuery = "SELECT CEIL(COUNT(1) / ?) FROM expenses e LEFT JOIN categories c ON c.category_id = e.category_id WHERE e.user_id = ? AND e.active_yn = 1" + conditionQuery.toString();

            List<Object> countParams = new ArrayList<>();
            countParams.add(Double.parseDouble(numberOfRecordsPerPage));
            countParams.add(userId);
            countParams.addAll(conditionParams);

            // FIXED: Expect a Double from MySQL, then convert to int
            Double dbTotalPages = jdbcTemplate.queryForObject(countQuery, Double.class, countParams.toArray());
            if (dbTotalPages != null) {
                totalPages = dbTotalPages.intValue();
            }
        }

        // 3. Build the actual Data Query
        StringBuilder dataQuery = new StringBuilder("""
                SELECT 
                    e.expense_id AS expenseId,
                    e.title,
                    e.amount,
                    e.date,
                    e.description,
                    e.type,
                    e.icon,
                    c.category_id AS categoryId,
                    c.name AS categoryName
                FROM expenses e
                LEFT JOIN categories c ON c.category_id = e.category_id
                WHERE e.user_id = ? AND e.active_yn = 1
                """);

        dataQuery.append(conditionQuery);
        dataQuery.append(" ORDER BY e.date DESC");

        List<Object> dataParams = new ArrayList<>();
        dataParams.add(userId);
        dataParams.addAll(conditionParams);

        if (numberOfRecordsPerPage != null && pageNumber != null) {
            dataQuery.append(" LIMIT ? OFFSET ?");
            dataParams.add(Integer.parseInt(numberOfRecordsPerPage));
            dataParams.add((Integer.parseInt(pageNumber) - 1) * Integer.parseInt(numberOfRecordsPerPage));
        }

        List<Map<String, Object>> expenses = jdbcTemplate.queryForList(dataQuery.toString(), dataParams.toArray());

        // 4. Package and Return
        Map<String, Object> response = new HashMap<>();
        response.put("expenses", expenses);
        response.put("totalPages", totalPages);

        return response;
    }

    public void updateExpense(Expense expense) {
        String query = "UPDATE expenses SET title = ?, description = ?, amount = ?, date = ?, category_id = ?, type = ?, icon = ? WHERE expense_id = ? AND user_id = ?";
        jdbcTemplate.update(query, expense.getTitle(), expense.getDescription(), expense.getAmount(), expense.getDate(), expense.getCategoryId(), expense.getType(), expense.getIcon(), expense.getExpenseId(), expense.getUserId());
    }

    public void softDeleteExpense(int expenseId, int userId) {
        String query = """
            UPDATE expenses
            SET active_yn = 0
            WHERE expense_id = ?
            AND user_id = ?
            """;

        jdbcTemplate.update(
                query,
                expenseId,
                userId
        );
    }
}