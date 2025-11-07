package com.donation.controller;

import com.donation.entity.*;
import com.donation.service.EventService;
import com.donation.service.PdfGenerator;
import com.donation.repository.EventRepository;
import com.donation.repository.EventRegistrationRepository;
import com.donation.config.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {

    private final EventService eventService;
    private final JwtUtil jwtUtil; // used to extract email from Bearer token

    public EventController(EventService eventService, JwtUtil jwtUtil) {
        this.eventService = eventService;
        this.jwtUtil = jwtUtil;
    }

    // USER: get only upcoming active events
    @GetMapping("/events")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingEvents() {
        List<Event> events = eventService.getUpcomingEvents();
        List<Map<String, Object>> dto = events.stream().map(this::toEventDto).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    // ADMIN: get all events
    @GetMapping("/admin/events")
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        List<Event> events = eventService.getAllEvents();
        List<Map<String, Object>> dto = events.stream().map(this::toEventDto).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    // ADMIN: create event
    @PostMapping("/admin/events")
    public ResponseEntity<Map<String, Object>> createEvent(@RequestBody Event event) {
        Event saved = eventService.saveEvent(event);
        return ResponseEntity.ok(toEventDto(saved));
    }

    // ADMIN: update event
    @PutMapping("/admin/events/{id}")
    public ResponseEntity<Map<String, Object>> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        Event saved = eventService.updateEvent(id, event);
        return ResponseEntity.ok(toEventDto(saved));
    }

    // ADMIN: delete event
    @DeleteMapping("/admin/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
    }

    // ADMIN: toggle status
    @PutMapping("/admin/events/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        eventService.toggleStatus(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }

    // USER: join event (members count optional query param or in JSON body)
    @PostMapping("/events/{id}/join")
    public ResponseEntity<?> joinEvent(@PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String token = null;
            if (authHeader != null && authHeader.startsWith("Bearer "))
                token = authHeader.substring(7);
            if (token == null)
                return ResponseEntity.status(401).body(Map.of("message", "Missing token"));

            String email = jwtUtil.extractEmail(token);
            int members = 1;
            if (body != null && body.get("members") != null) {
                members = Integer.parseInt(body.get("members").toString());
            }

            eventService.joinEvent(id, email, members);
            return ResponseEntity.ok(Map.of("message", "Joined successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error"));
        }
    }

    // USER: get events the current user joined
    @GetMapping("/user/events")
    public ResponseEntity<?> getUserEvents(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String token = null;
            if (authHeader != null && authHeader.startsWith("Bearer "))
                token = authHeader.substring(7);
            if (token == null)
                return ResponseEntity.status(401).body(Map.of("message", "Missing token"));

            String email = jwtUtil.extractEmail(token);
            List<Map<String, Object>> dto = eventService.getRegistrationsForUser(email).stream().map(reg -> {
                Event e = reg.getEvent();
                Map<String, Object> m = new HashMap<>();
                m.put("eventId", e.getId());
                m.put("title", e.getTitle());
                m.put("date", e.getDate());
                m.put("location", e.getLocation());
                m.put("members", reg.getMembers());
                m.put("status", e.getStatus());
                m.put("imageUrl", e.getImageUrl());

                // ✅ Add gallery here
                List<Map<String, String>> galleryList = new ArrayList<>();
                if (e.getGallery() != null) {
                    for (String url : e.getGallery()) {
                        galleryList.add(Map.of("url", url));
                    }
                }
                m.put("gallery", galleryList);

                return m;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error"));
        }
    }

    // ADMIN: list registrations for an event
    @GetMapping("/admin/events/{id}/registrations")
    public ResponseEntity<?> getRegistrations(@PathVariable Long id) {
        try {
            List<Map<String, Object>> dto = eventService.getRegistrationsForEvent(id).stream().map(reg -> {
                User user = reg.getUser();
                Map<String, Object> m = new HashMap<>();
                m.put("id", reg.getId());
                m.put("userId", user.getId());
                m.put("userName", user.getUsername()); // ✅ Added
                m.put("userEmail", user.getEmail());
                m.put("phone", user.getPhone()); // ✅ Added
                m.put("members", reg.getMembers());
                return m;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/events/{id}/gallery")
    public ResponseEntity<?> addGalleryImage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String token = null;
            if (authHeader != null && authHeader.startsWith("Bearer "))
                token = authHeader.substring(7);
            if (token == null)
                return ResponseEntity.status(401).body(Map.of("message", "Missing token"));

            String email = jwtUtil.extractEmail(token);
            String url = body.get("url");
            if (url == null || url.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing url"));
            }
            Event updated = eventService.addImageToGallery(id, url, email);
            return ResponseEntity.ok(toEventDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error"));
        }
    }

    @GetMapping("/events/past")
    public ResponseEntity<List<Map<String, Object>>> getPastEvents() {
        List<Event> events = eventService.getPastEvents();
        List<Map<String, Object>> dto = events.stream().map(this::toEventDto).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/events/{id}/reminder")
    public ResponseEntity<?> setReminder(@PathVariable Long id,
            @RequestBody Map<String, Integer> body,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            int hoursBefore = body.getOrDefault("hoursBefore", 24);

            EventRegistration reg = eventService.getRegistrationForUser(eventService.getEventById(id), email);
            reg.setReminderHoursBefore(hoursBefore);
            eventService.saveRegistration(reg);

            return ResponseEntity.ok(Map.of("message", "Reminder set for " + hoursBefore + " hours before event"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to set reminder"));
        }
    }

    // ======================= ADMIN GALLERY ==========================
    @PostMapping("/admin/events/{id}/gallery")
    public ResponseEntity<?> addGalleryImageAdmin(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String imageUrl = body.get("url");
            Event updated = eventService.addImageToGalleryAdmin(id, imageUrl);
            return ResponseEntity.ok(Map.of(
                    "message", "Image added successfully (Admin)",
                    "gallery", updated.getGallery()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/events/{id}/gallery")
    public ResponseEntity<?> removeGalleryImageAdmin(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String imageUrl = body.get("url");
            Event updated = eventService.removeImageFromGalleryAdmin(id, imageUrl);
            return ResponseEntity.ok(Map.of(
                    "message", "Image removed successfully (Admin)",
                    "gallery", updated.getGallery()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/events/{id}/certificate")
    public ResponseEntity<byte[]> getCertificate(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            // Fetch event + registration
            Event event = eventService.getEventById(id);
            EventRegistration reg = eventService.getRegistrationForUser(event, email);

            // ✅ Create or fetch certificate entry
            Certificate cert = eventService.getOrCreateCertificate(reg); // We'll create this function next

            // ✅ Generate final PDF
            ByteArrayOutputStream out = PdfGenerator.generateCertificatePdf(
                    cert,
                    "Naveen Kakarla", // MD Name
                    "Srujan", // Event Coordinator Name
                    "https://hopebridge.in/api/certificates/verify" // Base Verify URL
            );

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=" + cert.getCertificateNumber() + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(out.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // Helper to make returned event DTO clean (no circular refs)
    private Map<String, Object> toEventDto(Event e) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", e.getId());
        m.put("title", e.getTitle());
        m.put("location", e.getLocation());
        m.put("date", e.getDate() != null ? e.getDate().toString() : null);
        m.put("type", e.getType());
        m.put("imageUrl", e.getImageUrl());
        m.put("description", e.getDescription());
        m.put("status", e.getStatus());
        m.put("capacity", e.getCapacity());
        m.put("participants", e.getParticipants());
        List<Map<String, String>> galleryList = new ArrayList<>();
        if (e.getGallery() != null) {
            for (String url : e.getGallery()) {
                galleryList.add(Map.of("url", url));
            }
        }
        m.put("gallery", galleryList);

        return m;
    }

}
