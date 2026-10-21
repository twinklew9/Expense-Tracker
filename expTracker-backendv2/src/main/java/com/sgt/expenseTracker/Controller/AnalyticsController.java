package com.sgt.expenseTracker.Controller;

import com.sgt.expenseTracker.Service.AnalyticsService;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(
            HttpSession session
    ) {

        try {

            String email =
                    (String) session.getAttribute(
                            "userEmail"
                    );

            if (email == null) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                Map.of(
                                        "Value",
                                        "Please login first"
                                )
                        );
            }

            return ResponseEntity.ok(
                    analyticsService.getAnalytics(email)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "Value",
                                    "Error fetching analytics"
                            )
                    );
        }
    }
}
