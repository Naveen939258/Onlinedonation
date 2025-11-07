package com.donation.repository;

import com.donation.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCertificateNumber(String certificateNumber);

    @Query("SELECT COUNT(c) FROM Certificate c WHERE YEAR(c.issuedAt) = :year")
    long countCertificatesIssuedInYear(@Param("year") int year);
}
