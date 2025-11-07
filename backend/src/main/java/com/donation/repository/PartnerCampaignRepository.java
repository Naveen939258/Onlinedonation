package com.donation.repository;

import com.donation.entity.PartnerCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PartnerCampaignRepository extends JpaRepository<PartnerCampaign, Long> {
    List<PartnerCampaign> findByPartnerId(Long partnerId);
}
