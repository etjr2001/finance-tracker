package com.project.financetracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

// Uniqueness is enforced in the DB as a case-insensitive functional index
// (uq_categories_user_name_ci on (user_id, upper(name)), V4 migration), not
// expressible as a plain JPA @UniqueConstraint (column list only, no
// upper()) -- and ddl-auto is `validate`, so Flyway owns the real schema.
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;
}