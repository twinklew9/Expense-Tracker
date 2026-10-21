package com.sgt.expenseTracker.Service;

import com.sgt.expenseTracker.Model.User;
import com.sgt.expenseTracker.Repository.AnalyticsRepository;
import com.sgt.expenseTracker.Repository.ExpRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private AnalyticsRepository analyticsRepository;

    @Autowired
    private ExpRepository expRepository;

    public Map<String, Object> getAnalytics(String email) {

        User user = expRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException(
                    "User not found"
            );
        }

        Map<String, Object> summary =
                analyticsRepository.getSummary(
                        user.getId()
                );

        List<Map<String, Object>> categorySpending =
                analyticsRepository.getCategorySpending(
                        user.getId()
                );

        List<Map<String, Object>> monthlyTrend =
                analyticsRepository.getMonthlyTrend(
                        user.getId()
                );

        BigDecimal totalIncome =
                new BigDecimal(
                        summary.get("totalIncome").toString()
                );

        BigDecimal totalExpense =
                new BigDecimal(
                        summary.get("totalExpense").toString()
                );

        BigDecimal balance =
                totalIncome.subtract(totalExpense);

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "totalIncome",
                totalIncome
        );

        response.put(
                "totalExpense",
                totalExpense
        );

        response.put(
                "balance",
                balance
        );

        response.put(
                "categorySpending",
                categorySpending
        );

        response.put(
                "monthlyTrend",
                monthlyTrend
        );

        return response;
    }
}