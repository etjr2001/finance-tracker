package com.project.financetracker.service;

import com.project.financetracker.exception.ForbiddenException;
import com.project.financetracker.exception.ResourceNotFoundException;
import com.project.financetracker.model.Category;
import com.project.financetracker.model.Transaction;
import com.project.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;

    public Transaction requireOwnedTransaction(Long id, UUID userId) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        if (!transaction.getUserId().equals(userId)) {
            throw new ForbiddenException("Not your transaction");
        }
        return transaction;
    }

    public Transaction createTransaction(
            Transaction.Type type,
            BigDecimal amount,
            LocalDate date,
            String note,
            Long categoryId,
            UUID userId
    ) {
        Category category = categoryService.requireOwnedCategory(categoryId, userId);

        Transaction transaction = Transaction.builder()
                .type(type)
                .amount(amount)
                .date(date)
                .note(note)
                .category(category)
                .userId(userId)
                .build();

        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(
            Long id,
            Transaction.Type type,
            BigDecimal amount,
            LocalDate date,
            String note,
            Long categoryId,
            UUID userId
    ) {
        Transaction transaction = requireOwnedTransaction(id, userId);
        Category category = categoryService.requireOwnedCategory(categoryId, userId);

        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setDate(date);
        transaction.setNote(note);
        transaction.setCategory(category);

        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id, UUID userId) {
        Transaction transaction = requireOwnedTransaction(id, userId);
        transactionRepository.delete(transaction);
    }
}