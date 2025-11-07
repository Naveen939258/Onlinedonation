package com.donation.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@JsonIgnoreProperties({ "donations", "partnerCampaigns", "hibernateLazyInitializer", "handler" })

@Entity
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String beneficiary;
    private String description;
    private String impact;

    private double goal;
    private double raised = 0;

    private String status = "Active"; // Active / Inactive / Completed
    private LocalDateTime createdAt = LocalDateTime.now();

    // Optional relation to donations
    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("campaign")
    private List<Donation> donations;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("campaign")
    private List<PartnerCampaign> partnerCampaigns;

    public Campaign() {
    }

    // Getters and Setters
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

    public String getBeneficiary() {
        return beneficiary;
    }

    public void setBeneficiary(String beneficiary) {
        this.beneficiary = beneficiary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImpact() {
        return impact;
    }

    public void setImpact(String impact) {
        this.impact = impact;
    }

    public double getGoal() {
        return goal;
    }

    public void setGoal(double goal) {
        this.goal = goal;
    }

    public double getRaised() {
        return raised;
    }

    public void setRaised(double raised) {
        this.raised = raised;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Donation> getDonations() {
        return donations;
    }

    public void setDonations(List<Donation> donations) {
        this.donations = donations;
    }

    public List<PartnerCampaign> getPartnerCampaigns() {
        return partnerCampaigns;
    }

    public void setPartnerCampaigns(List<PartnerCampaign> partnerCampaigns) {
        this.partnerCampaigns = partnerCampaigns;
    }
}
