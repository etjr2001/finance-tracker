package com.project.financetracker.controller;

import com.project.financetracker.model.Category;
import com.project.financetracker.repository.CategoryRepository;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<Category> list() {
        UUID userId = currentUserService.getCurrentUserId();
        return categoryRepository.findByUserId(userId);
    }

    @PostMapping
    public Category create(@Valid @RequestBody CategoryRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        return categoryService.createCategory(request.name(), userId);
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        return categoryService.renameCategory(id, request.name(), userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        UUID userId = currentUserService.getCurrentUserId();
        categoryService.deleteCategory(id, userId);
        return ResponseEntity.noContent().build();
    }

    public record CategoryRequest(@NotBlank String name) {}
}