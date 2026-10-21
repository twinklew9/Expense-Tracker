package com.sgt.expenseTracker.Service;

import com.sgt.expenseTracker.Model.Category;
import com.sgt.expenseTracker.Model.Expense;
import com.sgt.expenseTracker.Model.User;
import com.sgt.expenseTracker.Repository.CategoryRepository;
import com.sgt.expenseTracker.Repository.TransactionsRepository;
import com.sgt.expenseTracker.Repository.ExpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

@Service
public class TransactionsService {

    private static final Logger logger = LoggerFactory.getLogger(TransactionsService.class);

    @Autowired
    private TransactionsRepository transactionRepository;

    @Autowired
    private ExpRepository expRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AiService aiService;

    public void addExpense(Expense expense) {
        if (expense.getDate() == null) {
            expense.setDate(LocalDateTime.now());
        }

        validateTransactionDate(expense.getDate());
        transactionRepository.addExpense(expense);
    }

    public Map<String, Object> getDynamicFilteredExpenses(
            String email,
            String categoryName,
            LocalDateTime start,
            LocalDateTime end,
            String type,
            String pageNumber,
            String numberOfRecordsPerPage
    ) {
        User user = expRepository.findByEmail(email);

        if (user == null) {
            return Map.of("expenses", List.of(), "totalPages", 0);
        }

        return transactionRepository.getDynamicFilteredExpenses(
                user.getId(),
                categoryName,
                start,
                end,
                type,
                pageNumber,
                numberOfRecordsPerPage
        );
    }

    public void updateExpense(Expense expense) {
        if (expense.getDate() == null) {
            expense.setDate(LocalDateTime.now());
        }

        validateTransactionDate(expense.getDate());
        transactionRepository.updateExpense(expense);
    }

    public void deleteExpense(int expenseId, int userId) {
        transactionRepository.softDeleteExpense(expenseId, userId);
    }

    private void validateTransactionDate(LocalDateTime transactionDate) {
        if (transactionDate.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "Transaction date cannot be in the future"
            );
        }
    }

    public List<List<String>> read(MultipartFile file, String email) throws IOException {
        List<List<String>> exceptions = new ArrayList<>();

        User user = expRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        int userId = user.getId();

        Scanner scanner = new Scanner(
                new InputStreamReader(file.getInputStream())
        );

        if (scanner.hasNextLine()) {
            scanner.nextLine();
        }

        while (scanner.hasNextLine()) {
            String row = scanner.nextLine();

            if (row.trim().isEmpty()) {
                continue;
            }

            List<String> rowDataAndErrors = new ArrayList<>();
            rowDataAndErrors.add(row);

            String[] rowData = row.split(",", -1);
            List<String> currentErrors = new ArrayList<>();

            if (rowData.length < 5) {
                currentErrors.add(
                        "Missing columns (Expected 5, found "
                                + rowData.length
                                + ")"
                );
            } else {
                Double amount = 0.0;

                try {
                    amount = Double.valueOf(rowData[0].trim());

                    if (amount <= 0) {
                        currentErrors.add("Amount must be greater than 0");
                    }
                } catch (NumberFormatException e) {
                    currentErrors.add("Invalid amount format");
                }

                String note = rowData[1].trim();

                if (note.isEmpty()) {
                    currentErrors.add("Title/Note cannot be empty");
                } else if (note.length() > 255) {
                    currentErrors.add("Title/Note exceeds 255 characters");
                }

                String categoryName = rowData[2].trim();

                if (categoryName.isEmpty()) {
                    List<Category> existingCategoriesList =
                            categoryRepository.findAllByUserID(userId);

                    List<String> existingCategories = new ArrayList<>();

                    for (Category category : existingCategoriesList) {
                        existingCategories.add(category.getName());
                    }

                    categoryName = aiService.suggestCategory(
                            note,
                            existingCategories
                    );
                }

                LocalDate localDate = null;

                try {
                    localDate = LocalDate.parse(rowData[3].trim());

                    if (localDate.isAfter(LocalDate.now())) {
                        currentErrors.add("Date cannot be in the future");
                    }
                } catch (DateTimeParseException e) {
                    currentErrors.add(
                            "Invalid date format (Expected YYYY-MM-DD)"
                    );
                }

                String type = rowData[4].trim().toLowerCase();

                if (!type.equals("expense") && !type.equals("income")) {
                    currentErrors.add(
                            "Type must be exactly 'expense' or 'income'"
                    );
                }

                if (!currentErrors.isEmpty()) {
                    String combinedErrorMessage =
                            String.join(" | ", currentErrors);

                    rowDataAndErrors.add(combinedErrorMessage);
                    exceptions.add(rowDataAndErrors);
                    continue;
                }

                try {
                    Category category =
                            categoryRepository.findByNameTypeAndUserId(
                                    categoryName,
                                    type,
                                    userId
                            );

                    if (category == null) {
                        categoryRepository.createCategory(
                                userId,
                                categoryName
                        );

                        category =
                                categoryRepository.findByNameTypeAndUserId(
                                        categoryName,
                                        type,
                                        userId
                                );
                    }

                    Expense expense = new Expense();
                    expense.setUserId(userId);
                    expense.setTitle(note);
                    expense.setAmount(amount);
                    expense.setCategoryId(category.getCategoryId());
                    expense.setDate(localDate.atStartOfDay());
                    expense.setType(type);

                    transactionRepository.addExpense(expense);
                    exceptions.add(new ArrayList<>());

                } catch (Exception e) {
                    rowDataAndErrors.add(
                            "Database save failed: " + e.getMessage()
                    );

                    exceptions.add(rowDataAndErrors);
                }
            }
        }

        scanner.close();
        return exceptions;
    }
}
