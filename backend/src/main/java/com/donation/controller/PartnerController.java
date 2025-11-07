package com.donation.controller;

import com.donation.entity.*;
import com.donation.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "http://localhost:3000")
public class PartnerController {

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private PartnerCampaignRepository partnerCampaignRepository;

    @Autowired
    private PartnerNotificationRepository notificationRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    // ✅ Register partner
    @PostMapping("/register")
    public ResponseEntity<?> registerPartner(@RequestBody PartnerRequest request) {
        if (partnerRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        Partner partner = new Partner();
        partner.setOrganizationName(request.getOrganizationName());
        partner.setContactPerson(request.getContactPerson());
        partner.setEmail(request.getEmail());
        partner.setPhone(request.getPhone());
        partner.setCity(request.getCity());
        partner.setMessage(request.getMessage());
        partner.setLogo(request.getLogo());
        partner.setStatus(PartnerStatus.PENDING);
        partner.setCreatedAt(LocalDateTime.now());
        partner.setUpdatedAt(LocalDateTime.now());

        partnerRepository.save(partner);

        Map<String, Object> response = new HashMap<>();
        response.put("id", partner.getId());
        response.put("organizationName", partner.getOrganizationName());
        response.put("contactPerson", partner.getContactPerson());
        response.put("email", partner.getEmail());
        response.put("phone", partner.getPhone());
        response.put("city", partner.getCity());
        response.put("message", partner.getMessage());
        response.put("logo", partner.getLogo());
        response.put("status", partner.getStatus());
        response.put("createdAt", partner.getCreatedAt().toString());

        return ResponseEntity.ok(response);
    }

    // ✅ Get all partners (for admin)
    @GetMapping("/all")
    public ResponseEntity<?> getAllPartners() {
        List<Partner> partners = partnerRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Partner p : partners) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", p.getId());
            dto.put("organizationName", p.getOrganizationName());
            dto.put("contactPerson", p.getContactPerson());
            dto.put("email", p.getEmail());
            dto.put("phone", p.getPhone());
            dto.put("city", p.getCity());
            dto.put("message", p.getMessage());
            dto.put("logo", p.getLogo());
            dto.put("status", p.getStatus());
            dto.put("createdAt", p.getCreatedAt().toString());
            result.add(dto);
        }

        return ResponseEntity.ok(result);
    }

    // ✅ Update partner status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Partner partner = partnerRepository.findById(id).orElse(null);
        if (partner == null)
            return ResponseEntity.notFound().build();

        try {
            PartnerStatus newStatus = PartnerStatus.valueOf(body.get("status").toUpperCase());
            partner.setStatus(newStatus);
            partner.setUpdatedAt(LocalDateTime.now());
            partnerRepository.save(partner);

            // Auto-notification
            PartnerNotification notification = new PartnerNotification();
            notification.setPartner(partner);
            notification.setMessage(newStatus == PartnerStatus.APPROVED
                    ? "✅ Your partnership request has been approved!"
                    : "❌ Your partnership request has been rejected.");
            notificationRepository.save(notification);

            return ResponseEntity.ok(Map.of("message", "Partner status updated", "status", newStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status value"));
        }
    }

    // ✅ Assign campaign to partner
    @PutMapping("/{partnerId}/assign/{campaignId}")
    public ResponseEntity<?> assignCampaign(@PathVariable Long partnerId, @PathVariable Long campaignId) {
        Optional<Partner> pOpt = partnerRepository.findById(partnerId);
        Optional<Campaign> cOpt = campaignRepository.findById(campaignId);

        if (pOpt.isEmpty() || cOpt.isEmpty())
            return ResponseEntity.notFound().build();

        PartnerCampaign pc = new PartnerCampaign();
        pc.setPartner(pOpt.get());
        pc.setCampaign(cOpt.get());
        partnerCampaignRepository.save(pc);

        // Auto-notification
        PartnerNotification notification = new PartnerNotification();
        notification.setPartner(pOpt.get());
        notification.setMessage("📌 A new campaign '" + cOpt.get().getName() + "' has been assigned to you!");
        notificationRepository.save(notification);

        return ResponseEntity.ok(Map.of("message", "Campaign assigned successfully"));
    }

    // ✅ Get campaigns assigned to a partner
    @GetMapping("/{partnerId}/campaigns")
    public ResponseEntity<?> getPartnerCampaigns(@PathVariable Long partnerId) {
        List<PartnerCampaign> campaigns = partnerCampaignRepository.findByPartnerId(partnerId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (PartnerCampaign pc : campaigns) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", pc.getId());
            dto.put("campaignName", pc.getCampaign().getName());
            dto.put("description", pc.getCampaign().getDescription());
            dto.put("goal", pc.getCampaign().getGoal());
            dto.put("raised", pc.getCampaign().getRaised());
            result.add(dto);
        }
        return ResponseEntity.ok(result);
    }

    // ✅ Get partner notifications
    @GetMapping("/{partnerId}/notifications")
    public ResponseEntity<?> getNotifications(@PathVariable Long partnerId) {
        List<PartnerNotification> notifications = notificationRepository.findByPartnerIdOrderByCreatedAtDesc(partnerId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (PartnerNotification n : notifications) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", n.getId());
            dto.put("message", n.getMessage());
            dto.put("createdAt", n.getCreatedAt().toString());
            result.add(dto);
        }
        return ResponseEntity.ok(result);
    }

    // ✅ DTO for registration request
    public static class PartnerRequest {
        private String organizationName;
        private String contactPerson;
        private String email;
        private String phone;
        private String city;
        private String message;
        private String logo;

        public String getOrganizationName() {
            return organizationName;
        }

        public void setOrganizationName(String organizationName) {
            this.organizationName = organizationName;
        }

        public String getContactPerson() {
            return contactPerson;
        }

        public void setContactPerson(String contactPerson) {
            this.contactPerson = contactPerson;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getLogo() {
            return logo;
        }

        public void setLogo(String logo) {
            this.logo = logo;
        }
    }
}
