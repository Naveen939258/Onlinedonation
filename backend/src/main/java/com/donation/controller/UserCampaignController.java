package com.donation.controller;

import com.donation.entity.Campaign;
import com.donation.service.CampaignService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/user/campaigns")
@CrossOrigin(origins = "http://localhost:5173")
public class UserCampaignController {

    private final CampaignService campaignService;

    public UserCampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public List<Campaign> getActiveCampaigns() {
        return campaignService.getActiveCampaigns();
    }

    @GetMapping("/{id}")
    public Campaign getCampaign(@PathVariable Long id) {
        return campaignService.getCampaign(id);
    }
}
