package com.donation.repository;

import com.donation.entity.Donation;
import com.donation.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findAllByUser(User user);
}
