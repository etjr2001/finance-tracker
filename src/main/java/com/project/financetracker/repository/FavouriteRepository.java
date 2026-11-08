package com.project.financetracker.repository;

import com.project.financetracker.model.Favourite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FavouriteRepository extends JpaRepository<Favourite, Long> {

    @Query("SELECT f FROM Favourite f JOIN FETCH f.category " +
            "WHERE f.userId = :userId " +
            "ORDER BY f.id DESC")
    List<Favourite> findByUserIdOrderByIdDesc(@Param("userId") UUID userId);

    boolean existsByCategoryId(Long id);
}
