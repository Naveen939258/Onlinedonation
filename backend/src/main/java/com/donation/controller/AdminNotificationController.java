package com.donation.controller;

import com.donation.entity.Notification;
import com.donation.entity.User;
import com.donation.entity.UserNotification;
import com.donation.repository.NotificationRepository;
import com.donation.repository.UserRepository;
import com.donation.repository.UserNotificationRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/notifications")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class AdminNotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserNotificationRepository userNotificationRepository;

    // ✅ Get all notifications (latest first)
    @GetMapping
    public List<Notification> getAllNotifications() {
        List<Notification> list = notificationRepository.findAll();
        list.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return list;
    }

    // ✅ Create new notification and send to all users
    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Notification notification) {
        String newMessage = notification.getMessage().trim();

        // Prevent duplicates within last 3 seconds
        List<Notification> existing = notificationRepository.findAll();
        boolean duplicate = existing.stream().anyMatch(n -> n.getMessage().equalsIgnoreCase(newMessage) &&
                n.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusSeconds(3)));

        if (duplicate) {
            return ResponseEntity.badRequest().body(Map.of("message", "Duplicate notification"));
        }

        // Save notification
        Notification newNotif = notificationRepository.save(new Notification(newMessage));

        // Attach to all users (batch save)
        try {
            List<User> users = userRepository.findAll();
            List<UserNotification> userNotifications = users.stream()
                    .map(user -> new UserNotification(user, newNotif))
                    .toList();

            userNotificationRepository.saveAll(userNotifications);
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("⚠️ Error attaching notification to users: " + e.getMessage());
        }

        return ResponseEntity.ok(newNotif);
    }
}
