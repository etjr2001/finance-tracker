package com.project.financetracker.dto;

import com.project.financetracker.model.Favourite;
import com.project.financetracker.model.Transaction;

import java.math.BigDecimal;

public record FavouriteResponse(
        Long id,
        Transaction.Type type,
        BigDecimal amount,
        String note,
        CategoryResponse category
) {
    public static FavouriteResponse from(Favourite favourite) {
        return new FavouriteResponse(
                favourite.getId(),
                favourite.getType(),
                favourite.getAmount(),
                favourite.getNote(),
                CategoryResponse.from(favourite.getCategory())
        );
    }
}
