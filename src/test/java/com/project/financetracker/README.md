# TODO: tests

No test suite exists yet beyond Spring Initializr's boilerplate, which was
removed because it required a real Supabase connection just to boot the
context in CI.

When adding real tests:
- Unit test CategoryService / TransactionService / UserBootstrapService
  ownership and validation logic directly (no Spring context needed)
- For CurrentUserService, mock a Jwt principal rather than requiring a
  real Supabase token
- If a full @SpringBootTest is ever needed, provide test-only
  application-test.yml values (or Testcontainers Postgres) rather than
  depending on real Supabase infra in CI