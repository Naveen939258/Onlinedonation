package com.donation.repository;

import com.donation.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByStatus(String status);

    // ✅ Add this line:
    Optional<Campaign> findByName(String name);
}
