package com.donation.config;

import com.donation.entity.Admin;
import com.donation.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String defaultEmail = "admin@donation.com";
        String defaultPassword = "admin123";

        if (adminRepository.findByEmail(defaultEmail).isEmpty()) {
            Admin admin = new Admin();
            admin.setName("Super Admin");
            admin.setEmail(defaultEmail);
            admin.setPassword(passwordEncoder.encode(defaultPassword));

            adminRepository.save(admin);
            System.out.println("✅ Default admin created -> Email: " + defaultEmail + " | Password: " + defaultPassword);
        }
    }
}
