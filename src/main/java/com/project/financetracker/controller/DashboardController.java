package com.project.financetracker.controller;

import com.project.financetracker.dto.DashboardResponse;
import com.project.financetracker.exception.InvalidPeriodException;
import com.project.financetracker.model.User;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/api/dashboards")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public DashboardResponse getDashboard(@RequestParam(required = false) String month) {
        User user = currentUserService.getCurrentUser();
        YearMonth period = resolvePeriod(month);
        return dashboardService.buildDashboard(user, period);
    }

    private YearMonth resolvePeriod(String month) {
        if (month == null || month.isBlank()) {
            return YearMonth.now();
        }
        try {
            return YearMonth.parse(month);
        } catch (DateTimeParseException e) {
            throw new InvalidPeriodException(
                    "Invalid month format: '" + month + "'. Expected YYYY-MM (e.g. 2026-09)."
            );
        }
    }
}
