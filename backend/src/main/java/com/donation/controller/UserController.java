package com.donation.controller;

import com.donation.entity.User;
import com.donation.service.UserService;
import com.donation.config.JwtUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User newUser = userService.registerUser(user);
            return ResponseEntity.ok(Map.of(
                    "message", "Registration successful",
                    "user", newUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Registration failed",
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user != null)
            return ResponseEntity.ok(user);
        return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
    }

    // ✅ Supports profileImage automatically via requestData
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> requestData) {
        try {
            User updated = userService.updateUser(id, requestData);
            if (updated != null)
                return ResponseEntity.ok(updated);
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Update failed",
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/email")
    public ResponseEntity<?> getUserByToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);
            User user = userService.getUserByEmail(email);
            if (user != null)
                return ResponseEntity.ok(user);
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid token"));
        }
    }
}
