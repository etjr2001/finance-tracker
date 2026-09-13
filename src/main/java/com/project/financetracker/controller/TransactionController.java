package com.project.financetracker.controller;

import com.project.financetracker.model.Transaction;
import com.project.financetracker.repository.TransactionRepository;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.TransactionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<Transaction> list() {
        UUID userId = currentUserService.getCurrentUserId();
        return transactionRepository.findByUserId(userId);
    }

    @PostMapping
    public Transaction create(@Valid @RequestBody TransactionRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        return transactionService.createTransaction(
                request.type(), request.amount(), request.date(), request.note(), request.categoryId(), userId
        );
    }

    @PutMapping("/{id}")
    public Transaction update(@PathVariable Long id, @Valid @RequestBody TransactionRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        return transactionService.updateTransaction(
                id, request.type(), request.amount(), request.date(), request.note(), request.categoryId(), userId
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        UUID userId = currentUserService.getCurrentUserId();
        transactionService.deleteTransaction(id, userId);
        return ResponseEntity.noContent().build();
    }

    public record TransactionRequest(
            @NotNull Transaction.Type type,
            @NotNull @DecimalMin(value = "0") BigDecimal amount,
            @NotNull LocalDate date,
            String note,
            @NotNull Long categoryId
    ) {}
}