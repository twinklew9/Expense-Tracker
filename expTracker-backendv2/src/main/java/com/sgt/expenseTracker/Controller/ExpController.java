package com.sgt.expenseTracker.Controller;

import com.sgt.expenseTracker.Exception.EmailAlreadyExistsException;
import com.sgt.expenseTracker.Exception.InvalidEmailException;
import com.sgt.expenseTracker.Exception.UserNameAlreadyExistsException;
import com.sgt.expenseTracker.Model.User;
import com.sgt.expenseTracker.Service.ExpService;

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
public class ExpController {

    @Autowired
    private ExpService expService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @RequestBody User user
    ) {
        try {

            expService.register(user);

            return ResponseEntity.ok(
                    Map.of(
                            "Value",
                            "Inserted Successfully"
                    )
            );

        } catch (
                EmailAlreadyExistsException |
                UserNameAlreadyExistsException |
                InvalidEmailException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "Value",
                                    e.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User user,
            HttpSession session
    ) {
        try {

            ResponseEntity<?> response =
                    expService.login(user);

            if (response.getStatusCode().is2xxSuccessful()) {

                session.setAttribute(
                        "userEmail",
                        user.getEmail()
                );
            }

            return response;

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "Value",
                                    "Invalid credentials"
                            )
                    );
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody Map<String, String> body
    ) {
        try {

            expService.forgotPwd(body);

            return ResponseEntity.ok(
                    Map.of(
                            "Value",
                            "Instructions sent successfully."
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "Value",
                                    "Error processing request."
                            )
                    );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpSession session
    ) {

        session.invalidate();

        return ResponseEntity.ok(
                Map.of(
                        "Value",
                        "Logged Out Successfully"
                )
        );
    }
}