package com.donation.service;

import com.donation.entity.*;
import com.donation.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepo;
    private final EventRegistrationRepository registrationRepo;
    private final UserRepository userRepo;
    @Autowired
    private CertificateRepository certificateRepository;

    public EventService(EventRepository eventRepo,
            EventRegistrationRepository registrationRepo,
            UserRepository userRepo) {
        this.eventRepo = eventRepo;
        this.registrationRepo = registrationRepo;
        this.userRepo = userRepo;
    }

    // return upcoming active events (also auto-disable past)
    @Transactional(readOnly = true)
    public List<Event> getUpcomingEvents() {
        autoDisablePastEvents();
        return eventRepo.findByDateAfterAndStatus(LocalDate.now().minusDays(1), "Active");
    }

    public List<Event> getAllEvents() {
        autoDisablePastEvents();
        return eventRepo.findAll();
    }

    public Event saveEvent(Event event) {
        // Normalize: if date before today and status active -> set inactive
        if (event.getDate() != null && event.getDate().isBefore(LocalDate.now())) {
            event.setStatus("Inactive");
        }
        Event saved = eventRepo.save(event);
        recalcParticipants(saved);
        return saved;
    }

    public Event updateEvent(Long id, Event updated) {
        Event existing = eventRepo.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        existing.setTitle(updated.getTitle());
        existing.setLocation(updated.getLocation());
        existing.setDate(updated.getDate());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        existing.setType(updated.getType());
        existing.setCapacity(updated.getCapacity());
        existing.setStatus(updated.getStatus());
        Event saved = eventRepo.save(existing);
        recalcParticipants(saved);
        return saved;
    }

    public void deleteEvent(Long id) {
        eventRepo.deleteById(id);
    }

    public void toggleStatus(Long id, String status) {
        Event e = eventRepo.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        e.setStatus(status);
        eventRepo.save(e);
    }

    @Transactional
    public void joinEvent(Long eventId, String userEmail, int members) {
        if (members < 1)
            members = 1;
        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        if (!"Active".equalsIgnoreCase(event.getStatus())) {
            throw new RuntimeException("Event is not active");
        }

        // find user
        User user = userRepo.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));

        // prevent duplicate registration
        Optional<EventRegistration> existing = registrationRepo.findByEventAndUser(event, user);
        if (existing.isPresent()) {
            throw new RuntimeException("Already joined");
        }

        // check capacity
        if (event.getCapacity() > 0) {
            int current = registrationRepo.findByEvent(event).stream().mapToInt(EventRegistration::getMembers).sum();
            if (current + members > event.getCapacity()) {
                throw new RuntimeException("Event capacity exceeded");
            }
        }

        EventRegistration reg = new EventRegistration(event, user, members);
        registrationRepo.save(reg);

        // recalc participants and save event
        recalcParticipants(event);
    }

    public List<EventRegistration> getRegistrationsForEvent(Long eventId) {
        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        return registrationRepo.findByEvent(event);
    }

    public List<EventRegistration> getRegistrationsForUser(String userEmail) {
        User user = userRepo.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        return registrationRepo.findByUser(user);
    }

    private void recalcParticipants(Event event) {
        List<EventRegistration> regs = registrationRepo.findByEvent(event);
        int total = regs.stream().mapToInt(EventRegistration::getMembers).sum();
        event.setParticipants(total);
        eventRepo.save(event);
    }

    // Auto-disable any past events (date < today)
    @Transactional
    public void autoDisablePastEvents() {
        List<Event> all = eventRepo.findAll();
        LocalDate today = LocalDate.now();
        boolean changed = false;
        for (Event e : all) {
            if (e.getDate() != null && e.getDate().isBefore(today) && "Active".equalsIgnoreCase(e.getStatus())) {
                e.setStatus("Inactive");
                changed = true;
            }
        }
        if (changed)
            eventRepo.saveAll(all);
    }

    @Transactional
    public Event addImageToGallery(Long eventId, String imageUrl, String userEmail) {
        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        // allow adding only after event is in past
        if (event.getDate() == null || !event.getDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Can only add photos to past events");
        }

        User user = userRepo.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));

        // verify user registered for this event
        Optional<EventRegistration> reg = registrationRepo.findByEventAndUser(event, user);
        if (reg.isEmpty()) {
            throw new RuntimeException("Only attendees can add photos");
        }

        // append url to gallery and save
        List<String> gallery = event.getGallery();
        gallery.add(imageUrl);
        event.setGallery(gallery);
        return eventRepo.save(event);
    }

    public List<Event> getPastEvents() {
        LocalDate today = LocalDate.now(); // ✅ Use LocalDate
        return eventRepo.findByDateBeforeOrderByDateDesc(today);
    }

    @Transactional
    public Event addImageToGalleryAdmin(Long eventId, String imageUrl) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Admin can add at any time (optional: restrict to past)
        if (event.getDate() == null) {
            throw new RuntimeException("Event has no valid date");
        }

        List<String> gallery = event.getGallery();
        if (gallery == null) {
            gallery = new java.util.ArrayList<>();
        }
        gallery.add(imageUrl);
        event.setGallery(gallery);
        return eventRepo.save(event);
    }

    @Transactional
    public Event removeImageFromGalleryAdmin(Long eventId, String imageUrl) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        List<String> gallery = event.getGallery();
        if (gallery != null && gallery.remove(imageUrl)) {
            event.setGallery(gallery);
            eventRepo.save(event);
        }
        return event;
    }

    @Transactional
    public EventRegistration getRegistrationForUser(Event event, String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return registrationRepo.findByEventAndUser(event, user)
                .orElseThrow(() -> new RuntimeException("User not registered for event"));
    }

    @Transactional
    public void saveRegistration(EventRegistration reg) {
        registrationRepo.save(reg);
    }

    public Event getEventById(Long id) {
        return eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Certificate getOrCreateCertificate(EventRegistration reg) {
        Optional<Certificate> existing = certificateRepository.findByCertificateNumber(
                "HB-" + reg.getEvent().getId() + "-" + reg.getUser().getId());

        if (existing.isPresent())
            return existing.get();

        // Create new certificate
        String certNo = "HB-" + reg.getEvent().getId() + "-" + reg.getUser().getId();

        Certificate cert = new Certificate(
                certNo,
                reg.getUser().getUsername(),
                reg.getEvent().getTitle(),
                LocalDateTime.now(),
                reg.getEvent().getId());

        return certificateRepository.save(cert);
    }

}
