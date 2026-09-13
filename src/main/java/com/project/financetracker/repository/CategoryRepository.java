package com.project.financetracker.repository;

import com.project.financetracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(UUID userId);
    boolean existsByUserIdAndName(UUID userId, String name);
}