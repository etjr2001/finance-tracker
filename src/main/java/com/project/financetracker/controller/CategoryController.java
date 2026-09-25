package com.project.financetracker.controller;

import com.project.financetracker.model.Category;
import com.project.financetracker.repository.CategoryRepository;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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

    public static final int MAX_NAME_LENGTH = 30;

    @GetMapping
    public List<Category> list() {
        UUID userId = currentUserService.getCurrentUserId();
        return categoryRepository.findByUserId(userId);
    }

    @PostMapping
    public Category create(@Valid @RequestBody CategoryRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        return categoryService.createCategory(request.name(), request.colorKey(), request.iconKey(), userId);
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        return categoryService.updateCategory(id, request.name(), request.colorKey(), request.iconKey(), userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        UUID userId = currentUserService.getCurrentUserId();
        categoryService.deleteCategory(id, userId);
        return ResponseEntity.noContent().build();
    }

    // colorKey/iconKey are optional: no @NotNull, and @Pattern already treats
    // null as valid, so a request that omits them (or sends null) passes.
    // Format shared with the Category entity (Category.KEY_FORMAT) so the
    // DTO and the entity can never validate it differently.
    public record CategoryRequest(
            @NotBlank @Size(max = MAX_NAME_LENGTH) String name,
            @Pattern(regexp = Category.KEY_FORMAT) String colorKey,
            @Pattern(regexp = Category.KEY_FORMAT) String iconKey
    ) {}
}