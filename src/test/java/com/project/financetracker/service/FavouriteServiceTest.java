package com.project.financetracker.service;

import com.project.financetracker.exception.ForbiddenException;
import com.project.financetracker.exception.ResourceNotFoundException;
import com.project.financetracker.model.Category;
import com.project.financetracker.model.Favourite;
import com.project.financetracker.model.Transaction;
import com.project.financetracker.repository.FavouriteRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FavouriteServiceTest {

    private final FavouriteRepository favouriteRepository = mock(FavouriteRepository.class);
    private final CategoryService categoryService = mock(CategoryService.class);
    private final FavouriteService service = new FavouriteService(favouriteRepository, categoryService);

    private static final UUID USER_ID = UUID.randomUUID();

    private static Category category(long id, UUID userId) {
        Category category = new Category();
        category.setId(id);
        category.setUserId(userId);
        category.setName("Groceries");
        return category;
    }

    private static Favourite favourite(long id, UUID userId) {
        return Favourite.builder().id(id).userId(userId).build();
    }

    private void stubSaveReturnsItsArgument() {
        when(favouriteRepository.save(any(Favourite.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void listFavouritesReturnsTheRepositoryListForTheUser() {
        Favourite favourite = favourite(1L, USER_ID);
        when(favouriteRepository.findByUserIdOrderByIdDesc(USER_ID)).thenReturn(List.of(favourite));

        assertThat(service.listFavourites(USER_ID)).containsExactly(favourite);
    }

    @Test
    void createFavouriteSavesEveryFieldWithTheOwnedCategory() {
        Category groceries = category(5L, USER_ID);
        when(categoryService.requireOwnedCategory(5L, USER_ID)).thenReturn(groceries);
        stubSaveReturnsItsArgument();

        Favourite created = service.createFavourite(
                Transaction.Type.EXPENSE, new BigDecimal("4.50"), "Kopi", 5L, USER_ID);

        assertThat(created.getType()).isEqualTo(Transaction.Type.EXPENSE);
        assertThat(created.getAmount()).isEqualByComparingTo("4.50");
        assertThat(created.getNote()).isEqualTo("Kopi");
        assertThat(created.getCategory()).isSameAs(groceries);
        assertThat(created.getUserId()).isEqualTo(USER_ID);
    }

    @Test
    void createFavouriteAllowsAZeroAmount() {
        // A zero-amount Favourite prefills a Draft (ADR0008, ADR0017).
        when(categoryService.requireOwnedCategory(5L, USER_ID)).thenReturn(category(5L, USER_ID));
        stubSaveReturnsItsArgument();

        Favourite created = service.createFavourite(
                Transaction.Type.EXPENSE, BigDecimal.ZERO, null, 5L, USER_ID);

        assertThat(created.getAmount()).isEqualByComparingTo("0");
        assertThat(created.getNote()).isNull();
    }

    @Test
    void createFavouriteRefusesACategoryOwnedByAnotherUser() {
        when(categoryService.requireOwnedCategory(5L, USER_ID))
                .thenThrow(new ForbiddenException("Not your category"));

        assertThatThrownBy(() -> service.createFavourite(
                Transaction.Type.EXPENSE, new BigDecimal("4.50"), null, 5L, USER_ID))
                .isInstanceOf(ForbiddenException.class);
        verify(favouriteRepository, never()).save(any());
    }

    @Test
    void updateFavouriteReplacesEveryFieldWithTheOwnedCategory() {
        Favourite existing = Favourite.builder()
                .id(1L).userId(USER_ID).type(Transaction.Type.EXPENSE)
                .amount(new BigDecimal("4.50")).note("Kopi").category(category(5L, USER_ID))
                .build();
        Category salary = category(6L, USER_ID);
        when(favouriteRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoryService.requireOwnedCategory(6L, USER_ID)).thenReturn(salary);
        stubSaveReturnsItsArgument();

        Favourite updated = service.updateFavourite(
                1L, Transaction.Type.INCOME, new BigDecimal("4200.00"), "Pay", 6L, USER_ID);

        assertThat(updated.getType()).isEqualTo(Transaction.Type.INCOME);
        assertThat(updated.getAmount()).isEqualByComparingTo("4200.00");
        assertThat(updated.getNote()).isEqualTo("Pay");
        assertThat(updated.getCategory()).isSameAs(salary);
        assertThat(updated.getUserId()).isEqualTo(USER_ID);
    }

    @Test
    void updateFavouriteCanClearTheNote() {
        // PUT replaces every field, so a null note clears it rather than
        // leaving the old one in place.
        Favourite existing = Favourite.builder().id(1L).userId(USER_ID).note("Kopi").build();
        when(favouriteRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoryService.requireOwnedCategory(5L, USER_ID)).thenReturn(category(5L, USER_ID));
        stubSaveReturnsItsArgument();

        Favourite updated = service.updateFavourite(
                1L, Transaction.Type.EXPENSE, new BigDecimal("4.50"), null, 5L, USER_ID);

        assertThat(updated.getNote()).isNull();
    }

    @Test
    void updateFavouriteRefusesAFavouriteOwnedByAnotherUser() {
        when(favouriteRepository.findById(1L)).thenReturn(Optional.of(favourite(1L, UUID.randomUUID())));

        assertThatThrownBy(() -> service.updateFavourite(
                1L, Transaction.Type.EXPENSE, new BigDecimal("4.50"), null, 5L, USER_ID))
                .isInstanceOf(ForbiddenException.class);
        verify(favouriteRepository, never()).save(any());
    }

    @Test
    void updateFavouriteRefusesACategoryOwnedByAnotherUser() {
        when(favouriteRepository.findById(1L)).thenReturn(Optional.of(favourite(1L, USER_ID)));
        when(categoryService.requireOwnedCategory(5L, USER_ID))
                .thenThrow(new ForbiddenException("Not your category"));

        assertThatThrownBy(() -> service.updateFavourite(
                1L, Transaction.Type.EXPENSE, new BigDecimal("4.50"), null, 5L, USER_ID))
                .isInstanceOf(ForbiddenException.class);
        verify(favouriteRepository, never()).save(any());
    }

    @Test
    void updateFavouriteThrowsWhenNotFound() {
        when(favouriteRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateFavourite(
                1L, Transaction.Type.EXPENSE, new BigDecimal("4.50"), null, 5L, USER_ID))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(favouriteRepository, never()).save(any());
    }

    @Test
    void deleteFavouriteDeletesAnOwnedFavourite() {
        Favourite existing = favourite(1L, USER_ID);
        when(favouriteRepository.findById(1L)).thenReturn(Optional.of(existing));

        service.deleteFavourite(1L, USER_ID);

        verify(favouriteRepository).delete(existing);
    }

    @Test
    void deleteFavouriteRefusesAFavouriteOwnedByAnotherUser() {
        when(favouriteRepository.findById(1L)).thenReturn(Optional.of(favourite(1L, UUID.randomUUID())));

        assertThatThrownBy(() -> service.deleteFavourite(1L, USER_ID))
                .isInstanceOf(ForbiddenException.class);
        verify(favouriteRepository, never()).delete(any());
    }

    @Test
    void deleteFavouriteThrowsWhenNotFound() {
        when(favouriteRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteFavourite(1L, USER_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
