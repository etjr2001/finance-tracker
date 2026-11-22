package com.project.financetracker.service;

import com.project.financetracker.exception.ForbiddenException;
import com.project.financetracker.exception.ResourceNotFoundException;
import com.project.financetracker.model.Category;
import com.project.financetracker.model.Transaction;
import com.project.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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

    // Ownership on update and delete. Each foreign-User case stubs a Category
    // the caller DOES own, so the Transaction ownership check is the only
    // thing that can stop the change: removing it must fail these tests.

    private static final UUID OTHER_USER_ID = UUID.randomUUID();
    private static final LocalDate DATE = LocalDate.of(2026, 11, 1);

    private static Category category(long id, UUID userId) {
        Category category = new Category();
        category.setId(id);
        category.setUserId(userId);
        category.setName("Groceries");
        return category;
    }

    private static Transaction transaction(long id, UUID userId) {
        return Transaction.builder()
                .id(id)
                .userId(userId)
                .type(Transaction.Type.EXPENSE)
                .amount(new BigDecimal("12.50"))
                .date(DATE)
                .note("Lunch")
                .category(category(5L, userId))
                .build();
    }

    private void updateAs(UUID userId, long transactionId) {
        service.updateTransaction(transactionId, Transaction.Type.INCOME, new BigDecimal("99.00"),
                DATE.plusDays(1), "Changed", 6L, userId);
    }

    @Test
    void updateByAnotherUserIsForbiddenAndChangesNothing() {
        Transaction owned = transaction(1L, USER_ID);
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(owned));
        when(categoryService.requireOwnedCategory(6L, OTHER_USER_ID)).thenReturn(category(6L, OTHER_USER_ID));

        assertThatThrownBy(() -> updateAs(OTHER_USER_ID, 1L)).isInstanceOf(ForbiddenException.class);

        verify(transactionRepository, never()).save(any(Transaction.class));
        assertThat(owned.getAmount()).isEqualByComparingTo("12.50");
        assertThat(owned.getNote()).isEqualTo("Lunch");
        assertThat(owned.getType()).isEqualTo(Transaction.Type.EXPENSE);
    }

    @Test
    void updateOfAMissingTransactionIsNotFound() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> updateAs(USER_ID, 1L)).isInstanceOf(ResourceNotFoundException.class);

        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void updateByTheOwnerSavesTheNewFields() {
        Transaction owned = transaction(1L, USER_ID);
        Category salary = category(6L, USER_ID);
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(owned));
        when(categoryService.requireOwnedCategory(6L, USER_ID)).thenReturn(salary);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Transaction saved = service.updateTransaction(1L, Transaction.Type.INCOME, new BigDecimal("99.00"),
                DATE.plusDays(1), "Changed", 6L, USER_ID);

        assertThat(saved.getType()).isEqualTo(Transaction.Type.INCOME);
        assertThat(saved.getAmount()).isEqualByComparingTo("99.00");
        assertThat(saved.getDate()).isEqualTo(DATE.plusDays(1));
        assertThat(saved.getNote()).isEqualTo("Changed");
        assertThat(saved.getCategory()).isSameAs(salary);
        assertThat(saved.getUserId()).isEqualTo(USER_ID);
    }

    @Test
    void deleteByAnotherUserIsForbiddenAndDeletesNothing() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction(1L, USER_ID)));

        assertThatThrownBy(() -> service.deleteTransaction(1L, OTHER_USER_ID))
                .isInstanceOf(ForbiddenException.class);

        verify(transactionRepository, never()).delete(any(Transaction.class));
        verify(transactionRepository, never()).deleteById(any());
    }

    @Test
    void deleteOfAMissingTransactionIsNotFound() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteTransaction(1L, USER_ID))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(transactionRepository, never()).delete(any(Transaction.class));
    }

    @Test
    void deleteByTheOwnerDeletesIt() {
        Transaction owned = transaction(1L, USER_ID);
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(owned));

        service.deleteTransaction(1L, USER_ID);

        verify(transactionRepository).delete(owned);
    }
}
