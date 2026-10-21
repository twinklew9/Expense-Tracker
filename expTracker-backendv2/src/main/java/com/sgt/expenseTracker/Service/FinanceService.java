package com.sgt.expenseTracker.Service;

import com.sgt.expenseTracker.Model.BudgetRequest;
import com.sgt.expenseTracker.Model.RecurringTransaction;
import com.sgt.expenseTracker.Model.User;
import com.sgt.expenseTracker.Repository.ExpRepository;
import com.sgt.expenseTracker.Repository.FinanceRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinanceService {

    @Autowired
    private FinanceRepository financeRepository;

    @Autowired
    private ExpRepository expRepository;


    // ==========================================
    // USER
    // ==========================================

    private User getUser(String email) {

        User user = expRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException(
                    "User not found"
            );
        }

        return user;
    }


    // ==========================================
    // FINANCE OVERVIEW
    // ==========================================

    public Map<String, Object> getOverview(String email) {

        User user = getUser(email);

        int userId = user.getId();

        double monthlyBudget =
                financeRepository.getMonthlyBudget(userId);

        double spentThisMonth =
                financeRepository.getThisMonthExpense(userId);

        double remaining =
                monthlyBudget - spentThisMonth;

        double percentage = monthlyBudget > 0
                ? (spentThisMonth / monthlyBudget) * 100
                : 0;

        List<Map<String, Object>> categoryBudgets =
                financeRepository.getCategoryBudgets(userId);

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "monthlyBudget",
                monthlyBudget
        );

        response.put(
                "spentThisMonth",
                spentThisMonth
        );

        response.put(
                "monthlySpent",
                spentThisMonth
        );

        response.put(
                "remaining",
                remaining
        );

        response.put(
                "budgetPercentage",
                percentage
        );

        response.put(
                "budgetExceeded",
                monthlyBudget > 0
                        && spentThisMonth > monthlyBudget
        );

        response.put(
                "categoryBudgets",
                categoryBudgets
        );

        response.put(
                "insights",
                buildInsights(
                        userId,
                        monthlyBudget,
                        spentThisMonth,
                        percentage
                )
        );

        response.put(
                "recurringTransactions",
                financeRepository
                        .getRecurringTransactions(userId)
        );

        return response;
    }


    // ==========================================
    // MONTHLY BUDGET
    // ==========================================

    public void saveMonthlyBudget(
            String email,
            BudgetRequest request
    ) {

        User user = getUser(email);

        validateAmount(request.getAmount());

        financeRepository.saveMonthlyBudget(
                user.getId(),
                request.getAmount()
        );
    }


    // ==========================================
    // CATEGORY BUDGET
    // ==========================================

    public void saveCategoryBudget(
            String email,
            BudgetRequest request
    ) {

        User user = getUser(email);

        validateAmount(request.getAmount());

        if (request.getCategoryId() == null) {

            throw new IllegalArgumentException(
                    "Please select a category"
            );
        }

        financeRepository.saveCategoryBudget(
                user.getId(),
                request.getCategoryId(),
                request.getAmount()
        );
    }


    public void deleteCategoryBudget(
            String email,
            int categoryBudgetId
    ) {

        User user = getUser(email);

        financeRepository.deleteCategoryBudget(
                user.getId(),
                categoryBudgetId
        );
    }


    // ==========================================
    // RECURRING TRANSACTIONS
    // ==========================================

    public void addRecurring(
            String email,
            RecurringTransaction item
    ) {

        User user = getUser(email);

        validateAmount(item.getAmount());

        if (
                item.getTitle() == null
                        || item.getTitle()
                        .trim()
                        .isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Title is required"
            );
        }

        if (item.getCategoryId() == null) {

            throw new IllegalArgumentException(
                    "Please select a category"
            );
        }

        if (item.getType() == null) {

            throw new IllegalArgumentException(
                    "Transaction type is required"
            );
        }

        String type =
                item.getType()
                        .trim()
                        .toLowerCase();

        if (
                !type.equals("income")
                        && !type.equals("expense")
        ) {

            throw new IllegalArgumentException(
                    "Invalid transaction type"
            );
        }

        item.setType(type);

        if (item.getFrequency() == null) {

            throw new IllegalArgumentException(
                    "Frequency is required"
            );
        }

        String frequency =
                item.getFrequency()
                        .trim()
                        .toUpperCase();

        if (
                !frequency.equals("WEEKLY")
                        && !frequency.equals("MONTHLY")
        ) {

            throw new IllegalArgumentException(
                    "Frequency must be WEEKLY or MONTHLY"
            );
        }

        item.setFrequency(frequency);

        if (item.getNextRunDate() == null) {

            throw new IllegalArgumentException(
                    "Next run date is required"
            );
        }

        if (
                item.getNextRunDate()
                        .isBefore(LocalDate.now())
        ) {

            throw new IllegalArgumentException(
                    "Next run date cannot be in the past"
            );
        }

        item.setUserId(user.getId());

        financeRepository
                .addRecurringTransaction(item);
    }


    public void deleteRecurring(
            String email,
            int recurringId
    ) {

        User user = getUser(email);

        financeRepository
                .deleteRecurringTransaction(
                        user.getId(),
                        recurringId
                );
    }


    // ==========================================
    // YEARLY SPENDING GRAPH
    // ==========================================

    public List<Map<String, Object>> getYearlySpending(
            String email,
            int year
    ) {

        User user = getUser(email);

        if (year < 2000 || year > 2100) {

            throw new IllegalArgumentException(
                    "Invalid year"
            );
        }

        List<Map<String, Object>> rows =
                financeRepository.getYearlySpending(
                        user.getId(),
                        year
                );

        Map<Integer, Double> totals =
                new HashMap<>();

        for (Map<String, Object> row : rows) {

            Object monthValue =
                    row.get("monthNumber");

            Object amountValue =
                    row.get("totalAmount");

            if (
                    monthValue == null
                            || amountValue == null
            ) {
                continue;
            }

            int monthNumber =
                    Integer.parseInt(
                            monthValue.toString()
                    );

            double totalAmount =
                    Double.parseDouble(
                            amountValue.toString()
                    );

            totals.put(
                    monthNumber,
                    totalAmount
            );
        }

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (
                int month = 1;
                month <= 12;
                month++
        ) {

            Map<String, Object> item =
                    new HashMap<>();

            item.put(
                    "monthNumber",
                    month
            );

            item.put(
                    "month",
                    Month.of(month)
                            .name()
                            .substring(0, 3)
            );

            item.put(
                    "totalAmount",
                    totals.getOrDefault(
                            month,
                            0.0
                    )
            );

            result.add(item);
        }

        return result;
    }


    // ==========================================
    // VALIDATION
    // ==========================================

    private void validateAmount(Double amount) {

        if (
                amount == null
                        || amount <= 0
        ) {

            throw new IllegalArgumentException(
                    "Amount must be greater than 0"
            );
        }
    }


    // ==========================================
    // FINANCIAL INSIGHTS
    // ==========================================

    private List<Map<String, String>> buildInsights(
            int userId,
            double monthlyBudget,
            double spent,
            double percentage
    ) {

        List<Map<String, String>> insights =
                new ArrayList<>();


        // Monthly budget insight

        if (
                monthlyBudget > 0
                        && spent > monthlyBudget
        ) {

            insights.add(
                    Map.of(
                            "type",
                            "warning",

                            "title",
                            "Budget exceeded",

                            "message",
                            "You have crossed your monthly budget by Rs. "
                                    + Math.round(
                                    spent - monthlyBudget
                            )
                                    + "."
                    )
            );

        } else if (
                monthlyBudget > 0
                        && percentage >= 80
        ) {

            insights.add(
                    Map.of(
                            "type",
                            "warning",

                            "title",
                            "Budget almost used",

                            "message",
                            "You have used "
                                    + Math.round(percentage)
                                    + "% of your monthly budget."
                    )
            );

        } else if (monthlyBudget > 0) {

            insights.add(
                    Map.of(
                            "type",
                            "positive",

                            "title",
                            "Budget is under control",

                            "message",
                            "You still have Rs. "
                                    + Math.round(
                                    monthlyBudget - spent
                            )
                                    + " available this month."
                    )
            );
        }


        // Category budget warnings

        List<Map<String, Object>> categoryBudgets =
                financeRepository
                        .getCategoryBudgets(userId);

        for (
                Map<String, Object> budget
                : categoryBudgets
        ) {

            double budgetAmount =
                    toDouble(
                            budget.get("budgetAmount")
                    );

            double spentAmount =
                    toDouble(
                            budget.get("spentAmount")
                    );

            String categoryName =
                    String.valueOf(
                            budget.get("categoryName")
                    );

            if (
                    budgetAmount > 0
                            && spentAmount > budgetAmount
            ) {

                insights.add(
                        Map.of(
                                "type",
                                "warning",

                                "title",
                                categoryName
                                        + " budget exceeded",

                                "message",
                                "You have crossed your "
                                        + categoryName
                                        + " budget by Rs. "
                                        + Math.round(
                                        spentAmount
                                                - budgetAmount
                                )
                                        + "."
                        )
                );

            } else if (
                    budgetAmount > 0
                            && spentAmount
                            >= budgetAmount * 0.8
            ) {

                double used =
                        (spentAmount / budgetAmount)
                                * 100;

                insights.add(
                        Map.of(
                                "type",
                                "warning",

                                "title",
                                categoryName
                                        + " budget almost used",

                                "message",
                                "You have used "
                                        + Math.round(used)
                                        + "% of your "
                                        + categoryName
                                        + " budget."
                        )
                );
            }
        }


        // Month comparison

        List<Map<String, Object>> comparison =
                financeRepository
                        .getMonthlyComparison(userId);

        if (!comparison.isEmpty()) {

            double current =
                    toDouble(
                            comparison
                                    .get(0)
                                    .get("currentMonth")
                    );

            double previous =
                    toDouble(
                            comparison
                                    .get(0)
                                    .get("previousMonth")
                    );

            if (previous > 0) {

                double change =
                        (
                                (current - previous)
                                        / previous
                        ) * 100;

                if (change >= 10) {

                    insights.add(
                            Map.of(
                                    "type",
                                    "info",

                                    "title",
                                    "Spending increased",

                                    "message",
                                    "You spent "
                                            + Math.round(change)
                                            + "% more than last month."
                            )
                    );

                } else if (change <= -10) {

                    insights.add(
                            Map.of(
                                    "type",
                                    "positive",

                                    "title",
                                    "Spending improved",

                                    "message",
                                    "You spent "
                                            + Math.round(
                                            Math.abs(change)
                                    )
                                            + "% less than last month."
                            )
                    );
                }
            }
        }


        // Top category

        Map<String, Object> topCategory =
                financeRepository
                        .getTopCategoryThisMonth(userId);

        if (!topCategory.isEmpty()) {

            String categoryName =
                    String.valueOf(
                            topCategory.get(
                                    "categoryName"
                            )
                    );

            double amount =
                    toDouble(
                            topCategory.get(
                                    "totalAmount"
                            )
                    );

            insights.add(
                    Map.of(
                            "type",
                            "info",

                            "title",
                            "Top spending category",

                            "message",
                            categoryName
                                    + " is your highest category this month at Rs. "
                                    + Math.round(amount)
                                    + "."
                    )
            );
        }


        if (insights.isEmpty()) {

            insights.add(
                    Map.of(
                            "type",
                            "info",

                            "title",
                            "Add more transactions",

                            "message",
                            "More transaction history will help generate useful spending insights."
                    )
            );
        }

        return insights;
    }


    private double toDouble(Object value) {

        if (value == null) {
            return 0;
        }

        if (value instanceof Number number) {
            return number.doubleValue();
        }

        try {

            return Double.parseDouble(
                    value.toString()
            );

        } catch (NumberFormatException e) {

            return 0;
        }
    }


    // ==========================================
    // RECURRING TRANSACTION SCHEDULER
    // ==========================================

    @Scheduled(cron = "0 0 * * * *")
    public void processRecurringTransactions() {

        List<RecurringTransaction> dueItems =
                financeRepository
                        .getDueRecurringTransactions();

        LocalDate today =
                LocalDate.now();

        for (
                RecurringTransaction item
                : dueItems
        ) {

            LocalDate runDate =
                    item.getNextRunDate();

            if (runDate == null) {
                continue;
            }

            while (
                    !runDate.isAfter(today)
            ) {

                item.setNextRunDate(runDate);

                financeRepository
                        .createExpenseFromRecurring(item);

                if (
                        "WEEKLY".equalsIgnoreCase(
                                item.getFrequency()
                        )
                ) {

                    runDate =
                            runDate.plusWeeks(1);

                } else {

                    runDate =
                            runDate.plusMonths(1);
                }
            }

            financeRepository
                    .updateRecurringNextRun(
                            item.getRecurringId(),
                            runDate
                    );
        }
    }


    // ==========================================
    // MONTHLY PDF REPORT
    // ==========================================

    public byte[] generateMonthlyReport(
            String email,
            int year,
            int month
    ) throws Exception {

        User user = getUser(email);

        if (
                month < 1
                        || month > 12
        ) {

            throw new IllegalArgumentException(
                    "Invalid month"
            );
        }

        List<Map<String, Object>> summary =
                financeRepository
                        .getReportSummary(
                                user.getId(),
                                year,
                                month
                        );

        List<Map<String, Object>> categories =
                financeRepository
                        .getReportCategories(
                                user.getId(),
                                year,
                                month
                        );

        List<Map<String, Object>> transactions =
                financeRepository
                        .getReportTransactions(
                                user.getId(),
                                year,
                                month
                        );

        double income = 0;
        double expense = 0;

        if (!summary.isEmpty()) {

            income =
                    toDouble(
                            summary
                                    .get(0)
                                    .get("income")
                    );

            expense =
                    toDouble(
                            summary
                                    .get(0)
                                    .get("expense")
                    );
        }


        try (
                PDDocument document =
                        new PDDocument();

                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {

            PDPage page =
                    new PDPage();

            document.addPage(page);


            PDType1Font bold =
                    new PDType1Font(
                            Standard14Fonts
                                    .FontName
                                    .HELVETICA_BOLD
                    );

            PDType1Font normal =
                    new PDType1Font(
                            Standard14Fonts
                                    .FontName
                                    .HELVETICA
                    );


            try (
                    PDPageContentStream content =
                            new PDPageContentStream(
                                    document,
                                    page
                            )
            ) {

                float y = 750;


                y = writeLine(
                        content,
                        bold,
                        20,
                        50,
                        y,
                        "ExpenseTracker Monthly Report"
                );


                y = writeLine(
                        content,
                        normal,
                        12,
                        50,
                        y - 4,
                        Month.of(month)
                                + " "
                                + year
                                + " | "
                                + user.getName()
                );


                y = writeLine(
                        content,
                        bold,
                        13,
                        50,
                        y - 18,
                        "Summary"
                );


                y = writeLine(
                        content,
                        normal,
                        11,
                        50,
                        y,
                        "Total Income: Rs. "
                                + String.format(
                                "%.2f",
                                income
                        )
                );


                y = writeLine(
                        content,
                        normal,
                        11,
                        50,
                        y,
                        "Total Expenses: Rs. "
                                + String.format(
                                "%.2f",
                                expense
                        )
                );


                y = writeLine(
                        content,
                        normal,
                        11,
                        50,
                        y,
                        "Net Cash Flow: Rs. "
                                + String.format(
                                "%.2f",
                                income - expense
                        )
                );


                y = writeLine(
                        content,
                        bold,
                        13,
                        50,
                        y - 16,
                        "Top Spending Categories"
                );


                if (categories.isEmpty()) {

                    y = writeLine(
                            content,
                            normal,
                            11,
                            50,
                            y,
                            "No expense data for this month."
                    );

                } else {

                    for (
                            Map<String, Object> category
                            : categories
                    ) {

                        if (y < 100) {
                            break;
                        }

                        y = writeLine(
                                content,
                                normal,
                                11,
                                50,
                                y,
                                category.get(
                                        "categoryName"
                                )
                                        + ": Rs. "
                                        + category.get(
                                        "totalAmount"
                                )
                        );
                    }
                }


                y = writeLine(
                        content,
                        bold,
                        13,
                        50,
                        y - 16,
                        "Recent Transactions"
                );


                int count = 0;

                for (
                        Map<String, Object> transaction
                        : transactions
                ) {

                    if (
                            count == 15
                                    || y < 60
                    ) {

                        break;
                    }

                    String line =
                            transaction.get("date")
                                    + " | "
                                    + transaction.get("title")
                                    + " | "
                                    + transaction.get("type")
                                    + " | Rs. "
                                    + transaction.get("amount");


                    y = writeLine(
                            content,
                            normal,
                            9,
                            50,
                            y,
                            line
                    );

                    count++;
                }
            }


            document.save(output);

            return output.toByteArray();
        }
    }


    // ==========================================
    // PDF TEXT WRITER
    // ==========================================

    private float writeLine(
            PDPageContentStream content,
            PDType1Font font,
            float size,
            float x,
            float y,
            String text
    ) throws Exception {

        content.beginText();

        content.setFont(
                font,
                size
        );

        content.newLineAtOffset(
                x,
                y
        );

        content.showText(
                text == null
                        ? ""
                        : text.replace(
                        "₹",
                        "Rs."
                )
        );

        content.endText();

        return y - 18;
    }
}