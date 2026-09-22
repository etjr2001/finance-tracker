package com.project.financetracker.controller;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class CategoryRequestValidationTest {

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

    @Test
    void validNameHasNoViolations() {
        assertThat(validator.validate(new CategoryController.CategoryRequest("Groceries"))).isEmpty();
    }

    @Test
    void rejectsBlankName() {
        Set<ConstraintViolation<CategoryController.CategoryRequest>> violations =
                validator.validate(new CategoryController.CategoryRequest("   "));

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("name"));
    }

    @Test
    void rejectsNameLongerThanMaxLength() {
        String tooLong = "n".repeat(CategoryController.MAX_NAME_LENGTH + 1);

        Set<ConstraintViolation<CategoryController.CategoryRequest>> violations =
                validator.validate(new CategoryController.CategoryRequest(tooLong));

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("name"));
    }

    @Test
    void acceptsNameAtMaxLength() {
        String atLimit = "n".repeat(CategoryController.MAX_NAME_LENGTH);

        assertThat(validator.validate(new CategoryController.CategoryRequest(atLimit))).isEmpty();
    }
}
