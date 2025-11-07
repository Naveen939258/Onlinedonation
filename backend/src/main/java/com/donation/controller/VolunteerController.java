package com.donation.controller;

import com.donation.entity.Volunteer;
import com.donation.entity.VolunteerTask;
import com.donation.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/volunteers")
@CrossOrigin(origins = "http://localhost:3000")
public class VolunteerController {

    @Autowired
    private VolunteerRepository volunteerRepository;

    // Register new volunteer
    @PostMapping("/register")
    public ResponseEntity<String> registerVolunteer(@RequestBody Volunteer volunteer) {
        volunteer.setStatus("Pending");
        volunteerRepository.save(volunteer);
        return ResponseEntity.ok("Volunteer registered successfully");
    }

    // Get all volunteers
    @GetMapping("/all")
    public ResponseEntity<List<Volunteer>> getAllVolunteers() {
        return ResponseEntity.ok(volunteerRepository.findAll());
    }

    // Delete volunteer
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVolunteer(@PathVariable Long id) {
        if (!volunteerRepository.existsById(id))
            return ResponseEntity.notFound().build();
        volunteerRepository.deleteById(id);
        return ResponseEntity.ok("Volunteer deleted successfully");
    }

    // Update status
    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateVolunteerStatus(@PathVariable Long id, @RequestBody Volunteer volunteer) {
        return volunteerRepository.findById(id)
                .map(v -> {
                    v.setStatus(volunteer.getStatus());
                    volunteerRepository.save(v);
                    return ResponseEntity.ok("Status updated");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Assign multiple tasks
    @PutMapping("/{id}/tasks")
    public ResponseEntity<String> assignTasks(@PathVariable Long id, @RequestBody List<VolunteerTask> tasks) {
        return volunteerRepository.findById(id)
                .map(v -> {
                    v.setTasks(tasks);
                    volunteerRepository.save(v);
                    return ResponseEntity.ok("Tasks assigned successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Mark single task completed
    @PutMapping("/{id}/task/completed")
    public ResponseEntity<String> markTaskCompleted(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String taskName = payload.get("taskName");
        return volunteerRepository.findById(id)
                .map(v -> {
                    v.getTasks().forEach(t -> {
                        if (t.getName().equals(taskName))
                            t.setCompleted(true);
                    });
                    volunteerRepository.save(v);
                    return ResponseEntity.ok("Task marked completed");
                }).orElse(ResponseEntity.notFound().build());
    }

    // Allow user re-submission
    @PutMapping("/{id}/allow-resubmit")
    public ResponseEntity<String> allowResubmit(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        return volunteerRepository.findById(id)
                .map(v -> {
                    v.setAllowResubmit(payload.get("allowResubmit"));
                    volunteerRepository.save(v);
                    return ResponseEntity.ok("Resubmission flag updated");
                }).orElse(ResponseEntity.notFound().build());
    }

    // Update volunteer form (for resubmission)
    @PutMapping("/{id}/update")
    public ResponseEntity<String> updateVolunteer(@PathVariable Long id, @RequestBody Volunteer updated) {
        return volunteerRepository.findById(id)
                .map(v -> {
                    v.setCity(updated.getCity());
                    v.setSkills(updated.getSkills());
                    v.setAvailability(updated.getAvailability());
                    v.setMessage(updated.getMessage());
                    v.setAllowResubmit(false); // reset flag after resubmission
                    volunteerRepository.save(v);
                    return ResponseEntity.ok("Volunteer updated successfully");
                }).orElse(ResponseEntity.notFound().build());
    }
}
