package com.project.financetracker.service;

import com.project.financetracker.exception.ForbiddenException;
import com.project.financetracker.exception.ResourceNotFoundException;
import com.project.financetracker.model.Category;
import com.project.financetracker.model.Favourite;
import com.project.financetracker.model.Transaction;
import com.project.financetracker.repository.FavouriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FavouriteService {

    private final FavouriteRepository favouriteRepository;
    private final CategoryService categoryService;

    private Favourite requireOwnedFavourite(Long id, UUID userId) {
        Favourite favourite = favouriteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Favourite not found"));
        if (!favourite.getUserId().equals(userId)) {
            throw new ForbiddenException("Not your favourite");
        }
        return favourite;
    }

    public List<Favourite> listFavourites(UUID userId) {
        return favouriteRepository.findByUserIdOrderByIdDesc(userId);
    }

    public Favourite createFavourite(
            Transaction.Type type,
            BigDecimal amount,
            String note,
            Long categoryId,
            UUID userId
    ) {
        Category category = categoryService.requireOwnedCategory(categoryId, userId);

        Favourite favourite = Favourite.builder()
                .type(type)
                .amount(amount)
                .note(note)
                .category(category)
                .userId(userId)
                .build();

        return favouriteRepository.save(favourite);
    }

    public Favourite updateFavourite(
            Long id,
            Transaction.Type type,
            BigDecimal amount,
            String note,
            Long categoryId,
            UUID userId
    ) {
        Favourite favourite = requireOwnedFavourite(id, userId);
        Category category = categoryService.requireOwnedCategory(categoryId, userId);

        favourite.setType(type);
        favourite.setAmount(amount);
        favourite.setNote(note);
        favourite.setCategory(category);

        return favouriteRepository.save(favourite);
    }

    public void deleteFavourite(Long id, UUID userId) {
        Favourite favourite = requireOwnedFavourite(id, userId);
        favouriteRepository.delete(favourite);
    }
}
