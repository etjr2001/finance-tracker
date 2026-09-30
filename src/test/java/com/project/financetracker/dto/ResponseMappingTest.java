package com.project.financetracker.dto;

import com.project.financetracker.model.Category;
import com.project.financetracker.model.Transaction;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ResponseMappingTest {

    private static Category category() {
        Category category = new Category();
        category.setId(7L);
        category.setUserId(UUID.randomUUID());
        category.setName("Groceries");
        category.setColorKey("ochre");
        category.setIconKey("food");
        return category;
    }

    @Test
    void categoryResponseCopiesTheDisplayFields() {
        CategoryResponse response = CategoryResponse.from(category());

        assertThat(response).isEqualTo(new CategoryResponse(7L, "Groceries", "ochre", "food"));
    }

    @Test
    void categoryResponseKeepsUnsetColourAndIconNull() {
        Category category = category();
        category.setColorKey(null);
        category.setIconKey(null);

        CategoryResponse response = CategoryResponse.from(category);

        assertThat(response.colorKey()).isNull();
        assertThat(response.iconKey()).isNull();
    }

    @Test
    void transactionResponseNestsTheCategoryAndKeepsTheAmountScale() {
        Transaction transaction = Transaction.builder()
                .id(3L)
                .userId(UUID.randomUUID())
                .type(Transaction.Type.EXPENSE)
                .amount(new BigDecimal("12.50"))
                .date(LocalDate.of(2026, 9, 1))
                .note("Weekly shop")
                .category(category())
                .build();

        TransactionResponse response = TransactionResponse.from(transaction);

        assertThat(response).isEqualTo(new TransactionResponse(
                3L,
                Transaction.Type.EXPENSE,
                new BigDecimal("12.50"),
                LocalDate.of(2026, 9, 1),
                "Weekly shop",
                new CategoryResponse(7L, "Groceries", "ochre", "food")
        ));
    }

    @Test
    void responsesDoNotExposeTheOwnersUserId() {
        assertThat(CategoryResponse.class.getRecordComponents())
                .extracting(component -> component.getName())
                .doesNotContain("userId");
        assertThat(TransactionResponse.class.getRecordComponents())
                .extracting(component -> component.getName())
                .doesNotContain("userId");
    }
}
