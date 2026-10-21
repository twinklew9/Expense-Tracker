package com.sgt.expenseTracker.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    JavaMailSender mailSender;
    public void sendEmail(String to, String link){
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(message);
        String htmlContent =
                "<html>" +
                        "<body style='font-family: Arial, sans-serif;'>" +
                        "<h2>Reset Your Password</h2>" +
                        "<p>Click the link below to reset your password:</p>" +
                        "<a href='" + link + "' " +
                        "style='display:inline-block;padding:10px 20px;" +
                        "background-color:#2563eb;color:#ffffff;" +
                        "text-decoration:none;border-radius:5px;'>Reset Password</a>" +
                        "<p>This link will expire in 15 minutes.</p>" +
                        "</body>" +
                        "</html>";
        try {
            messageHelper.setTo(to);
            messageHelper.setText(htmlContent, true);
            messageHelper.setSubject("Reset password Expense Tracker");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}