package com.donation.controller;

import com.donation.entity.User;
import com.donation.service.AdminDonorService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/donors")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" }, allowCredentials = "true")
public class AdminDonorController {

    private final AdminDonorService donorService;

    public AdminDonorController(AdminDonorService donorService) {
        this.donorService = donorService;
    }

    @GetMapping
    public List<User> getAllDonors() {
        return donorService.getAllDonors();
    }

    @GetMapping("/{id}")
    public User getDonor(@PathVariable Long id) {
        return donorService.getDonorById(id);
    }

    @PostMapping
    public User createDonor(@RequestBody User donor) {
        return donorService.createDonor(donor);
    }

    @PutMapping("/{id}")
    public User updateDonor(@PathVariable Long id, @RequestBody User donor) {
        return donorService.updateDonor(id, donor);
    }

    @DeleteMapping("/{id}")
    public String deleteDonor(@PathVariable Long id) {
        donorService.deleteDonor(id);
        return "Donor deleted successfully";
    }

    // ✅ Toggle Block/Unblock
    @PatchMapping("/{id}/block")
    public User toggleBlock(@PathVariable Long id) {
        return donorService.toggleBlock(id);
    }

    // ✅ Toggle Verify/Unverify
    @PatchMapping("/{id}/verify")
    public User toggleVerify(@PathVariable Long id) {
        return donorService.toggleVerify(id);
    }
}
