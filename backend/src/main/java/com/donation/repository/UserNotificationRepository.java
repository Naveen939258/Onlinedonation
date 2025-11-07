package com.donation.repository;

import com.donation.entity.UserNotification;
import com.donation.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findByUserOrderByIdDesc(User user);
}
