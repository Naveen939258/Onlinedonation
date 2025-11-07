package com.donation.repository;

import com.donation.entity.PartnerNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PartnerNotificationRepository extends JpaRepository<PartnerNotification, Long> {
    List<PartnerNotification> findByPartnerIdOrderByCreatedAtDesc(Long partnerId);
}
