package com.sgt.expenseTracker.Repository;

import com.sgt.expenseTracker.Model.RecurringTransaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class FinanceRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Double getMonthlyBudget(int userId) {

        String sql = """
                SELECT COALESCE(MAX(amount), 0)
                FROM monthly_budgets
                WHERE user_id = ?
                AND active_yn = 1
                """;

        Double value = jdbcTemplate.queryForObject(
                sql,
                Double.class,
                userId
        );

        return value == null ? 0.0 : value;
    }

    public void saveMonthlyBudget(
            int userId,
            double amount
    ) {

        String updateSql = """
                UPDATE monthly_budgets
                SET amount = ?,
                    active_yn = 1
                WHERE user_id = ?
                """;

        int updated = jdbcTemplate.update(
                updateSql,
                amount,
                userId
        );

        if (updated == 0) {

            String insertSql = """
                    INSERT INTO monthly_budgets
                    (
                        user_id,
                        amount,
                        active_yn
                    )
                    VALUES (?, ?, 1)
                    """;

            jdbcTemplate.update(
                    insertSql,
                    userId,
                    amount
            );
        }
    }

    public Double getThisMonthExpense(int userId) {

        String sql = """
            SELECT COALESCE(SUM(amount), 0)
            FROM expenses
            WHERE user_id = ?
            AND active_yn = 1
            AND LOWER(type) = 'expense'
            """;

        Double value = jdbcTemplate.queryForObject(
                sql,
                Double.class,
                userId
        );

        return value == null ? 0.0 : value;
    }
    
    public List<Map<String, Object>> getCategoryBudgets(int userId) {

        String sql = """
            SELECT
                cb.category_budget_id AS categoryBudgetId,
                cb.category_id AS categoryId,
                c.name AS categoryName,
                cb.amount AS budgetAmount,

                COALESCE(
                    SUM(
                        CASE
                            WHEN LOWER(e.type) = 'expense'
                            AND e.active_yn = 1
                            THEN e.amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS spentAmount

            FROM category_budgets cb

            JOIN categories c
                ON c.category_id = cb.category_id

            LEFT JOIN expenses e
                ON e.category_id = cb.category_id
                AND e.user_id = cb.user_id

            WHERE cb.user_id = ?
            AND cb.active_yn = 1
            AND c.active_yn = 1

            GROUP BY
                cb.category_budget_id,
                cb.category_id,
                c.name,
                cb.amount

            ORDER BY c.name
            """;

        return jdbcTemplate.queryForList(sql, userId);
    }

    public void saveCategoryBudget(
            int userId,
            int categoryId,
            double amount
    ) {

        String updateSql = """
                UPDATE category_budgets
                SET amount = ?,
                    active_yn = 1
                WHERE user_id = ?
                AND category_id = ?
                """;

        int updated = jdbcTemplate.update(
                updateSql,
                amount,
                userId,
                categoryId
        );

        if (updated == 0) {

            String insertSql = """
                    INSERT INTO category_budgets
                    (
                        user_id,
                        category_id,
                        amount,
                        active_yn
                    )
                    VALUES (?, ?, ?, 1)
                    """;

            jdbcTemplate.update(
                    insertSql,
                    userId,
                    categoryId,
                    amount
            );
        }
    }

    public void deleteCategoryBudget(
            int userId,
            int categoryBudgetId
    ) {

        String sql = """
                UPDATE category_budgets
                SET active_yn = 0
                WHERE category_budget_id = ?
                AND user_id = ?
                """;

        jdbcTemplate.update(
                sql,
                categoryBudgetId,
                userId
        );
    }

    public List<Map<String, Object>> getYearlyCashFlow(
            int userId,
            int year
    ) {

        String sql = """
                SELECT
                    MONTH(date) AS month_number,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN type = 'income'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS income,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN type = 'expense'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS expense

                FROM expenses

                WHERE user_id = ?
                AND active_yn = 1
                AND YEAR(date) = ?

                GROUP BY MONTH(date)

                ORDER BY MONTH(date)
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {

                    Map<String, Object> row =
                            new LinkedHashMap<>();

                    row.put(
                            "monthNumber",
                            rs.getInt("month_number")
                    );

                    row.put(
                            "income",
                            rs.getDouble("income")
                    );

                    row.put(
                            "expense",
                            rs.getDouble("expense")
                    );

                    return row;
                },
                userId,
                year
        );
    }

    public List<Map<String, Object>> getMonthlyComparison(
            int userId
    ) {

        String sql = """
                SELECT
                    COALESCE(
                        SUM(
                            CASE
                                WHEN YEAR(date) = YEAR(CURRENT_DATE())
                                AND MONTH(date) = MONTH(CURRENT_DATE())
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS currentMonth,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN YEAR(date) =
                                YEAR(
                                    DATE_SUB(
                                        CURRENT_DATE(),
                                        INTERVAL 1 MONTH
                                    )
                                )
                                AND MONTH(date) =
                                MONTH(
                                    DATE_SUB(
                                        CURRENT_DATE(),
                                        INTERVAL 1 MONTH
                                    )
                                )
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS previousMonth

                FROM expenses

                WHERE user_id = ?
                AND active_yn = 1
                AND type = 'expense'
                """;

        return jdbcTemplate.queryForList(
                sql,
                userId
        );
    }

    public Map<String, Object> getTopCategoryThisMonth(
            int userId
    ) {

        String sql = """
                SELECT
                    c.name AS categoryName,
                    COALESCE(SUM(e.amount), 0) AS totalAmount

                FROM expenses e

                JOIN categories c
                    ON c.category_id = e.category_id

                WHERE e.user_id = ?
                AND e.active_yn = 1
                AND e.type = 'expense'
                AND YEAR(e.date) = YEAR(CURRENT_DATE())
                AND MONTH(e.date) = MONTH(CURRENT_DATE())

                GROUP BY
                    c.category_id,
                    c.name

                ORDER BY totalAmount DESC

                LIMIT 1
                """;

        List<Map<String, Object>> rows =
                jdbcTemplate.queryForList(
                        sql,
                        userId
                );

        return rows.isEmpty()
                ? Map.of()
                : rows.get(0);
    }

    public List<RecurringTransaction> getRecurringTransactions(
            int userId
    ) {

        String sql = """
                SELECT *
                FROM recurring_transactions
                WHERE user_id = ?
                AND active_yn = 1
                ORDER BY next_run_date
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {

                    RecurringTransaction transaction =
                            new RecurringTransaction();

                    transaction.setRecurringId(
                            rs.getInt(
                                    "recurring_transaction_id"
                            )
                    );

                    transaction.setUserId(
                            rs.getInt("user_id")
                    );

                    transaction.setCategoryId(
                            rs.getInt("category_id")
                    );

                    transaction.setTitle(
                            rs.getString("title")
                    );

                    transaction.setAmount(
                            rs.getDouble("amount")
                    );

                    transaction.setType(
                            rs.getString("type")
                    );

                    transaction.setFrequency(
                            rs.getString("frequency")
                    );

                    transaction.setNextRunDate(
                            rs.getObject(
                                    "next_run_date",
                                    LocalDate.class
                            )
                    );
                    return transaction;
                },
                userId
        );
    }
    public void addRecurringTransaction(
            RecurringTransaction item
    ) {

        String sql = """
            INSERT INTO recurring_transactions
            (
                user_id,
                category_id,
                title,
                amount,
                type,
                frequency,
                next_run_date,
                active_yn
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            """;

        jdbcTemplate.update(
                sql,
                item.getUserId(),
                item.getCategoryId(),
                item.getTitle(),
                item.getAmount(),
                item.getType(),
                item.getFrequency(),
                item.getNextRunDate()
        );
    }

    public void deleteRecurringTransaction(
            int userId,
            int recurringId
    ) {
        String sql = """
            UPDATE recurring_transactions
            SET active_yn = 0
            WHERE recurring_id = ?
            AND user_id = ?
            """;

        jdbcTemplate.update(
                sql,
                recurringId,
                userId
        );
    }

    public List<Map<String, Object>> getYearlySpending(
            int userId,
            int year
    ) {
        String sql = """
            SELECT
                MONTH(date) AS monthNumber,
                COALESCE(SUM(amount), 0) AS totalAmount
            FROM expenses
            WHERE user_id = ?
            AND active_yn = 1
            AND type = 'expense'
            AND YEAR(date) = ?
            GROUP BY MONTH(date)
            ORDER BY MONTH(date)
            """;

        return jdbcTemplate.queryForList(
                sql,
                userId,
                year
        );
    }

    public List<RecurringTransaction> getDueRecurringTransactions() {
        String sql = """
            SELECT
                recurring_id,
                user_id,
                category_id,
                title,
                amount,
                type,
                frequency,
                next_run_date
            FROM recurring_transactions
            WHERE active_yn = 1
            AND next_run_date <= CURRENT_DATE()
            """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    RecurringTransaction item =
                            new RecurringTransaction();

                    item.setRecurringId(
                            rs.getInt("recurring_id")
                    );

                    item.setUserId(
                            rs.getInt("user_id")
                    );

                    item.setCategoryId(
                            rs.getInt("category_id")
                    );

                    item.setTitle(
                            rs.getString("title")
                    );

                    item.setAmount(
                            rs.getDouble("amount")
                    );

                    item.setType(
                            rs.getString("type")
                    );

                    item.setFrequency(
                            rs.getString("frequency")
                    );

                    item.setNextRunDate(
                            rs.getDate("next_run_date")
                                    .toLocalDate()
                    );

                    return item;
                }
        );
    }

    public void createExpenseFromRecurring(
            RecurringTransaction item
    ) {
        String sql = """
            INSERT INTO expenses
            (
                title,
                description,
                amount,
                date,
                category_id,
                user_id,
                type,
                icon,
                active_yn
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            """;

        jdbcTemplate.update(
                sql,
                item.getTitle(),
                "Created from recurring transaction",
                item.getAmount(),
                item.getNextRunDate().atStartOfDay(),
                item.getCategoryId(),
                item.getUserId(),
                item.getType(),
                "🔁"
        );
    }

    public void updateRecurringNextRun(
            int recurringId,
            LocalDate nextRunDate
    ) {
        String sql = """
            UPDATE recurring_transactions
            SET next_run_date = ?
            WHERE recurring_id = ?
            """;

        jdbcTemplate.update(
                sql,
                nextRunDate,
                recurringId
        );
    }

    public List<Map<String, Object>> getReportSummary(
            int userId,
            int year,
            int month
    ) {
        String sql = """
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'income'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS income,

                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'expense'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS expense

            FROM expenses
            WHERE user_id = ?
            AND active_yn = 1
            AND YEAR(date) = ?
            AND MONTH(date) = ?
            """;

        return jdbcTemplate.queryForList(
                sql,
                userId,
                year,
                month
        );
    }

    public List<Map<String, Object>> getReportCategories(
            int userId,
            int year,
            int month
    ) {
        String sql = """
            SELECT
                c.name AS categoryName,
                SUM(e.amount) AS totalAmount
            FROM expenses e
            JOIN categories c
                ON c.category_id = e.category_id
            WHERE e.user_id = ?
            AND e.active_yn = 1
            AND e.type = 'expense'
            AND YEAR(e.date) = ?
            AND MONTH(e.date) = ?
            GROUP BY c.category_id, c.name
            ORDER BY totalAmount DESC
            """;

        return jdbcTemplate.queryForList(
                sql,
                userId,
                year,
                month
        );
    }

    public List<Map<String, Object>> getReportTransactions(
            int userId,
            int year,
            int month
    ) {
        String sql = """
            SELECT
                e.date,
                e.title,
                c.name AS categoryName,
                e.type,
                e.amount
            FROM expenses e
            LEFT JOIN categories c
                ON c.category_id = e.category_id
            WHERE e.user_id = ?
            AND e.active_yn = 1
            AND YEAR(e.date) = ?
            AND MONTH(e.date) = ?
            ORDER BY e.date DESC
            """;

        return jdbcTemplate.queryForList(
                sql,
                userId,
                year,
                month
        );
    }
}