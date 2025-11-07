package com.donation.service;

import com.donation.entity.Campaign;
import com.donation.entity.Donation;
import com.donation.entity.User;
import com.donation.repository.DonationRepository;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final RazorpayService razorpayService;

    public DonationService(DonationRepository donationRepository, RazorpayService razorpayService) {
        this.donationRepository = donationRepository;
        this.razorpayService = razorpayService;
    }

    public JSONObject createOrder(double amount) throws RazorpayException {
        return razorpayService.createOrder(amount);
    }

    public Donation saveDonation(User user, Campaign campaign,
            String orderId, String paymentId,
            String signature, double amount,
            String donorName) {
        Donation donation = new Donation();
        donation.setUser(user);
        donation.setCampaign(campaign);
        donation.setRazorpayOrderId(orderId);
        donation.setRazorpayPaymentId(paymentId);
        donation.setRazorpaySignature(signature);
        donation.setAmount(amount);
        donation.setDonorName(donorName);
        return donationRepository.save(donation);
    }
}
