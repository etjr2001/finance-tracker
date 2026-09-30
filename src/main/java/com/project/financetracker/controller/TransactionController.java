package com.project.financetracker.controller;

import com.project.financetracker.dto.TransactionResponse;
import com.project.financetracker.model.Transaction;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.TransactionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<TransactionResponse> list(@RequestParam(required = false) String month) {
        UUID userId = currentUserService.getCurrentUserId();
        return transactionService.listForMonth(userId, MonthParam.resolve(month)).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    @GetMapping("/drafts")
    public List<TransactionResponse> drafts() {
        UUID userId = currentUserService.getCurrentUserId();
        return transactionService.listDrafts(userId).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    @PostMapping
    public TransactionResponse create(@Valid @RequestBody TransactionRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        return TransactionResponse.from(transactionService.createTransaction(
                request.type(), request.amount(), request.date(), request.note(), request.categoryId(), userId
        ));
    }

    @PutMapping("/{id}")
    public TransactionResponse update(@PathVariable Long id, @Valid @RequestBody TransactionRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        return TransactionResponse.from(transactionService.updateTransaction(
                id, request.type(), request.amount(), request.date(), request.note(), request.categoryId(), userId
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        UUID userId = currentUserService.getCurrentUserId();
        transactionService.deleteTransaction(id, userId);
        return ResponseEntity.noContent().build();
    }

    public static final int MAX_NOTE_LENGTH = 256;

    public record TransactionRequest(
            @NotNull Transaction.Type type,
            @NotNull @DecimalMin(value = "0") @Digits(integer = 10, fraction = 2) BigDecimal amount,
            @NotNull LocalDate date,
            @Size(max = MAX_NOTE_LENGTH) String note,
            @NotNull Long categoryId
    ) {}
}