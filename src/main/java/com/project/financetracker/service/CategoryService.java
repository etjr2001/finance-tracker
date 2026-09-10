package com.project.financetracker.service;

import com.project.financetracker.exception.CategoryInUseException;
import com.project.financetracker.exception.ForbiddenException;
import com.project.financetracker.exception.ResourceNotFoundException;
import com.project.financetracker.model.Category;
import com.project.financetracker.model.User;
import com.project.financetracker.repository.CategoryRepository;
import com.project.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public Category requireOwnedCategory(Long id, User user) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Not your category");
        }
        return category;
    }

    public void deleteCategory(Long id, User user) {
        Category category = requireOwnedCategory(id, user);
        boolean inUse = transactionRepository.existsById(id);
        if (inUse) {
            throw new CategoryInUseException(
                    "Cannot delete category '" + category.getName() + "' - it has existing transactions."
            );
        }
        categoryRepository.delete(category);
    }
}
