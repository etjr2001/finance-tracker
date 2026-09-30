package com.project.financetracker.controller;

import com.project.financetracker.dto.DashboardResponse;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboards")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public DashboardResponse getDashboard(@RequestParam(required = false) String month) {
        UUID userId = currentUserService.getCurrentUserId();
        return dashboardService.buildDashboard(userId, MonthParam.resolve(month));
    }
}