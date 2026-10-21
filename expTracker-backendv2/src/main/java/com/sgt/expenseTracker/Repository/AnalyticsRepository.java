package com.sgt.expenseTracker.Repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class AnalyticsRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Map<String, Object> getSummary(int userId) {

        String query = """
                SELECT
                    COALESCE(SUM(
                        CASE
                            WHEN type = 'income'
                            THEN amount
                            ELSE 0
                        END
                    ), 0) AS totalIncome,

                    COALESCE(SUM(
                        CASE
                            WHEN type = 'expense'
                            THEN amount
                            ELSE 0
                        END
                    ), 0) AS totalExpense

                FROM expenses
                WHERE user_id = ?
                AND active_yn = 1
                """;

        return jdbcTemplate.queryForMap(
                query,
                userId
        );
    }

    public List<Map<String, Object>> getCategorySpending(
            int userId
    ) {

        String query = """
                SELECT
                    c.name AS categoryName,
                    SUM(e.amount) AS totalAmount
                FROM expenses e
                JOIN categories c
                    ON c.category_id = e.category_id
                WHERE e.user_id = ?
                AND e.active_yn = 1
                AND e.type = 'expense'
                GROUP BY c.category_id, c.name
                ORDER BY totalAmount DESC
                """;

        return jdbcTemplate.queryForList(
                query,
                userId
        );
    }

    public List<Map<String, Object>> getMonthlyTrend(
            int userId
    ) {

        String query = """
                SELECT
                    DATE_FORMAT(date, '%Y-%m') AS month,
                    SUM(
                        CASE
                            WHEN type = 'income'
                            THEN amount
                            ELSE 0
                        END
                    ) AS income,
                    SUM(
                        CASE
                            WHEN type = 'expense'
                            THEN amount
                            ELSE 0
                        END
                    ) AS expense
                FROM expenses
                WHERE user_id = ?
                AND active_yn = 1
                GROUP BY DATE_FORMAT(date, '%Y-%m')
                ORDER BY month
                """;

        return jdbcTemplate.queryForList(
                query,
                userId
        );
    }
}