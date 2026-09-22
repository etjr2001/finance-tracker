    package com.project.financetracker.exception;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.LoggerFactory;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();
    private ListAppender<ILoggingEvent> logAppender;

    // Captures log output directly (Logback), rather than mocking SLF4J, so
    // these tests assert on what actually reaches the logs.
    @BeforeEach
    void attachLogAppender() {
        Logger logger = (Logger) LoggerFactory.getLogger(GlobalExceptionHandler.class);
        logAppender = new ListAppender<>();
        logAppender.start();
        logger.addAppender(logAppender);
    }

    @AfterEach
    void detachLogAppender() {
        Logger logger = (Logger) LoggerFactory.getLogger(GlobalExceptionHandler.class);
        logger.detachAppender(logAppender);
    }

    @Test
    void notFoundReturnsTheExceptionMessage() {
        ResponseEntity<Map<String, String>> response =
                handler.handleNotFound(new ResourceNotFoundException("Category not found"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).containsEntry("error", "Category not found");
    }

    @Test
    void forbiddenReturnsTheExceptionMessage() {
        ResponseEntity<Map<String, String>> response =
                handler.handleForbidden(new ForbiddenException("Not your transaction"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).containsEntry("error", "Not your transaction");
    }

    @Test
    void invalidPeriodReturnsTheExceptionMessage() {
        ResponseEntity<Map<String, String>> response =
                handler.handleInvalidPeriod(new InvalidPeriodException("Invalid month format: 'bad'."));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("error", "Invalid month format: 'bad'.");
    }

    @Test
    void categoryInUseReturnsTheExceptionMessage() {
        ResponseEntity<Map<String, String>> response =
                handler.handleCategoryInUse(new CategoryInUseException("Cannot delete category 'Rent'."));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("error", "Cannot delete category 'Rent'.");
    }

    @Test
    void categoryAlreadyExistsReturnsTheExceptionMessage() {
        ResponseEntity<Map<String, String>> response =
                handler.handleCategoryAlreadyExists(new CategoryAlreadyExistsException("A category named 'Rent' already exists."));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("error", "A category named 'Rent' already exists.");
    }

    @Test
    void validationJoinsFieldErrorsAndLogsAtWarn() {
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("transactionRequest", "amount", "must be greater than or equal to 0")
        ));
        MethodArgumentNotValidException ex =
                new MethodArgumentNotValidException(mock(MethodParameter.class), bindingResult);

        ResponseEntity<Map<String, String>> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("error", "amount: must be greater than or equal to 0");
        assertThat(logAppender.list).anyMatch(event -> event.getLevel() == Level.WARN);
    }

    @Test
    void constraintViolationJoinsMessagesAndLogsAtWarn() {
        // Reachable via Hibernate's automatic entity-level Bean Validation on
        // flush (e.g. Transaction.amount's @PositiveOrZero), independent of
        // the @Valid DTO checks at the controller boundary.
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        when(violation.getMessage()).thenReturn("Amount cannot be negative");
        ConstraintViolationException ex = new ConstraintViolationException(Set.of(violation));

        ResponseEntity<Map<String, String>> response = handler.handleConstraintViolation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("error", "Amount cannot be negative");
        assertThat(logAppender.list).anyMatch(event -> event.getLevel() == Level.WARN);
    }

    @Test
    void dataIntegrityViolationHidesTheRawDbMessageAndLogsItAtError() {
        var dbException = new DataIntegrityViolationException(
                "duplicate key value violates unique constraint \"uq_categories_user_name\""
        );

        ResponseEntity<Map<String, String>> response = handler.handleDataIntegrityViolation(dbException);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().get("error")).doesNotContain("uq_categories_user_name");
        assertThat(response.getBody()).containsEntry("error", "This change conflicts with existing data.");

        // The raw detail must still reach the logs, just not the client.
        assertThat(logAppender.list)
                .anyMatch(event -> event.getLevel() == Level.ERROR
                        && event.getThrowableProxy() != null
                        && event.getThrowableProxy().getMessage().contains("uq_categories_user_name"));
    }

    @Test
    void genericRuntimeExceptionReturnsAGenericMessageAndLogsItAtError() {
        ResponseEntity<Map<String, String>> response =
                handler.handleGeneric(new RuntimeException("NullPointerException at line 42"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("error", "Something went wrong. Please try again.");
        assertThat(logAppender.list)
                .anyMatch(event -> event.getLevel() == Level.ERROR
                        && event.getThrowableProxy() != null
                        && event.getThrowableProxy().getMessage().equals("NullPointerException at line 42"));
    }
}
