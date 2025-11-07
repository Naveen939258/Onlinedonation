package com.donation.controller;

import com.donation.entity.Campaign;
import com.donation.service.CampaignService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/campaigns")
@CrossOrigin(origins = "http://localhost:5173") // frontend URL
public class AdminCampaignController {

    private final CampaignService campaignService;

    public AdminCampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public List<Campaign> getAllCampaigns() {
        return campaignService.getAllCampaigns();
    }

    @PostMapping
    public Campaign createCampaign(@RequestBody Campaign campaign) {
        return campaignService.createCampaign(campaign);
    }

    @PutMapping("/{id}")
    public Campaign updateCampaign(@PathVariable Long id, @RequestBody Campaign updated) {
        return campaignService.updateCampaign(id, updated);
    }

    @DeleteMapping("/{id}")
    public void deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
    }

    @PutMapping("/{id}/status")
    public Campaign updateStatus(@PathVariable Long id, @RequestBody Campaign request) {
        return campaignService.updateStatus(id, request.getStatus());
    }
}
