-- NOT VALID: enforces the check for all new inserts/updates immediately,
-- without scanning (and possibly failing the migration on) existing rows.
-- Any pre-existing over-length row is grandfathered in until a separate,
-- later `validate constraint` is run once that data has been cleaned up.
alter table transactions
    add constraint chk_transactions_note_length check (char_length(note) <= 256) not valid;

alter table categories
    add constraint chk_categories_name_length check (char_length(name) <= 50) not valid;
