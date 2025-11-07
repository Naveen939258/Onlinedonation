package com.donation.controller;

import com.donation.entity.Admin;
import com.donation.repository.AdminRepository;
import com.donation.service.AdminService;
import com.donation.config.JwtUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final AdminService adminService;
    private final AdminRepository adminRepository;
    private final JwtUtil jwtUtil;

    public AdminController(AdminService adminService, AdminRepository adminRepository, JwtUtil jwtUtil) {
        this.adminService = adminService;
        this.adminRepository = adminRepository;
        this.jwtUtil = jwtUtil;
    }

    // ✅ Admin Login
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Admin admin) {
        try {
            Map<String, Object> response = adminService.login(admin.getEmail(), admin.getPassword());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ✅ Get Admin Profile (Requires Token)
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("auth-token") String token) {
        try {
            // Extract email from JWT token
            String email = jwtUtil.extractEmail(token);

            // Find admin by email
            Admin admin = adminRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            return ResponseEntity.ok(admin);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("auth-token") String token,
            @RequestBody Map<String, String> updates) {
        try {
            String email = jwtUtil.extractEmail(token);
            Admin admin = adminRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            String currentPassword = updates.get("currentPassword");
            String newPassword = updates.get("newPassword");
            String name = updates.get("name");
            String phone = updates.get("phone");
            String organization = updates.get("organization");
            String newEmail = updates.get("email");

            // ✅ Use PasswordEncoder for checking current password
            if (!adminService.getPasswordEncoder().matches(currentPassword, admin.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid current password"));
            }

            // ✅ Apply profile updates
            if (name != null && !name.isEmpty())
                admin.setName(name);
            if (newEmail != null && !newEmail.isEmpty())
                admin.setEmail(newEmail);
            if (phone != null && !phone.isEmpty())
                admin.setPhone(phone);
            if (organization != null && !organization.isEmpty())
                admin.setOrganization(organization);

            // ✅ Hash new password before saving
            if (newPassword != null && !newPassword.isEmpty()) {
                admin.setPassword(adminService.getPasswordEncoder().encode(newPassword));
            }

            adminRepository.save(admin);
            return ResponseEntity.ok(admin);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Get Admin Dashboard Stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestHeader("auth-token") String token) {
        try {
            String email = jwtUtil.extractEmail(token);
            adminRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            Map<String, Object> stats = adminService.getAdminStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}
