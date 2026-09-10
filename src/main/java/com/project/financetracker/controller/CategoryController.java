package com.project.financetracker.controller;

import com.project.financetracker.model.Category;
import com.project.financetracker.model.User;
import com.project.financetracker.repository.CategoryRepository;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<Category> list() {
        User user = currentUserService.getCurrentUser();
        return categoryRepository.findByUserId(user.getId());
    }

    @PostMapping
    public Category create(@Valid @RequestBody CategoryRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = new Category();
        category.setName(request.name());
        category.setUser(user);
        return categoryRepository.save(category);
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryService.requireOwnedCategory(id, user);
        category.setName(request.name());
        return categoryRepository.save(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = currentUserService.getCurrentUser();
        categoryService.deleteCategory(id, user);
        return ResponseEntity.noContent().build();
    }

    public record CategoryRequest(@NotBlank String name) {}
}
