package com.donation.repository;

import com.donation.entity.EventRegistration;
import com.donation.entity.Event;
import com.donation.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    Optional<EventRegistration> findByEventAndUser(Event event, User user);

    List<EventRegistration> findByEvent(Event event);

    List<EventRegistration> findByUser(User user);
}
