package com.donation.service;

import com.donation.entity.Campaign;
import com.donation.repository.CampaignRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;

    public CampaignService(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public Campaign getCampaign(Long id) {
        return campaignRepository.findById(id).orElse(null);
    }

    public Campaign createCampaign(Campaign campaign) {
        return campaignRepository.save(campaign);
    }

    public Campaign updateCampaign(Long id, Campaign updated) {
        Campaign existing = campaignRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setName(updated.getName());
            existing.setBeneficiary(updated.getBeneficiary());
            existing.setDescription(updated.getDescription());
            existing.setImpact(updated.getImpact());
            existing.setGoal(updated.getGoal());
            existing.setRaised(updated.getRaised());
            existing.setStatus(updated.getStatus());
            return campaignRepository.save(existing);
        }
        return null;
    }

    public void deleteCampaign(Long id) {
        campaignRepository.deleteById(id);
    }

    public Campaign updateStatus(Long id, String status) {
        Campaign existing = campaignRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setStatus(status);
            return campaignRepository.save(existing);
        }
        return null;
    }

    public List<Campaign> getActiveCampaigns() {
        return campaignRepository.findByStatus("Active");
    }
}
