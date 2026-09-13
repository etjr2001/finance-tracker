package com.project.financetracker.controller;

import com.project.financetracker.dto.AuthRequest;
import com.project.financetracker.dto.AuthResponse;
import com.project.financetracker.exception.EmailAlreadyRegisteredException;
import com.project.financetracker.exception.InvalidCredentialsException;
import com.project.financetracker.model.Category;
import com.project.financetracker.model.User;
import com.project.financetracker.repository.UserRepository;
import com.project.financetracker.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public static final List<String> STARTER_CATEGORIES =
            List.of("Groceries", "Rent", "Salary", "Transport", "Entertainment");

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody AuthRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyRegisteredException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        for (String name: STARTER_CATEGORIES) {
            Category category = new Category();
            category.setName(name);
            category.setUser(user);
            user.getCategories().add(category);
        }

        userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(user.getEmail()));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        return new AuthResponse(jwtService.generateToken(user.getEmail()));
    }


}
