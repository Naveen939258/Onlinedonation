package com.donation.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "volunteers")
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String city;
    private String skills;
    private String availability;

    @Column(length = 500)
    private String message;

    private String status = "Pending"; // Default status
    private LocalDateTime appliedAt = LocalDateTime.now();

    @ElementCollection
    @CollectionTable(name = "volunteer_tasks", joinColumns = @JoinColumn(name = "volunteer_id"))
    private List<VolunteerTask> tasks = new ArrayList<>();

    private boolean allowResubmit = false;

    public Volunteer() {
    }

    // Getters & Setters
    // ... same as before
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public List<VolunteerTask> getTasks() {
        return tasks;
    }

    public void setTasks(List<VolunteerTask> tasks) {
        this.tasks = tasks;
    }

    public boolean isAllowResubmit() {
        return allowResubmit;
    }

    public void setAllowResubmit(boolean allowResubmit) {
        this.allowResubmit = allowResubmit;
    }
}
