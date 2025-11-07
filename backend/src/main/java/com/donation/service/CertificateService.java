package com.donation.service;

import com.donation.entity.Certificate;
import com.donation.repository.CertificateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;

@Service
public class CertificateService {

    private final CertificateRepository repo;

    public CertificateService(CertificateRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Certificate createCertificate(String userName, String eventTitle, Long eventId) {
        // Create sequential number: HB-YYYY-0001 using repo count (simple approach)
        String year = String.valueOf(Year.now().getValue());

        // Count existing certificates for the year. For demo we count all (can be
        // improved).
        long seq = repo.count() + 1;
        String seqStr = String.format("%04d", seq);
        String certificateNumber = "HB-" + year + "-" + seqStr;

        Certificate c = new Certificate(certificateNumber, userName, eventTitle, LocalDateTime.now(), eventId);
        return repo.save(c);
    }

    public Certificate findByCertificateNumber(String certNo) {
        return repo.findByCertificateNumber(certNo).orElse(null);
    }
}
