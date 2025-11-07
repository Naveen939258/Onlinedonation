package com.donation.service;

import com.donation.entity.Admin;
import com.donation.repository.AdminRepository;
import com.donation.repository.CampaignRepository;
import com.donation.repository.DonationRepository;
import com.donation.repository.VolunteerRepository;
import com.donation.repository.UserRepository; // ✅ use UserRepository instead of DonorRepository
import com.donation.config.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private final UserRepository userRepository; // ✅ renamed from donorRepository
    private final VolunteerRepository volunteerRepository;
    private final CampaignRepository campaignRepository;
    private final DonationRepository donationRepository;

    // ✅ Updated constructor with UserRepository instead of DonorRepository
    public AdminService(AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            VolunteerRepository volunteerRepository,
            CampaignRepository campaignRepository,
            DonationRepository donationRepository) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.volunteerRepository = volunteerRepository;
        this.campaignRepository = campaignRepository;
        this.donationRepository = donationRepository;
    }

    // ✅ Get Admin Stats
    public Map<String, Object> getAdminStats() {
        long totalDonors = userRepository.count(); // ✅ user = donor
        long totalVolunteers = volunteerRepository.count();
        long totalCampaigns = campaignRepository.count();

        // ✅ Calculate total funds from all donations
        double totalFunds = donationRepository.findAll().stream()
                .mapToDouble(d -> d.getAmount() != 0 ? d.getAmount() : 0)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("donors", totalDonors);
        stats.put("volunteers", totalVolunteers);
        stats.put("campaigns", totalCampaigns);
        stats.put("totalFunds", totalFunds);

        return stats;
    }

    // ✅ Admin Login
    public Map<String, Object> login(String email, String password) throws Exception {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("Admin not found"));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new Exception("Invalid credentials");
        }

        String token = jwtUtil.generateToken(email);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("admin", admin);
        return response;
    }

    public PasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }
}
