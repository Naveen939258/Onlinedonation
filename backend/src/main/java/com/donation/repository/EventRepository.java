package com.donation.repository;

import com.donation.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByDateAfterAndStatus(LocalDate date, String status);

    List<Event> findByDateBeforeOrderByDateDesc(LocalDate date);

}
