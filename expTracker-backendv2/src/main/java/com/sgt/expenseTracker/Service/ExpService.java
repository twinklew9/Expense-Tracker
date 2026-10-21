package com.sgt.expenseTracker.Service;

import com.sgt.expenseTracker.Exception.EmailAlreadyExistsException;
import com.sgt.expenseTracker.Exception.InvalidEmailException;
import com.sgt.expenseTracker.Exception.UserNameAlreadyExistsException;
import com.sgt.expenseTracker.Model.User;
import com.sgt.expenseTracker.Repository.ExpRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ExpService {

    @Autowired
    private ExpRepository expRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void register(User user)
            throws InvalidEmailException,
            EmailAlreadyExistsException,
            UserNameAlreadyExistsException {

        if (!isValidEmail(user.getEmail())) {
            throw new InvalidEmailException();
        }

        if (expRepository.findByEmail(user.getEmail()) != null) {
            throw new EmailAlreadyExistsException();
        }

        if (expRepository.findByUsername(user.getUsername()) != null) {
            throw new UserNameAlreadyExistsException();
        }

        String encodedPassword =
                passwordEncoder.encode(user.getPassword());

        expRepository.addUser(
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                encodedPassword,
                user.getPhone()
        );
    }

    public ResponseEntity<?> login(User user) {

        User dbUser =
                expRepository.findByEmail(user.getEmail());

        if (dbUser == null) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "Value",
                            "Invalid Credentials"
                    ));
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        user.getPassword(),
                        dbUser.getPassword()
                );

        if (!passwordMatches) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "Value",
                            "Invalid Credentials"
                    ));
        }

        dbUser.setPassword(null);

        return ResponseEntity.ok()
                .body(Map.of(
                        "user",
                        dbUser,
                        "Value",
                        "Login Successful"
                ));
    }

    public void forgotPwd(Map<String, String> body)
            throws InvalidEmailException {

        String email = body.get("email");

        User user =
                expRepository.findByEmail(email);

        if (user == null) {
            throw new InvalidEmailException();
        }

        expRepository.invalidateAllTokens(user.getId());

        String token =
                UUID.randomUUID().toString();

        LocalDateTime expiry =
                LocalDateTime.now().plusMinutes(15);

        int res = expRepository.saveToken(
                token,
                expiry,
                user.getId()
        );

        if (res == 1) {

            String link =
                    "http://localhost:5173/reset-pwd/"
                            + token;

            emailService.sendEmail(email, link);
        }
    }

    public void validateToken(Map<String, String> body) {
        String token = body.get("token");
        expRepository.validateToken(token);
    }

    public ResponseEntity<?> verifyToken(String token) {

        Integer userId =
                expRepository.validateToken(token);

        if (userId != null) {
            return ResponseEntity.ok()
                    .body(Map.of(
                            "Value",
                            "Valid Token"
                    ));
        }

        return ResponseEntity.badRequest()
                .body(Map.of(
                        "Value",
                        "Invalid or Expired Token"
                ));
    }

    public ResponseEntity<?> resetPassword(
            String token,
            String newPassword
    ) {

        Integer userId =
                expRepository.validateToken(token);

        if (userId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "Value",
                            "Invalid or expired token."
                    ));
        }

        String encodedPassword =
                passwordEncoder.encode(newPassword);

        expRepository.updatePassword(
                userId,
                encodedPassword
        );

        expRepository.markTokenAsUsed(token);

        return ResponseEntity.ok()
                .body(Map.of(
                        "Value",
                        "Password changed successfully"
                ));
    }

    public boolean isValidEmail(String email) {

        if (email == null) {
            return false;
        }

        String EMAIL_PATTERN =
                "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

        Pattern pattern =
                Pattern.compile(EMAIL_PATTERN);

        Matcher matcher =
                pattern.matcher(email);

        return matcher.matches();
    }
}