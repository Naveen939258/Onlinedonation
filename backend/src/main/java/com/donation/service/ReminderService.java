package com.donation.service;

import com.donation.entity.*;
import com.donation.repository.EventRegistrationRepository;
import com.donation.repository.EventRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class ReminderService {

    private final EventRepository eventRepo;
    private final EventRegistrationRepository registrationRepo;

    public ReminderService(EventRepository eventRepo, EventRegistrationRepository registrationRepo) {
        this.eventRepo = eventRepo;
        this.registrationRepo = registrationRepo;
    }

    public static final String ACCOUNT_SID = System.getenv("TWILIO_ACCOUNT_SID");
    public static final String AUTH_TOKEN = System.getenv("TWILIO_AUTH_TOKEN");
    public static final String TWILIO_WHATSAPP = "whatsapp:+14155238886";
    static {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
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
                    new PhoneNumber(TWILIO_WHATSAPP),
                    msg).create();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
