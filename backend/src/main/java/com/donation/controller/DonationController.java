package com.donation.controller;

import com.donation.config.JwtUtil;
import com.donation.entity.Campaign;
import com.donation.entity.Donation;
import com.donation.entity.User;
import com.donation.repository.CampaignRepository;
import com.donation.repository.DonationRepository;
import com.donation.repository.UserRepository;
import com.donation.service.DonationService;
import com.donation.service.RazorpayService;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "http://localhost:5173")
public class DonationController {

    private final DonationService donationService;
    private final RazorpayService razorpayService;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final DonationRepository donationRepository;

    public DonationController(
            DonationService donationService,
            RazorpayService razorpayService,
            UserRepository userRepository,
            CampaignRepository campaignRepository,
            DonationRepository donationRepository) {
        this.donationService = donationService;
        this.razorpayService = razorpayService;
        this.userRepository = userRepository;
        this.campaignRepository = campaignRepository;
        this.donationRepository = donationRepository;
    }

    // ✅ Create Razorpay Order
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody DonationRequest request) throws RazorpayException {
        JSONObject order = donationService.createOrder(request.getAmount());
        Map<String, Object> response = new HashMap<>();
        response.put("id", order.getString("id"));
        response.put("amount", order.getInt("amount"));
        response.put("currency", order.getString("currency"));
        response.put("status", order.getString("status"));
        response.put("key", razorpayService.getKeyId());
        return ResponseEntity.ok(response);
    }

    // ✅ Verify and Save Donation
    @PostMapping("/verify")
    public ResponseEntity<?> verifyDonation(@RequestBody VerifyDonationRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Campaign campaign = campaignRepository.findByName(request.getCampaignName())
                    .orElseThrow(() -> new RuntimeException("Campaign not found"));

            boolean isValid = razorpayService.verifyPayment(
                    request.getRazorpay_order_id(),
                    request.getRazorpay_payment_id(),
                    request.getRazorpay_signature());

            if (!isValid) {
                return ResponseEntity.badRequest().body(Map.of("message", "Payment verification failed"));
            }

            campaign.setRaised(Optional.ofNullable(campaign.getRaised()).orElse(0.0) + request.getAmount());
            campaignRepository.save(campaign);

            Donation donation = donationService.saveDonation(
                    user, campaign,
                    request.getRazorpay_order_id(),
                    request.getRazorpay_payment_id(),
                    request.getRazorpay_signature(),
                    request.getAmount(),
                    request.getDonorName());

            Map<String, Object> dto = new HashMap<>();
            dto.put("id", donation.getId());
            dto.put("amount", donation.getAmount());
            dto.put("donorName", donation.getDonorName());
            dto.put("campaignName", campaign.getName());
            dto.put("userEmail", user.getEmail());
            dto.put("razorpayOrderId", donation.getRazorpayOrderId());
            dto.put("razorpayPaymentId", donation.getRazorpayPaymentId());
            dto.put("status", donation.getStatus() == null ? "Pending" : donation.getStatus());
            dto.put("date", donation.getCreatedAt().toString());

            return ResponseEntity.ok(dto);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error"));
        }
    }

    // ✅ ADMIN: Get All Donations (for admin dashboard)
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllDonations() {
        List<Donation> donations = donationRepository.findAll();

        List<Map<String, Object>> result = donations.stream().map(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", d.getId());
            m.put("amount", d.getAmount());
            m.put("donorName", d.getDonorName());
            m.put("campaignName", d.getCampaign() != null ? d.getCampaign().getName() : "-");
            m.put("paymentId", d.getRazorpayPaymentId());
            m.put("status", d.getStatus() == null ? "Pending" : d.getStatus());
            m.put("date", d.getCreatedAt() != null ? d.getCreatedAt().toString() : "");
            m.put("userEmail", d.getUser() != null ? d.getUser().getEmail() : "-"); // 👈 Added this line
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ✅ ADMIN: Update Donation Status
    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> updateDonationStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found"));

        donation.setStatus(body.getOrDefault("status", donation.getStatus()));
        donationRepository.save(donation);

        return ResponseEntity.ok(Map.of("message", "Donation status updated successfully"));
    }

    // ✅ User Donations
    @GetMapping("/my")
    public ResponseEntity<?> getMyDonations(@RequestHeader("auth-token") String token) {
        try {
            // 1️⃣ Extract email from JWT token
            String email = new JwtUtil().extractEmail(token);

            // 2️⃣ Find user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 3️⃣ Get donations of this user
            List<Donation> donations = donationRepository.findAllByUser(user);

            // 4️⃣ Map to DTO
            List<Map<String, Object>> result = donations.stream().map(d -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", d.getId());
                m.put("amount", d.getAmount());
                m.put("donorName", d.getDonorName());
                m.put("campaignName", d.getCampaign() != null ? d.getCampaign().getName() : "-");
                m.put("razorpayOrderId", d.getRazorpayOrderId());
                m.put("razorpayPaymentId", d.getRazorpayPaymentId());
                m.put("status", d.getStatus());
                m.put("date", d.getCreatedAt() != null ? d.getCreatedAt().toString() : "-");
                m.put("userEmail", d.getUser() != null ? d.getUser().getEmail() : "-");
                return m;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
        }
    }

    // DTOs
    public static class DonationRequest {
        private String campaignName;
        private double amount;
        private String donorName;
        private String email;

        public String getCampaignName() {
            return campaignName;
        }

        public void setCampaignName(String campaignName) {
            this.campaignName = campaignName;
        }

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }

        public String getDonorName() {
            return donorName;
        }

        public void setDonorName(String donorName) {
            this.donorName = donorName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class VerifyDonationRequest {
        private String razorpay_order_id;
        private String razorpay_payment_id;
        private String razorpay_signature;
        private String campaignName;
        private double amount;
        private String donorName;
        private String email;

        public String getRazorpay_order_id() {
            return razorpay_order_id;
        }

        public void setRazorpay_order_id(String razorpay_order_id) {
            this.razorpay_order_id = razorpay_order_id;
        }

        public String getRazorpay_payment_id() {
            return razorpay_payment_id;
        }

        public void setRazorpay_payment_id(String razorpay_payment_id) {
            this.razorpay_payment_id = razorpay_payment_id;
        }

        public String getRazorpay_signature() {
            return razorpay_signature;
        }

        public void setRazorpay_signature(String razorpay_signature) {
            this.razorpay_signature = razorpay_signature;
        }

        public String getCampaignName() {
            return campaignName;
        }

        public void setCampaignName(String campaignName) {
            this.campaignName = campaignName;
        }

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }

        public String getDonorName() {
            return donorName;
        }

        public void setDonorName(String donorName) {
            this.donorName = donorName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}
