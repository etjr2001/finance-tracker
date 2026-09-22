# 0003. Long-lived JWT, no refresh tokens (v1)

## Status
Superseded by 0004

## Context
A React SPA needs to authenticate against the Spring Boot API. The standard "secure" pattern is a short-lived access token plus a refresh token (with rotation, storage, and a refresh endpoint). That's meaningfully more implementation work for a single-user-at-a-time personal finance tool.

## Decision
Issue one JWT on login with a long expiry (~7 days). No refresh token, no refresh endpoint. When it expires, the user just logs in again.

## Consequences
- Much less auth code to write and maintain for v1.
- A stolen/leaked token stays valid for up to 7 days with no way to revoke it early — acceptable for v1's threat model, not acceptable if this ever handles real bank connections or multiple sensitive integrations.
- Adding refresh tokens later is additive (new endpoint, new client-side token-refresh logic) — doesn't require reworking what's already built.