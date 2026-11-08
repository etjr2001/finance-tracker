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
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class FavouriteRequestValidationTest {

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

    private FavouriteController.FavouriteRequest requestWithAmount(String amount) {
        return new FavouriteController.FavouriteRequest(
                Transaction.Type.EXPENSE, new BigDecimal(amount), null, 1L
        );
    }

    private FavouriteController.FavouriteRequest requestWithNote(String note) {
        return new FavouriteController.FavouriteRequest(
                Transaction.Type.EXPENSE, new BigDecimal("1.00"), note, 1L
        );
    }

    @Test
    void validRequestHasNoViolations() {
        var request = new FavouriteController.FavouriteRequest(
                Transaction.Type.EXPENSE, new BigDecimal("12.50"), "note", 1L
        );

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void acceptsZeroAmountBecauseAFavouriteCanPrefillADraft() {
        assertThat(validator.validate(requestWithAmount("0"))).isEmpty();
    }

    @Test
    void rejectsNegativeAmount() {
        Set<ConstraintViolation<FavouriteController.FavouriteRequest>> violations =
                validator.validate(requestWithAmount("-0.01"));

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("amount"));
    }

    @Test
    void rejectsAmountWithMoreThanTwoDecimalPlaces() {
        Set<ConstraintViolation<FavouriteController.FavouriteRequest>> violations =
                validator.validate(requestWithAmount("12.505"));

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("amount"));
    }

    @Test
    void rejectsAmountThatOverflowsTheNumericColumn() {
        // numeric(12,2): at most 10 digits before the decimal point
        Set<ConstraintViolation<FavouriteController.FavouriteRequest>> violations =
                validator.validate(requestWithAmount("12345678901.23"));

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("amount"));
    }

    @Test
    void acceptsAmountAtTheUpperBound() {
        assertThat(validator.validate(requestWithAmount("9999999999.99"))).isEmpty();
    }

    @Test
    void rejectsNoteLongerThanMaxLength() {
        String tooLong = "n".repeat(TransactionController.MAX_NOTE_LENGTH + 1);

        Set<ConstraintViolation<FavouriteController.FavouriteRequest>> violations =
                validator.validate(requestWithNote(tooLong));

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("note"));
    }

    @Test
    void acceptsNoteAtMaxLength() {
        String atLimit = "n".repeat(TransactionController.MAX_NOTE_LENGTH);

        assertThat(validator.validate(requestWithNote(atLimit))).isEmpty();
    }

    @Test
    void acceptsMissingNoteBecauseItIsOptional() {
        assertThat(validator.validate(requestWithNote(null))).isEmpty();
    }

    @Test
    void rejectsMissingRequiredFields() {
        var request = new FavouriteController.FavouriteRequest(null, null, null, null);

        Set<ConstraintViolation<FavouriteController.FavouriteRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .containsExactlyInAnyOrder("type", "amount", "categoryId");
    }
}
