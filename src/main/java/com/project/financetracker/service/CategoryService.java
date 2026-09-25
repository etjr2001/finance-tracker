package com.project.financetracker.service;

import com.project.financetracker.exception.CategoryAlreadyExistsException;
import com.project.financetracker.exception.CategoryInUseException;
import com.project.financetracker.exception.ForbiddenException;
import com.project.financetracker.exception.ResourceNotFoundException;
import com.project.financetracker.model.Category;
import com.project.financetracker.repository.CategoryRepository;
import com.project.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public Category requireOwnedCategory(Long id, UUID userId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (!category.getUserId().equals(userId)) {
            throw new ForbiddenException("Not your category");
        }
        return category;
    }

    public Category createCategory(String name, String colorKey, String iconKey, UUID userId) {
        if (categoryRepository.existsByUserIdAndName(userId, name)) {
            throw new CategoryAlreadyExistsException("A category named '" + name + "' already exists.");
        }
        Category category = new Category();
        category.setUserId(userId);
        category.setName(name);
        category.setColorKey(colorKey);
        category.setIconKey(iconKey);
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, String newName, String colorKey, String iconKey, UUID userId) {
        Category category = requireOwnedCategory(id, userId);
        if (!category.getName().equals(newName)
                && categoryRepository.existsByUserIdAndName(userId, newName)) {
            throw new CategoryAlreadyExistsException("A category named '" + newName + "' already exists.");
        }
        category.setName(newName);
        category.setColorKey(colorKey);
        category.setIconKey(iconKey);
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id, UUID userId) {
        Category category = requireOwnedCategory(id, userId);
        boolean inUse = transactionRepository.existsByCategoryId(id);
        if (inUse) {
            throw new CategoryInUseException(
                    "Cannot delete category '" + category.getName() + "' - it has existing transactions."
            );
        }
        categoryRepository.delete(category);
    }
}