package com.project.financetracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DashboardResponse(
        LocalDate periodStartDate,
        LocalDate periodEndDate,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal net,
        List<CategoryBreakdown> byCategory
) {
    public record CategoryBreakdown(Long categoryId, String categoryName, BigDecimal total) {}
}
