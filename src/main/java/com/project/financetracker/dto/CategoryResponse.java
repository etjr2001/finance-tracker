package com.project.financetracker.dto;

import com.project.financetracker.model.Category;

public record CategoryResponse(Long id, String name, String colorKey, String iconKey) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getColorKey(),
                category.getIconKey()
        );
    }
}
