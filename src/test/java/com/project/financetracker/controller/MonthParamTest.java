package com.project.financetracker.controller;

import com.project.financetracker.exception.InvalidPeriodException;
import org.junit.jupiter.api.Test;

import java.time.YearMonth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MonthParamTest {

    @Test
    void parsesAValidMonth() {
        assertThat(MonthParam.resolve("2026-09")).isEqualTo(YearMonth.of(2026, 9));
    }

    @Test
    void defaultsToTheCurrentMonthWhenAbsentOrBlank() {
        assertThat(MonthParam.resolve(null)).isEqualTo(YearMonth.now());
        assertThat(MonthParam.resolve("  ")).isEqualTo(YearMonth.now());
    }

    @Test
    void rejectsAMalformedMonth() {
        assertThatThrownBy(() -> MonthParam.resolve("2026-13"))
                .isInstanceOf(InvalidPeriodException.class);
        assertThatThrownBy(() -> MonthParam.resolve("September"))
                .isInstanceOf(InvalidPeriodException.class);
    }
}
