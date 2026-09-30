package com.project.financetracker.service;

import com.project.financetracker.model.Transaction;
import com.project.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TransactionServiceTest {

    private final TransactionRepository transactionRepository = mock(TransactionRepository.class);
    private final CategoryService categoryService = mock(CategoryService.class);
    private final TransactionService service = new TransactionService(transactionRepository, categoryService);

    private static final UUID USER_ID = UUID.randomUUID();

    @Test
    void listForMonthQueriesFirstThroughLastDayOfThatMonth() {
        Transaction transaction = Transaction.builder().userId(USER_ID).build();
        when(transactionRepository.findByUserIdAndDateBetween(
                USER_ID, LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 28)))
                .thenReturn(List.of(transaction));

        assertThat(service.listForMonth(USER_ID, YearMonth.of(2026, 2))).containsExactly(transaction);
    }

    @Test
    void listForMonthUsesTheLeapDayInALeapYear() {
        service.listForMonth(USER_ID, YearMonth.of(2028, 2));

        verify(transactionRepository).findByUserIdAndDateBetween(
                USER_ID, LocalDate.of(2028, 2, 1), LocalDate.of(2028, 2, 29));
    }

    @Test
    void listDraftsReturnsTheRepositoryDraftsForTheUser() {
        Transaction draft = Transaction.builder().userId(USER_ID).build();
        when(transactionRepository.findDraftsByUserId(USER_ID)).thenReturn(List.of(draft));

        assertThat(service.listDrafts(USER_ID)).containsExactly(draft);
    }
}
