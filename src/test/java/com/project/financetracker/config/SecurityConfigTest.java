package com.project.financetracker.config;

import com.project.financetracker.controller.TransactionController;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Auth on /api/** (SecurityConfig, ADR0004): the real filter chain and a
// real JWT decoder, with tokens signed in the test (TestJwts), so no live
// Supabase. TransactionController stands in for every /api/** endpoint; the
// rule is one path matcher, not per-controller.
@WebMvcTest(TransactionController.class)
@Import({SecurityConfig.class, TestJwts.class, CurrentUserService.class})
class SecurityConfigTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String URL = "/api/transactions?month=2026-11";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService transactionService;

    @Test
    void noTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get(URL)).andExpect(status().isUnauthorized());

        verify(transactionService, never()).listForMonth(any(), any());
    }

    @Test
    void malformedTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get(URL).header("Authorization", "Bearer not-a-jwt"))
                .andExpect(status().isUnauthorized());

        verify(transactionService, never()).listForMonth(any(), any());
    }

    @Test
    void tokenSignedByAnUntrustedKeyIsUnauthorized() throws Exception {
        mockMvc.perform(get(URL).header("Authorization", "Bearer " + TestJwts.tokenSignedByAnotherKey(USER_ID)))
                .andExpect(status().isUnauthorized());

        verify(transactionService, never()).listForMonth(any(), any());
    }

    @Test
    void expiredTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get(URL).header("Authorization", "Bearer " + TestJwts.expiredToken(USER_ID)))
                .andExpect(status().isUnauthorized());

        verify(transactionService, never()).listForMonth(any(), any());
    }

    @Test
    void validTokenReachesTheControllerAsThatUser() throws Exception {
        when(transactionService.listForMonth(USER_ID, YearMonth.of(2026, 11))).thenReturn(List.of());

        mockMvc.perform(get(URL).header("Authorization", "Bearer " + TestJwts.validToken(USER_ID)))
                .andExpect(status().isOk());

        verify(transactionService).listForMonth(USER_ID, YearMonth.of(2026, 11));
    }
}
