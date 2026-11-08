package com.project.financetracker.controller;

import com.project.financetracker.dto.FavouriteResponse;
import com.project.financetracker.model.Transaction;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.FavouriteService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/favourites")
@RequiredArgsConstructor
public class FavouriteController {

    private final FavouriteService favouriteService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<FavouriteResponse> list() {
        UUID userId = currentUserService.getCurrentUserId();
        return favouriteService.listFavourites(userId)
                .stream()
                .map(FavouriteResponse::from)
                .toList();
    }

    @PostMapping
    public FavouriteResponse create(@Valid @RequestBody FavouriteRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        return FavouriteResponse.from(favouriteService.createFavourite(
                request.type(), request.amount(), request.note(), request.categoryId(), userId
        ));
    }

    @PutMapping("/{id}")
    public FavouriteResponse update(@PathVariable Long id, @Valid @RequestBody FavouriteRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        return FavouriteResponse.from(favouriteService.updateFavourite(
                id, request.type(), request.amount(), request.note(), request.categoryId(), userId
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        UUID userId = currentUserService.getCurrentUserId();
        favouriteService.deleteFavourite(id, userId);
        return ResponseEntity.noContent().build();
    }

    public record FavouriteRequest(
            @NotNull Transaction.Type type,
            @NotNull @DecimalMin(value = "0") @Digits(integer = 10, fraction = 2) BigDecimal amount,
            @Size(max = TransactionController.MAX_NOTE_LENGTH) String note,
            @NotNull Long categoryId
    ) {}
}
