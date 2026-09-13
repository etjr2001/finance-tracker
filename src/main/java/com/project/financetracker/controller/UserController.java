package com.project.financetracker.controller;

import com.project.financetracker.security.CurrentUserService;
import com.project.financetracker.service.UserBootstrapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserBootstrapService userBootstrapService;
    private final CurrentUserService currentUserService;

    @PostMapping("/bootstrap")
    public ResponseEntity<Void> bootstrap() {
        userBootstrapService.bootstrap(currentUserService.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
