-- color_key/icon_key are nullable slugs (e.g. "ochre", "food"), looked up
-- through a frontend registry (docs/backlog.md, "Category color/icon") --
-- not hex values or icon names, so retuning the palette or renaming an
-- icon in the library never touches stored data. Format is validated here
-- (short lowercase slug); the actual allowed values live in the frontend
-- registry, not an allowlist, so adding an icon is a frontend-only change.
-- No NOT VALID needed: every existing row gets NULL for both new columns,
-- and a CHECK always passes on NULL, so there's nothing to grandfather in.
alter table categories
    add column color_key varchar(20),
    add column icon_key varchar(30),
    add constraint chk_categories_color_key_format check (color_key ~ '^[a-z][a-z0-9-]*$'),
    add constraint chk_categories_icon_key_format check (icon_key ~ '^[a-z][a-z0-9-]*$');

-- Tightening from V2's <= 50: a Category name is a short display label
-- (tile/pill/dropdown), not free text. NOT VALID since this does affect
-- existing rows -- any name already over 30 chars is grandfathered in
-- until a separate `validate constraint` once prod is checked, same as
-- V2's still-open item for the original 50-char limit.
alter table categories
    drop constraint chk_categories_name_length,
    add constraint chk_categories_name_length check (char_length(name) <= 30) not valid;
