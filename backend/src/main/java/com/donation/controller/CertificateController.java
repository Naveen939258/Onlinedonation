package com.donation.controller;

import com.donation.entity.Certificate;
import com.donation.service.CertificateService;
import com.donation.service.PdfGenerator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class CertificateController {

    private final CertificateService certificateService;

    // replace these with your chosen names
    private static final String MD_NAME = "Naveen Kakarla";
    private static final String EC_NAME = "Srujan";

    // base url for verification (adjust domain when deploying)
    private static final String VERIFICATION_BASE = "https://hopebridge.in/api/certificates/verify";

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    // POST to generate certificate for a user + event
    @PostMapping("/events/{eventId}/certificate")
    public ResponseEntity<?> createCertificate(
            @PathVariable Long eventId,
            @RequestBody CreateCertRequest req) {

        // req should contain userName and eventTitle
        Certificate cert = certificateService.createCertificate(req.userName, req.eventTitle, eventId);
        try {
            ByteArrayOutputStream baos = PdfGenerator.generateCertificatePdf(cert, MD_NAME, EC_NAME, VERIFICATION_BASE);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + cert.getCertificateNumber() + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(baos.toByteArray());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Failed to generate PDF");
        }
    }

    @GetMapping("/certificates/verify/{certNo}")
    public ResponseEntity<?> verify(@PathVariable String certNo) {
        Certificate c = certificateService.findByCertificateNumber(certNo);
        if (c == null)
            return ResponseEntity.status(404).body(Map.of("message", "Certificate not found"));
        return ResponseEntity.ok(Map.of(
                "certificateNumber", c.getCertificateNumber(),
                "userName", c.getUserName(),
                "eventTitle", c.getEventTitle(),
                "issuedAt", c.getIssuedAt()));
    }

    public static class CreateCertRequest {
        public String userName;
        public String eventTitle;
    }
}
