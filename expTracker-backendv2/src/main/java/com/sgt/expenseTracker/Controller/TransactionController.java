package com.sgt.expenseTracker.Controller;

import com.sgt.expenseTracker.Model.Expense;
import com.sgt.expenseTracker.Model.User;
import com.sgt.expenseTracker.Repository.ExpRepository;
import com.sgt.expenseTracker.Service.AiService;
import com.sgt.expenseTracker.Service.TransactionsService;

import jakarta.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class TransactionController {

    @Autowired
    private TransactionsService transactionService;

    @Autowired
    private ExpRepository expRepository;

    @Autowired
    private AiService aiService;

    private static final Logger logger =
            LoggerFactory.getLogger(TransactionController.class);

    @PostMapping("/add-expense")
    public ResponseEntity<?> addExpense(
            @RequestBody Expense expense,
            HttpSession session
    ) {
        try {
            User user = getLoggedInUser(session);

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("Value", "Please login first"));
            }

            expense.setUserId(user.getId());

            transactionService.addExpense(expense);

            return ResponseEntity.ok(
                    Map.of(
                            "Value",
                            "Transaction Recorded Successfully"
                    )
            );

        } catch (Exception e) {
            logger.error("Error adding transaction: ", e);

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "Value",
                                    "Error adding transaction"
                            )
                    );
        }
    }

    @GetMapping("/get-expenses")
    public ResponseEntity<?> getExpenses(
            HttpSession session,

            @RequestParam(
                    name = "category",
                    required = false
            )
            String category,

            @RequestParam(
                    name = "start",
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime start,

            @RequestParam(
                    name = "end",
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime end,

            @RequestParam(
                    name = "type",
                    required = false
            )
            String type,

            @RequestParam(
                    name = "pageNumber",
                    required = false,
                    defaultValue = "1"
            )
            String pageNumber,

            @RequestParam(
                    name = "numberOfRecordsPerPage",
                    required = false,
                    defaultValue = "10"
            )
            String numberOfRecordsPerPage
    ) {
        try {
            User user = getLoggedInUser(session);

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("Value", "Please login first"));
            }

            Map<String, Object> responsePayload =
                    transactionService.getDynamicFilteredExpenses(
                            user.getEmail(),
                            category,
                            start,
                            end,
                            type,
                            pageNumber,
                            numberOfRecordsPerPage
                    );

            return ResponseEntity.ok(responsePayload);

        } catch (Exception e) {
            logger.error("Error fetching expenses: ", e);

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "Value",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Error fetching expenses"
                            )
                    );
        }
    }

    @DeleteMapping("/delete-expense/{expenseId}")
    public ResponseEntity<?> deleteExpense(
            @PathVariable int expenseId,
            HttpSession session
    ) {
        try {
            User user = getLoggedInUser(session);

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("Value", "Please login first"));
            }

            transactionService.deleteExpense(
                    expenseId,
                    user.getId()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "Value",
                            "Transaction Deleted"
                    )
            );

        } catch (Exception e) {
            logger.error("Error deleting transaction: ", e);

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "Value",
                                    "Error deleting transaction"
                            )
                    );
        }
    }

    @PutMapping("/update-expense")
    public ResponseEntity<?> updateExpense(
            @RequestBody Expense expense,
            HttpSession session
    ) {
        try {
            User user = getLoggedInUser(session);

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("Value", "Please login first"));
            }

            expense.setUserId(user.getId());

            transactionService.updateExpense(expense);

            return ResponseEntity.ok(
                    Map.of(
                            "Value",
                            "Transaction Updated Successfully"
                    )
            );

        } catch (Exception e) {
            logger.error("Error updating transaction: ", e);

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "Value",
                                    "Error updating transaction"
                            )
                    );
        }
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUpload(
            @RequestParam(name = "file") MultipartFile file,
            HttpSession session
    ) {
        try {
            User user = getLoggedInUser(session);

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("Value", "Please login first"));
            }

            logger.info(
                    "Initiating bulk upload for user: {}",
                    user.getEmail()
            );

            List<List<String>> exceptions =
                    transactionService.read(
                            file,
                            user.getEmail()
                    );

            return ResponseEntity.ok(exceptions);

        } catch (Exception e) {
            logger.error("Error during bulk upload: ", e);

            return ResponseEntity.badRequest()
                    .body(
                            List.of(
                                    List.of(
                                            "System Error",
                                            e.getMessage() != null
                                                    ? e.getMessage()
                                                    : "Unknown error"
                                    )
                            )
                    );
        }
    }

    @GetMapping("/prompt/{note}")
    public String suggestCategories(
            @PathVariable(name = "note") String note
    ) {
        return aiService.suggestCategory(
                note,
                List.of(
                        "food",
                        "clothing",
                        "entertainment",
                        "travel",
                        "bills"
                )
        );
    }

    private User getLoggedInUser(HttpSession session) {

        String email =
                (String) session.getAttribute("userEmail");

        if (email == null) {
            return null;
        }

        return expRepository.findByEmail(email);
    }
}