-- CONTEXT.md: Category names are unique per User ignoring case. The
-- previous unique constraint (uq_categories_user_name, V1) was
-- case-sensitive, so "groceries" could exist next to "Groceries". Confirmed
-- no existing case-duplicates before this migration (docs/backlog.md).
--
-- `upper(name)`, not `lower(name)`: Spring Data's IgnoreCase repository
-- methods generate `upper(name) = upper(?)`, and Postgres only uses a
-- function index when the query calls the exact same function.
--
-- MERGE ORDER: numbered V4 while V3 (feat/category-color-icon,
-- V3__category_color_icon.sql) is still unmerged. Flyway here has no
-- out-of-order support enabled (application.yml), so V3 must reach `main`
-- and deploy before this one -- applying this first would make V3
-- permanently unappliable without manual intervention.
alter table categories
    drop constraint uq_categories_user_name;

create unique index uq_categories_user_name_ci on categories (user_id, upper(name));
