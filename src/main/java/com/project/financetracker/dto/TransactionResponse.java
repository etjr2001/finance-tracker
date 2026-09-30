package com.project.financetracker.dto;

import com.project.financetracker.model.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        Transaction.Type type,
        BigDecimal amount,
        LocalDate date,
        String note,
        CategoryResponse category
) {
    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getDate(),
                transaction.getNote(),
                CategoryResponse.from(transaction.getCategory())
        );
    }
}
