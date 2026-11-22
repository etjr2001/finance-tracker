# Backend tests

Tests must not need a live Supabase connection — Spring Initializr's boilerplate
`@SpringBootTest` smoke test was deleted in sprint 1 for exactly this reason (it required
a real Supabase connection just to boot the context in CI).

What's here:
- Unit tests for service, validation and mapping logic (`CategoryServiceTest`,
  `TransactionServiceTest`, `DashboardServiceTest`, `TransactionRequestValidationTest`,
  `CategoryRequestValidationTest`, `MonthParamTest`, `ResponseMappingTest`) — no Spring
  context needed, dependencies mocked with Mockito.
- `GlobalExceptionHandlerTest` covers every handler, including the catch-all.
- MockMvc slice tests (`@WebMvcTest`): `SecurityConfigTest` (auth on `/api/**`: no,
  malformed, untrusted-key and expired tokens get 401; a valid one reaches the controller
  as that User) and `TransactionControllerBadRequestTest` (unparseable requests get 400).
  They run the real security filter chain with real JWTs: `config/TestJwts` signs tokens
  with a key pair generated in the test and supplies the `JwtDecoder` bean, so Spring Boot
  never builds one from `SUPABASE_JWKS_URI`. No database, no network.

Conventions for new tests:
- Unit test service/validation logic directly, without a Spring context, the same way
  the existing tests do.
- For `CurrentUserService`, mock a `Jwt` principal rather than requiring a real Supabase
  token. For anything through the HTTP layer, use a `@WebMvcTest` with
  `@Import({SecurityConfig.class, TestJwts.class, CurrentUserService.class})` and a
  `TestJwts.validToken(userId)` bearer token.
- If a full `@SpringBootTest` is ever needed, provide test-only `application-test.yml`
  values (or Testcontainers Postgres) rather than depending on real Supabase infra in CI.

Per ADR0007, tests land alongside whatever code they cover, not as a separate backfill
pass.
