package com.donation.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
public class RazorpayService {

    private final RazorpayClient razorpayClient;
    private final String keyId;
    private final String keySecret;

    public RazorpayService(@Value("${razorpay.key_id}") String keyId,
            @Value("${razorpay.key_secret}") String keySecret) throws RazorpayException {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    // Create Razorpay order
    public JSONObject createOrder(double amount) throws RazorpayException {
        JSONObject options = new JSONObject();
        options.put("amount", (int) (amount * 100)); // in paise
        options.put("currency", "INR");
        options.put("payment_capture", 1);
        Order order = razorpayClient.orders.create(options);
        return new JSONObject(order.toString());
    }

    // Verify Razorpay signature
    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);

            byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = bytesToHex(hashBytes);

            return generatedSignature.equalsIgnoreCase(signature);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public String getKeyId() {
        return keyId;
    }
}
