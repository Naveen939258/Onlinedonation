package com.donation.controller;

import com.donation.entity.User;
import com.donation.entity.UserNotification;
import com.donation.repository.UserRepository;
import com.donation.repository.UserNotificationRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class NotificationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserNotificationRepository userNotificationRepository;

    // ✅ Get notifications for specific user
    @GetMapping("/{userId}")
    public List<UserNotification> getUserNotifications(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userNotificationRepository.findByUserOrderByIdDesc(user);
    }

    // ✅ Mark all as read for a user
    @PutMapping("/{userId}/mark-read")
    public String markAllAsRead(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserNotification> notifications = userNotificationRepository.findByUserOrderByIdDesc(user);
        notifications.forEach(n -> n.setRead(true));
        userNotificationRepository.saveAll(notifications);
        return "All notifications marked as read for user " + userId;
    }
}
