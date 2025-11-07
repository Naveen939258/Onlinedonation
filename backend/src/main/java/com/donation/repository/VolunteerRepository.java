package com.donation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.donation.entity.Volunteer;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
}
