package com.donation.service;

import com.donation.entity.User;
import com.donation.entity.Notification;
import com.donation.entity.UserNotification;
import com.donation.repository.UserRepository;
import com.donation.repository.NotificationRepository;
import com.donation.repository.UserNotificationRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationRepository notificationRepository;
    private final UserNotificationRepository userNotificationRepository;

    public UserService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            NotificationRepository notificationRepository,
            UserNotificationRepository userNotificationRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationRepository = notificationRepository;
        this.userNotificationRepository = userNotificationRepository;
    }

    // ✅ Register user and send welcome notification
    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User newUser = userRepository.save(user);

        // Send welcome notification
        Notification welcomeNotif = notificationRepository.save(
                new Notification("Welcome to Donation Platform!"));
        userNotificationRepository.save(new UserNotification(newUser, welcomeNotif));

        return newUser;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    // ✅ Updated to handle profile image
    public User updateUser(Long id, Map<String, Object> requestData) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty())
            throw new RuntimeException("User not found");

        User user = optionalUser.get();

        String username = (String) requestData.get("username");
        String email = (String) requestData.get("email");
        String phone = (String) requestData.get("phone");
        String newPassword = (String) requestData.get("password");
        String currentPassword = (String) requestData.get("currentPassword");
        String profileImage = (String) requestData.get("profileImage"); // ✅ NEW FIELD

        if (currentPassword == null || currentPassword.isEmpty()) {
            throw new RuntimeException("Current password is required");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (username != null)
            user.setUsername(username);
        if (email != null)
            user.setEmail(email);
        if (phone != null)
            user.setPhone(phone);
        if (profileImage != null)
            user.setProfileImage(profileImage); // ✅ update image URL

        if (newPassword != null && !newPassword.isEmpty()) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        return userRepository.save(user);
    }
}
