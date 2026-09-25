package com.project.financetracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
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

    // Shared with CategoryController.CategoryRequest, so the DTO and the
    // entity can never validate colour_key/icon_key differently. The DB's
    // CHECK constraints (V3 migration) enforce the same format again, in
    // SQL syntax, since a migration can't reference a Java constant.
    public static final String KEY_FORMAT = "^[a-z][a-z0-9-]*$";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "color_key")
    @Pattern(regexp = KEY_FORMAT)
    private String colorKey;

    @Column(name = "icon_key")
    @Pattern(regexp = KEY_FORMAT)
    private String iconKey;
}