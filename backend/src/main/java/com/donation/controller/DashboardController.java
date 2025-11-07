package com.donation.controller;

import com.donation.config.JwtUtil;
import com.donation.entity.Donation;
import com.donation.repository.CampaignRepository;
import com.donation.repository.DonationRepository;
import com.donation.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;

    public DashboardController(DonationRepository donationRepository,
            CampaignRepository campaignRepository,
            UserRepository userRepository) {
        this.donationRepository = donationRepository;
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
    }

    // ✅ User-specific Stats
    @GetMapping("/stats")
    public Map<String, Object> getUserStats(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> stats = new HashMap<>();
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = new JwtUtil().extractEmail(token);

            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Donation> donations = donationRepository.findAllByUser(user);

            double totalUserAmount = donations.stream()
                    .mapToDouble(Donation::getAmount)
                    .sum();

            stats.put("totalDonations", donations.size());
            stats.put("totalAmountCollected", totalUserAmount);
            stats.put("totalCampaigns", campaignRepository.count());
        } catch (Exception e) {
            e.printStackTrace();
            stats.put("totalDonations", 0);
            stats.put("totalAmountCollected", 0);
            stats.put("totalCampaigns", campaignRepository.count());
        }
        return stats;
    }

    // ✅ Recent Donations (Filtered by Logged-in User)
    @GetMapping("/recent")
    public List<Map<String, Object>> getRecentDonations(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = new JwtUtil().extractEmail(token);

            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return donationRepository.findAllByUser(user).stream()
                    .sorted((d1, d2) -> d2.getCreatedAt().compareTo(d1.getCreatedAt()))
                    .limit(5)
                    .map(d -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", d.getId());
                        m.put("amount", d.getAmount());
                        m.put("campaignName", d.getCampaign() != null ? d.getCampaign().getName() : "-");
                        m.put("razorpayOrderId", d.getRazorpayOrderId());
                        m.put("razorpayPaymentId", d.getRazorpayPaymentId());
                        m.put("status", d.getStatus() == null ? "Pending" : d.getStatus());
                        m.put("date", d.getCreatedAt() != null ? d.getCreatedAt().toString() : "-");
                        return m;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    // ✅ AI Recommended Campaigns
    @GetMapping("/recommendations")
    public List<Map<String, Object>> getRecommendations(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = new JwtUtil().extractEmail(token);

            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<String> donatedCampaigns = donationRepository.findAllByUser(user).stream()
                    .map(d -> d.getCampaign().getName())
                    .collect(Collectors.toList());

            return campaignRepository.findAll().stream()
                    .filter(c -> !donatedCampaigns.contains(c.getName()))
                    .map(c -> {
                        Map<String, Object> rec = new HashMap<>();
                        rec.put("id", c.getId());
                        rec.put("name", c.getName());
                        rec.put("description", c.getDescription());
                        rec.put("goal", c.getGoal());
                        rec.put("raised", c.getRaised());
                        rec.put("match", new Random().nextInt(30) + 70);
                        return rec;
                    })
                    .limit(5)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}
