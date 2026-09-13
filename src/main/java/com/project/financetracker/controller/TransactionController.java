package com.project.financetracker.controller;

import com.project.financetracker.exception.ForbiddenException;
import com.project.financetracker.exception.ResourceNotFoundException;
import com.project.financetracker.model.Category;
import com.project.financetracker.model.Transaction;
import com.project.financetracker.model.User;
import com.project.financetracker.repository.TransactionRepository;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<Transaction> list() {
        User user = currentUserService.getCurrentUser();
        return transactionRepository.findByUserId(user.getId());
    }

    @PostMapping
    public Transaction create(@Valid @RequestBody TransactionRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryService.requireOwnedCategory(request.categoryId(), user);

        Transaction transaction = Transaction.builder()
                .type(request.type())
                .amount(request.amount())
                .date(request.date())
                .note(request.note())
                .category(category)
                .user(user)
                .build();

        return transactionRepository.save(transaction);
    }

    @PutMapping("/{id}")
    public Transaction update(@PathVariable Long id, @Valid @RequestBody TransactionRequest request) {
        User user = currentUserService.getCurrentUser();
        Transaction transaction = requireOwnedTransaction(id, user);
        Category category = categoryService.requireOwnedCategory(request.categoryId(), user);

        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setDate(request.date());
        transaction.setNote(request.note());
        transaction.setCategory(category);

        return transactionRepository.save(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = currentUserService.getCurrentUser();
        Transaction transaction = requireOwnedTransaction(id, user);
        transactionRepository.delete(transaction);
        return ResponseEntity.noContent().build();
    }

    private Transaction requireOwnedTransaction(Long id, User user) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Not your transaction");
        }
        return transaction;
    }

    public record TransactionRequest(
            @NotNull Transaction.Type type,
            @NotNull @DecimalMin(value = "0") BigDecimal amount,
            @NotNull LocalDate date,
            String note,
            @NotNull Long categoryId
    ) {}
}
