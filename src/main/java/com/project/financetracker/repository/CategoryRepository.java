package com.project.financetracker.repository;

import com.project.financetracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(UUID userId);

    // Names are unique per User ignoring case (CONTEXT.md): "groceries" and
    // "Groceries" are the same Category. The *AndIdNot variant excludes the
    // Category being renamed itself, so changing only its casing (e.g.
    // "Groceries" -> "groceries") isn't rejected as a collision with itself.
    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);
    boolean existsByUserIdAndNameIgnoreCaseAndIdNot(UUID userId, String name, Long id);
}