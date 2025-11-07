package com.donation.service;

import com.donation.entity.Event;
import com.donation.entity.EventRegistration;
import com.donation.repository.EventRegistrationRepository;
import com.donation.repository.EventRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReminderService {

    private final EventRepository eventRepo;
    private final EventRegistrationRepository registrationRepo;

    @Value("${TWILIO_ACCOUNT_SID}")
    private String accountSid;

    @Value("${TWILIO_AUTH_TOKEN}")
    private String authToken;

    @Value("${TWILIO_WHATSAPP}")
    private String twilioWhatsApp;

    public ReminderService(EventRepository eventRepo, EventRegistrationRepository registrationRepo) {
        this.eventRepo = eventRepo;
        this.registrationRepo = registrationRepo;
    }

    // Initialize Twilio *after* Spring loads properties
    @PostConstruct
    public void initTwilio() {
        Twilio.init(accountSid, authToken);
        System.out.println("✅ Twilio initialized successfully.");
    }

    @Scheduled(fixedRate = 60_000) // check every 1 min
    public void sendScheduledReminders() {
        List<Event> events = eventRepo.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (Event e : events) {
            LocalDateTime eventDateTime = e.getDate().atTime(LocalTime.of(9, 0)); // default 9 AM
            List<EventRegistration> regs = registrationRepo.findByEvent(e);

            for (EventRegistration reg : regs) {
                Integer hoursBefore = reg.getReminderHoursBefore();
                if (hoursBefore == null)
                    continue;

                LocalDateTime reminderTime = eventDateTime.minusHours(hoursBefore);
                // send only once, within 1-minute window
                if (!reg.getUser().getPhone().isEmpty() &&
                        now.isAfter(reminderTime.minusMinutes(1)) &&
                        now.isBefore(reminderTime.plusMinutes(1))) {
                    sendWhatsAppMessage(reg.getUser().getPhone(),
                            "🌟 Reminder: Event '" + e.getTitle() + "' is on " + e.getDate() + ". See you there!");
                }
            }
        }
    }

    private void sendWhatsAppMessage(String to, String msg) {
        try {
            Message.creator(
                    new PhoneNumber("whatsapp:" + to),
                    new PhoneNumber(twilioWhatsApp),
                    msg).create();
            System.out.println("📩 WhatsApp reminder sent to: " + to);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
