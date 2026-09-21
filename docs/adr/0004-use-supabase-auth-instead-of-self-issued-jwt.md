# 0004. Use Supabase Auth instead of self-issued JWT

## Status
Accepted — supersedes 0003

## Context
ADR0003 chose a long-lived, self-issued JWT (Spring Boot signs it, ~7 day expiry, no refresh token) specifically to minimize auth code for a single-user-at-a-time personal finance tool.

Adopting Supabase for the deployment (see 0005) makes Supabase Auth available essentially for free alongside the database. Supabase Auth issues and signs the JWT itself (asymmetric keys, published via JWKS); Spring Boot's job shrinks to verifying incoming tokens as an OAuth2 resource server, rather than issuing and signing them.

This doesn't just implement ADR0003's decision with a different library — it changes who controls token lifetime, signing, and revocation. Supabase's client SDK also manages its own session refresh behind the scenes, which is closer to the refresh-token pattern ADR0003 explicitly chose to avoid, just implemented by a third party instead of by this codebase.

## Decision
Use Supabase Auth for login/signup. The frontend authenticates directly against Supabase and receives a JWT; Spring Boot verifies that JWT against the project's JWKS endpoint (`spring-boot-starter-oauth2-resource-server`, `NimbusJwtDecoder` or `jwk-set-uri`). No custom login/signup endpoints, no self-issued tokens, no JWT signing key to manage in this codebase.

## Consequences
- Removes essentially all auth code from this codebase: no password hashing, no login/signup endpoints, no signing-key management. This serves ADR0003's original goal (minimize auth work) better than ADR0003's own mechanism did.
- Token lifetime, expiry, and any session-refresh behavior are now controlled by Supabase project settings, not by this app. The "accept no early revocation, tune expiry ourselves" trade-off from ADR0003 no longer applies as written — revocation is still not immediate, but the expiry window is Supabase's default, not a deliberate ~7-day choice made here.
- Auth becomes a hosted dependency: a Supabase Auth outage means no one can log in, independent of whether this app and its database are healthy.
- Gains password reset, email verification, and future OAuth/social login essentially for free if ever needed, without additional implementation.
- Spring Boot never holds a signing secret — only the public JWKS — which is a strictly better security posture than ADR0003's implicit shared-secret model.
