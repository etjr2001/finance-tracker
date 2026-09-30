package com.project.financetracker.controller;

import com.project.financetracker.exception.InvalidPeriodException;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;

// Parses the shared `?month=YYYY-MM` query parameter (ADR0011). Absent or
// blank means the current month.
final class MonthParam {

    private MonthParam() {}

    static YearMonth resolve(String month) {
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
