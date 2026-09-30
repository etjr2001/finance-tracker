-- Closes the still-open item from V2/V3: prod was checked for existing
-- over-length note/name values (none found, docs/backlog.md) so these
-- NOT VALID constraints can now be validated without risk of failing the
-- migration on non-conforming rows.
alter table transactions
    validate constraint chk_transactions_note_length;

alter table categories
    validate constraint chk_categories_name_length;
