package com.project.financetracker.controller;

import com.project.financetracker.model.Transaction;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TransactionRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDownValidator() {
        factory.close();
    }

    private TransactionController.TransactionRequest validRequest() {
        return new TransactionController.TransactionRequest(
                Transaction.Type.EXPENSE, new BigDecimal("12.50"), LocalDate.now(), "note", 1L
        );
    }

    @Test
    void validRequestHasNoViolations() {
        assertThat(validator.validate(validRequest())).isEmpty();
    }

    @Test
    void rejectsNegativeAmount() {
        var request = new TransactionController.TransactionRequest(
                Transaction.Type.EXPENSE, new BigDecimal("-0.01"), LocalDate.now(), null, 1L
        );

        Set<ConstraintViolation<TransactionController.TransactionRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("amount"));
    }

    @Test
    void rejectsAmountWithMoreThanTwoDecimalPlaces() {
        var request = new TransactionController.TransactionRequest(
                Transaction.Type.EXPENSE, new BigDecimal("12.505"), LocalDate.now(), null, 1L
        );

        Set<ConstraintViolation<TransactionController.TransactionRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("amount"));
    }

    @Test
    void rejectsAmountThatOverflowsTheNumericColumn() {
        // numeric(12,2): at most 10 digits before the decimal point
        var request = new TransactionController.TransactionRequest(
                Transaction.Type.EXPENSE, new BigDecimal("12345678901.23"), LocalDate.now(), null, 1L
        );

        Set<ConstraintViolation<TransactionController.TransactionRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("amount"));
    }

    @Test
    void acceptsAmountAtTheUpperBound() {
        var request = new TransactionController.TransactionRequest(
                Transaction.Type.EXPENSE, new BigDecimal("9999999999.99"), LocalDate.now(), null, 1L
        );

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void rejectsNoteLongerThanMaxLength() {
        String tooLong = "n".repeat(TransactionController.MAX_NOTE_LENGTH + 1);
        var request = new TransactionController.TransactionRequest(
                Transaction.Type.EXPENSE, new BigDecimal("1.00"), LocalDate.now(), tooLong, 1L
        );

        Set<ConstraintViolation<TransactionController.TransactionRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("note"));
    }

    @Test
    void acceptsNoteAtMaxLength() {
        String atLimit = "n".repeat(TransactionController.MAX_NOTE_LENGTH);
        var request = new TransactionController.TransactionRequest(
                Transaction.Type.EXPENSE, new BigDecimal("1.00"), LocalDate.now(), atLimit, 1L
        );

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void rejectsMissingRequiredFields() {
        var request = new TransactionController.TransactionRequest(null, null, null, null, null);

        Set<ConstraintViolation<TransactionController.TransactionRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .containsExactlyInAnyOrder("type", "amount", "date", "categoryId");
    }
}
