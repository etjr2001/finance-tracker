package com.project.financetracker.service;

import com.project.financetracker.exception.CategoryAlreadyExistsException;
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
import static org.mockito.Mockito.when;

class CategoryServiceTest {

    private final CategoryRepository categoryRepository = mock(CategoryRepository.class);
    private final TransactionRepository transactionRepository = mock(TransactionRepository.class);
    private final CategoryService service = new CategoryService(categoryRepository, transactionRepository);

    private static final UUID USER_ID = UUID.randomUUID();

    private static Category category(long id, UUID userId, String name) {
        Category category = new Category();
        category.setId(id);
        category.setUserId(userId);
        category.setName(name);
        return category;
    }

    private void stubSaveReturnsItsArgument() {
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createCategoryRejectsACaseDifferentDuplicate() {
        when(categoryRepository.existsByUserIdAndNameIgnoreCase(USER_ID, "groceries")).thenReturn(true);

        assertThatThrownBy(() -> service.createCategory("groceries", USER_ID))
                .isInstanceOf(CategoryAlreadyExistsException.class);
    }

    @Test
    void createCategoryAllowsAGenuinelyNewName() {
        stubSaveReturnsItsArgument();

        Category created = service.createCategory("Groceries", USER_ID);

        assertThat(created.getName()).isEqualTo("Groceries");
    }

    @Test
    void renameCategoryRejectsCollidingWithAnotherCategorysNameIgnoringCase() {
        Category existing = category(1L, USER_ID, "Groceries");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoryRepository.existsByUserIdAndNameIgnoreCaseAndIdNot(USER_ID, "rent", 1L)).thenReturn(true);

        assertThatThrownBy(() -> service.renameCategory(1L, "rent", USER_ID))
                .isInstanceOf(CategoryAlreadyExistsException.class);
    }

    @Test
    void renameCategoryAllowsChangingOnlyItsOwnCasing() {
        Category existing = category(1L, USER_ID, "Groceries");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        // AndIdNot(id=1) excludes this same Category, so it never collides
        // with its own pre-rename name regardless of casing.
        when(categoryRepository.existsByUserIdAndNameIgnoreCaseAndIdNot(USER_ID, "groceries", 1L)).thenReturn(false);
        stubSaveReturnsItsArgument();

        Category renamed = service.renameCategory(1L, "groceries", USER_ID);

        assertThat(renamed.getName()).isEqualTo("groceries");
    }

    @Test
    void renameCategoryAllowsARealNewName() {
        Category existing = category(1L, USER_ID, "Groceries");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoryRepository.existsByUserIdAndNameIgnoreCaseAndIdNot(USER_ID, "Food", 1L)).thenReturn(false);
        stubSaveReturnsItsArgument();

        Category renamed = service.renameCategory(1L, "Food", USER_ID);

        assertThat(renamed.getName()).isEqualTo("Food");
    }
}
