# Backend tests

Tests must not need a live Supabase connection — Spring Initializr's boilerplate
`@SpringBootTest` smoke test was deleted in sprint 1 for exactly this reason (it required
a real Supabase connection just to boot the context in CI).

What's here:
- Unit tests for service and validation logic (`CategoryServiceTest`,
  `TransactionRequestValidationTest`, `CategoryRequestValidationTest`,
  `DashboardServiceTest`) — no Spring context needed, dependencies mocked with Mockito.
- `GlobalExceptionHandlerTest` covers every handler, including the catch-all.

Conventions for new tests:
- Unit test service/validation logic directly, without a Spring context, the same way
  the existing tests do.
- For `CurrentUserService`, mock a `Jwt` principal rather than requiring a real Supabase
  token.
- If a full `@SpringBootTest` is ever needed, provide test-only `application-test.yml`
  values (or Testcontainers Postgres) rather than depending on real Supabase infra in CI.

Per ADR0007, tests land alongside whatever code they cover, not as a separate backfill
pass.
