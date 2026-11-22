package com.project.financetracker.config;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.ECDSASigner;
import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.gen.ECKeyGenerator;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

// Real JWTs for MockMvc tests, with no live Supabase (see this package's
// README). Import it into a @WebMvcTest: its JwtDecoder bean replaces the
// one Spring Boot would build from SUPABASE_JWKS_URI, and verifies
// signatures against a P-256 key pair generated here. Validation otherwise
// matches prod (application.yml): ES256 only, NimbusJwtDecoder's default
// checks (signature, exp/nbf with 60s clock skew), no issuer or audience
// check.
@TestConfiguration(proxyBeanMethods = false)
public class TestJwts {

    private static final ECKey KEY = generateKey();
    private static final ECKey OTHER_KEY = generateKey();

    @Bean
    JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder
                .withJwkSource(new ImmutableJWKSet<SecurityContext>(new JWKSet(KEY.toPublicJWK())))
                .jwsAlgorithm(SignatureAlgorithm.ES256)
                .build();
    }

    // Signed by the trusted key, valid for the next hour.
    public static String validToken(UUID userId) {
        return sign(KEY, userId, Instant.now().plusSeconds(3600));
    }

    // Signed by the trusted key, but expired five minutes ago (past the
    // decoder's 60s clock skew).
    public static String expiredToken(UUID userId) {
        return sign(KEY, userId, Instant.now().minusSeconds(300));
    }

    // Well-formed and unexpired, but signed by a key the decoder doesn't trust.
    public static String tokenSignedByAnotherKey(UUID userId) {
        return sign(OTHER_KEY, userId, Instant.now().plusSeconds(3600));
    }

    private static String sign(ECKey key, UUID userId, Instant expiresAt) {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(userId.toString())
                .issueTime(Date.from(expiresAt.minusSeconds(7200)))
                .expirationTime(Date.from(expiresAt))
                .build();
        try {
            SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.ES256).keyID(key.getKeyID()).build(), claims);
            jwt.sign(new ECDSASigner(key));
            return jwt.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException(e);
        }
    }

    private static ECKey generateKey() {
        try {
            return new ECKeyGenerator(Curve.P_256).keyID(UUID.randomUUID().toString()).generate();
        } catch (JOSEException e) {
            throw new IllegalStateException(e);
        }
    }
}
