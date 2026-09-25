package com.project.financetracker.service;

import com.project.financetracker.exception.CategoryAlreadyExistsException;
import com.project.financetracker.exception.CategoryInUseException;
import com.project.financetracker.exception.ForbiddenException;
import com.project.financetracker.exception.ResourceNotFoundException;
import com.project.financetracker.model.Category;
import com.project.financetracker.repository.CategoryRepository;
import com.project.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CategoryServiceTest {

    private final CategoryRepository categoryRepository = mock(CategoryRepository.class);
    private final TransactionRepository transactionRepository = mock(TransactionRepository.class);
    private final CategoryService service = new CategoryService(categoryRepository, transactionRepository);

    private static final UUID USER_ID = UUID.randomUUID();

    private static Category category(long id, UUID userId, String name, String colorKey, String iconKey) {
        Category category = new Category();
        category.setId(id);
        category.setUserId(userId);
        category.setName(name);
        category.setColorKey(colorKey);
        category.setIconKey(iconKey);
        return category;
    }

    private void stubSaveReturnsItsArgument() {
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createCategorySetsColorKeyAndIconKey() {
        stubSaveReturnsItsArgument();

        Category created = service.createCategory("Groceries", "ochre", "shopping-cart", USER_ID);

        assertThat(created.getColorKey()).isEqualTo("ochre");
        assertThat(created.getIconKey()).isEqualTo("shopping-cart");
    }

    @Test
    void createCategoryAllowsNullColorKeyAndIconKey() {
        stubSaveReturnsItsArgument();

        Category created = service.createCategory("Groceries", null, null, USER_ID);

        assertThat(created.getColorKey()).isNull();
        assertThat(created.getIconKey()).isNull();
    }

    @Test
    void createCategoryRejectsAnExactDuplicateName() {
        when(categoryRepository.existsByUserIdAndNameIgnoreCase(USER_ID, "Groceries")).thenReturn(true);

        assertThatThrownBy(() -> service.createCategory("Groceries", null, null, USER_ID))
                .isInstanceOf(CategoryAlreadyExistsException.class);
    }

    @Test
    void createCategoryRejectsACaseDifferentDuplicate() {
        // Names are unique per User ignoring case (CONTEXT.md): "groceries"
        // collides with an existing "Groceries".
        when(categoryRepository.existsByUserIdAndNameIgnoreCase(USER_ID, "groceries")).thenReturn(true);

        assertThatThrownBy(() -> service.createCategory("groceries", null, null, USER_ID))
                .isInstanceOf(CategoryAlreadyExistsException.class);
    }

    @Test
    void updateCategoryChangesNameColorKeyAndIconKey() {
        Category existing = category(1L, USER_ID, "Groceries", "slate", "tag");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        stubSaveReturnsItsArgument();

        Category updated = service.updateCategory(1L, "Food", "teal", "utensils-crossed", USER_ID);

        assertThat(updated.getName()).isEqualTo("Food");
        assertThat(updated.getColorKey()).isEqualTo("teal");
        assertThat(updated.getIconKey()).isEqualTo("utensils-crossed");
    }

    @Test
    void updateCategoryCanClearColorKeyAndIconKeyBackToNull() {
        Category existing = category(1L, USER_ID, "Groceries", "slate", "tag");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        stubSaveReturnsItsArgument();

        Category updated = service.updateCategory(1L, "Groceries", null, null, USER_ID);

        assertThat(updated.getColorKey()).isNull();
        assertThat(updated.getIconKey()).isNull();
    }

    @Test
    void updateCategoryRejectsCollidingWithAnotherCategorysNameIgnoringCase() {
        Category existing = category(1L, USER_ID, "Groceries", null, null);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoryRepository.existsByUserIdAndNameIgnoreCaseAndIdNot(USER_ID, "rent", 1L)).thenReturn(true);

        assertThatThrownBy(() -> service.updateCategory(1L, "rent", null, null, USER_ID))
                .isInstanceOf(CategoryAlreadyExistsException.class);
    }

    @Test
    void updateCategoryAllowsChangingOnlyItsOwnCasing() {
        Category existing = category(1L, USER_ID, "Groceries", null, null);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        // AndIdNot(id=1) excludes this same Category, so it never collides
        // with its own pre-rename name regardless of casing.
        when(categoryRepository.existsByUserIdAndNameIgnoreCaseAndIdNot(USER_ID, "groceries", 1L)).thenReturn(false);
        stubSaveReturnsItsArgument();

        Category renamed = service.updateCategory(1L, "groceries", null, null, USER_ID);

        assertThat(renamed.getName()).isEqualTo("groceries");
    }

    @Test
    void updateCategoryRefusesACategoryOwnedByAnotherUser() {
        Category existing = category(1L, UUID.randomUUID(), "Groceries", null, null);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.updateCategory(1L, "Food", null, null, USER_ID))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void updateCategoryThrowsWhenNotFound() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateCategory(1L, "Food", null, null, USER_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteCategoryRefusesWhenInUse() {
        Category existing = category(1L, USER_ID, "Groceries", null, null);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(transactionRepository.existsByCategoryId(1L)).thenReturn(true);

        assertThatThrownBy(() -> service.deleteCategory(1L, USER_ID))
                .isInstanceOf(CategoryInUseException.class);
        verify(categoryRepository, never()).delete(any());
    }

    @Test
    void deleteCategoryDeletesWhenNotInUse() {
        Category existing = category(1L, USER_ID, "Groceries", null, null);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(transactionRepository.existsByCategoryId(1L)).thenReturn(false);

        service.deleteCategory(1L, USER_ID);

        verify(categoryRepository).delete(existing);
    }
}
