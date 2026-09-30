package com.project.financetracker.repository;

import com.project.financetracker.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t JOIN FETCH t.category " +
            "WHERE t.userId = :userId AND t.date BETWEEN :startDate AND :endDate " +
            "ORDER BY t.date DESC, t.id DESC")
    List<Transaction> findByUserIdAndDateBetween(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Drafts (ADR0008) are derived from amount == 0, across all months.
    // Oldest first, since the oldest are the most overdue.
    @Query("SELECT t FROM Transaction t JOIN FETCH t.category " +
            "WHERE t.userId = :userId AND t.amount = 0 " +
            "ORDER BY t.date ASC, t.id ASC")
    List<Transaction> findDraftsByUserId(@Param("userId") UUID userId);

    boolean existsByCategoryId(Long id);
}