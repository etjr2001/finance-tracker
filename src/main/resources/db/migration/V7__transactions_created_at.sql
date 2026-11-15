-- When a Transaction was entered, as opposed to its `date` (when the money
-- moved). For debugging and future duplicate detection (docs/backlog.md).
-- favourites has had created_at since V6.
--
-- Nullable on purpose: rows from before this migration get null, meaning
-- "created before V7, time unknown". `not null default now()` would stamp
-- every old row with this migration's time, and a sentinel (e.g. epoch 0)
-- would look like real data to every query.
--
-- Two statements, not `add column ... default now()`: Postgres evaluates a
-- default given in ADD COLUMN once and fills every existing row with it.
-- Adding the column bare leaves old rows null; setting the default
-- afterwards only applies to rows inserted from then on.
--
-- Not mapped on the Transaction entity: ddl-auto: validate ignores extra
-- columns, and Hibernate's INSERT leaves it out, so the default fills it.
alter table transactions
    add column created_at timestamptz;

alter table transactions
    alter column created_at set default now();

comment on column transactions.created_at is
    'When the row was inserted. Null = created before V7 (time unknown).';
