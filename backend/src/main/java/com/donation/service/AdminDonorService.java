package com.donation.service;

import com.donation.entity.User;
import com.donation.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminDonorService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDonorService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllDonors() {
        return userRepository.findAll();
    }

    public User getDonorById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donor not found"));
    }

    public User createDonor(User donor) {
        if (donor.getPassword() != null && !donor.getPassword().isEmpty()) {
            donor.setPassword(passwordEncoder.encode(donor.getPassword()));
        }
        return userRepository.save(donor);
    }

    public User updateDonor(Long id, User donorData) {
        User donor = getDonorById(id);

        if (donorData.getUsername() != null)
            donor.setUsername(donorData.getUsername());
        if (donorData.getEmail() != null)
            donor.setEmail(donorData.getEmail());
        if (donorData.getPhone() != null)
            donor.setPhone(donorData.getPhone());
        if (donorData.getPassword() != null && !donorData.getPassword().isEmpty())
            donor.setPassword(passwordEncoder.encode(donorData.getPassword()));

        return userRepository.save(donor);
    }

    public void deleteDonor(Long id) {
        userRepository.deleteById(id);
    }

    // ✅ Toggle block/unblock
    public User toggleBlock(Long id) {
        User donor = getDonorById(id);
        donor.setBlocked(!donor.isBlocked());
        return userRepository.save(donor);
    }

    // ✅ Toggle verify/unverify
    public User toggleVerify(Long id) {
        User donor = getDonorById(id);
        donor.setVerified(!donor.isVerified());
        return userRepository.save(donor);
    }
}
