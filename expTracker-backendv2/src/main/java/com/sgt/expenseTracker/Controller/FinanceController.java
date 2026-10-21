package com.sgt.expenseTracker.Controller;

import com.sgt.expenseTracker.Model.BudgetRequest;
import com.sgt.expenseTracker.Model.RecurringTransaction;
import com.sgt.expenseTracker.Service.FinanceService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
@RequestMapping("/finance")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    private String getEmail(HttpSession session) {
        return (String) session.getAttribute("userEmail");
    }

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(HttpSession session) {
        String email = getEmail(session);

        if (email == null) {
            return unauthorized();
        }

        try {
            return ResponseEntity.ok(
                    financeService.getOverview(email)
            );
        } catch (Exception e) {
            return badRequest(e);
        }
    }

    @GetMapping("/yearly-spending")
    public ResponseEntity<?> getYearlySpending(
            @RequestParam(defaultValue = "0") int year,
            HttpSession session
    ) {
        String email = getEmail(session);

        if (email == null) {
            return unauthorized();
        }

        try {
            int selectedYear = year == 0
                    ? LocalDate.now().getYear()
                    : year;

            if (selectedYear < 2000 || selectedYear > 2100) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("Value", "Invalid year"));
            }

            return ResponseEntity.ok(
                    financeService.getYearlySpending(
                            email,
                            selectedYear
                    )
            );
        } catch (Exception e) {
            return badRequest(e);
        }
    }

    @PutMapping("/monthly-budget")
    public ResponseEntity<?> saveMonthlyBudget(
            @RequestBody BudgetRequest request,
            HttpSession session
    ) {
        String email = getEmail(session);

        if (email == null) {
            return unauthorized();
        }

        try {
            financeService.saveMonthlyBudget(email, request);

            return ResponseEntity.ok(
                    Map.of("Value", "Monthly budget saved")
            );
        } catch (Exception e) {
            return badRequest(e);
        }
    }

    @PutMapping("/category-budget")
    public ResponseEntity<?> saveCategoryBudget(
            @RequestBody BudgetRequest request,
            HttpSession session
    ) {
        String email = getEmail(session);

        if (email == null) {
            return unauthorized();
        }

        try {
            financeService.saveCategoryBudget(email, request);

            return ResponseEntity.ok(
                    Map.of("Value", "Category budget saved")
            );
        } catch (Exception e) {
            return badRequest(e);
        }
    }

    @DeleteMapping("/category-budget/{categoryBudgetId}")
    public ResponseEntity<?> deleteCategoryBudget(
            @PathVariable int categoryBudgetId,
            HttpSession session
    ) {
        String email = getEmail(session);

        if (email == null) {
            return unauthorized();
        }

        try {
            financeService.deleteCategoryBudget(
                    email,
                    categoryBudgetId
            );

            return ResponseEntity.ok(
                    Map.of("Value", "Category budget removed")
            );
        } catch (Exception e) {
            return badRequest(e);
        }
    }

    @PostMapping("/recurring")
    public ResponseEntity<?> addRecurring(
            @RequestBody RecurringTransaction item,
            HttpSession session
    ) {
        String email = getEmail(session);

        if (email == null) {
            return unauthorized();
        }

        try {
            financeService.addRecurring(email, item);

            return ResponseEntity.ok(
                    Map.of(
                            "Value",
                            "Recurring transaction added"
                    )
            );
        } catch (Exception e) {
            return badRequest(e);
        }
    }

    @DeleteMapping("/recurring/{recurringId}")
    public ResponseEntity<?> deleteRecurring(
            @PathVariable int recurringId,
            HttpSession session
    ) {
        String email = getEmail(session);

        if (email == null) {
            return unauthorized();
        }

        try {
            financeService.deleteRecurring(email, recurringId);

            return ResponseEntity.ok(
                    Map.of(
                            "Value",
                            "Recurring transaction removed"
                    )
            );
        } catch (Exception e) {
            return badRequest(e);
        }
    }

    @GetMapping(
            value = "/report",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<?> getReport(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month,
            HttpSession session
    ) {
        String email = getEmail(session);

        if (email == null) {
            return unauthorized();
        }

        try {
            LocalDate today = LocalDate.now();

            int reportYear = year == 0
                    ? today.getYear()
                    : year;

            int reportMonth = month == 0
                    ? today.getMonthValue()
                    : month;

            if (reportYear < 2000 || reportYear > 2100) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("Value", "Invalid year"));
            }

            if (reportMonth < 1 || reportMonth > 12) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("Value", "Invalid month"));
            }

            byte[] report =
                    financeService.generateMonthlyReport(
                            email,
                            reportYear,
                            reportMonth
                    );

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=expense-report-"
                                    + reportYear
                                    + "-"
                                    + reportMonth
                                    + ".pdf"
                    )
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(report);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "Value",
                                    "Could not generate report"
                            )
                    );
        }
    }

    private ResponseEntity<?> badRequest(Exception e) {
        String message = e.getMessage() == null
                ? "Something went wrong"
                : e.getMessage();

        return ResponseEntity
                .badRequest()
                .body(Map.of("Value", message));
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("Value", "Please login first"));
    }
}
