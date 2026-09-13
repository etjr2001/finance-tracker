package com.project.financetracker.service;

import com.project.financetracker.model.Category;
import com.project.financetracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserBootstrapService {

    private static final List<String> STARTER_CATEGORIES =
            List.of("Groceries", "Rent", "Salary", "Transport", "Entertainment");

    private final CategoryRepository categoryRepository;

    public void bootstrap(UUID userId) {
        if (!categoryRepository.findByUserId(userId).isEmpty()) {
            return;
        }

        List<Category> starterCategories = STARTER_CATEGORIES.stream()
                .map(name -> newCategory(userId, name))
                .toList();

        categoryRepository.saveAll(starterCategories);
    }

    private Category newCategory(UUID userId, String name) {
        Category category = new Category();
        category.setUserId(userId);
        category.setName(name);
        return category;
    }
}