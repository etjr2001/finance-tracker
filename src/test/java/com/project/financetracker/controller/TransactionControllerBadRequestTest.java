package com.project.financetracker.controller;

import com.project.financetracker.config.SecurityConfig;
import com.project.financetracker.config.TestJwts;
import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.UUID;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// API-M1: requests the server can't even parse are the client's fault and
// get a 400 in the usual { "error": ... } shape, not the catch-all's 500.
// Runs through the real MVC stack and security chain (valid token from
// TestJwts), so it covers what Spring actually throws, not just the handler.
@WebMvcTest(TransactionController.class)
@Import({SecurityConfig.class, TestJwts.class, CurrentUserService.class})
class TransactionControllerBadRequestTest {

    private static final String BEARER = "Bearer " + TestJwts.validToken(UUID.randomUUID());
    private static final String VALID_BODY =
            "{\"type\":\"EXPENSE\",\"amount\":12.50,\"date\":\"2026-11-22\",\"note\":null,\"categoryId\":5}";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService transactionService;

    private MockHttpServletRequestBuilder createWith(String body) {
        return post("/api/transactions")
                .header("Authorization", BEARER)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body);
    }

    @Test
    void malformedJsonIsABadRequest() throws Exception {
        mockMvc.perform(createWith("{\"type\":\"EXPENSE\","))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Request body is missing or malformed."));

        verifyNoInteractions(transactionService);
    }

    @Test
    void missingBodyIsABadRequest() throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", BEARER)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Request body is missing or malformed."));
    }

    @Test
    void unknownTypeIsABadRequest() throws Exception {
        mockMvc.perform(createWith(VALID_BODY.replace("EXPENSE", "REFUND")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Request body is missing or malformed."));

        verifyNoInteractions(transactionService);
    }

    @Test
    void unparseableDateIsABadRequest() throws Exception {
        mockMvc.perform(createWith(VALID_BODY.replace("2026-11-22", "22/11/2026")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Request body is missing or malformed."));

        verifyNoInteractions(transactionService);
    }

    @Test
    void nonNumericIdOnDeleteIsABadRequest() throws Exception {
        mockMvc.perform(delete("/api/transactions/abc").header("Authorization", BEARER))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid value for 'id'."));

        verifyNoInteractions(transactionService);
    }

    @Test
    void nonNumericIdOnUpdateIsABadRequest() throws Exception {
        mockMvc.perform(put("/api/transactions/abc")
                        .header("Authorization", BEARER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid value for 'id'."));

        verifyNoInteractions(transactionService);
    }
}
