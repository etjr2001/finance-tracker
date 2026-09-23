package com.project.financetracker.service;

import com.project.financetracker.dto.DashboardResponse;
import com.project.financetracker.model.Category;
import com.project.financetracker.model.Transaction;
import com.project.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DashboardServiceTest {

    private final TransactionRepository transactionRepository = mock(TransactionRepository.class);
    private final DashboardService service = new DashboardService(transactionRepository);

    private static final UUID USER_ID = UUID.randomUUID();
    private static final YearMonth PERIOD = YearMonth.of(2026, 3);

    private static Category category(long id, String name) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        return category;
    }

    private static Transaction transaction(Transaction.Type type, String amount, Category category) {
        return Transaction.builder()
                .userId(USER_ID)
                .type(type)
                .amount(new BigDecimal(amount))
                .date(LocalDate.of(2026, 3, 15))
                .category(category)
                .build();
    }

    private void givenTransactions(Transaction... transactions) {
        when(transactionRepository.findByUserIdAndDateBetween(USER_ID, PERIOD.atDay(1), PERIOD.atEndOfMonth()))
                .thenReturn(List.of(transactions));
    }

    @Test
    void excludesZeroAmountDraftsFromCategoryBreakdown() {
        Category groceries = category(1L, "Groceries");
        givenTransactions(
                transaction(Transaction.Type.EXPENSE, "0", groceries),
                transaction(Transaction.Type.EXPENSE, "25.00", groceries)
        );

        DashboardResponse response = service.buildDashboard(USER_ID, PERIOD);

        assertThat(response.byCategory()).containsExactly(
                new DashboardResponse.CategoryBreakdown(1L, "Groceries", new BigDecimal("25.00"))
        );
    }

    @Test
    void omitsACategoryThatHasOnlyDrafts() {
        Category groceries = category(1L, "Groceries");
        givenTransactions(transaction(Transaction.Type.EXPENSE, "0", groceries));

        DashboardResponse response = service.buildDashboard(USER_ID, PERIOD);

        assertThat(response.byCategory()).isEmpty();
    }

    @Test
    void stillIncludesIncomeInTotalsButNeverInCategoryBreakdown() {
        Category salary = category(2L, "Salary");
        givenTransactions(transaction(Transaction.Type.INCOME, "1000.00", salary));

        DashboardResponse response = service.buildDashboard(USER_ID, PERIOD);

        assertThat(response.totalIncome()).isEqualTo(new BigDecimal("1000.00"));
        assertThat(response.byCategory()).isEmpty();
    }
}
