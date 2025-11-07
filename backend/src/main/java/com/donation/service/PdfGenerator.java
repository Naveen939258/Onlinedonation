package com.donation.service;

import com.donation.entity.Certificate;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.property.TextAlignment;
import org.springframework.stereotype.Service;

import java.io.*;
import java.awt.image.BufferedImage;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerator {

    // create QR from URL
    private static byte[] generateQR(String text) throws Exception {
        QRCodeWriter writer = new QRCodeWriter();
        var bitMatrix = writer.encode(text, BarcodeFormat.QR_CODE, 200, 200);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
        return baos.toByteArray();
    }

    public static ByteArrayOutputStream generateCertificatePdf(
            Certificate cert,
            String mdName,
            String ecName,
            String verificationBaseUrl) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);

        float W = PageSize.A4.getWidth();
        float H = PageSize.A4.getHeight();

        document.setMargins(50, 50, 50, 50);

        // Background
        Image bg = new Image(ImageDataFactory.create(
                PdfGenerator.class.getClassLoader().getResource("static/certificate-bg.png")));
        bg.scaleAbsolute(W, H);
        bg.setFixedPosition(0, 0);
        document.add(bg);

        // Logo
        Image logo = new Image(ImageDataFactory.create(
                PdfGenerator.class.getClassLoader().getResource("static/logo.png")));
        logo.scaleToFit(250, 250);
        logo.setFixedPosition((W / 2) - 120, H - 220);
        document.add(logo);

        document.add(new Paragraph("HopeBridge")
                .setBold().setFontSize(28)
                .setFixedPosition(0, H - 210, W)
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph("Bridging donors & people in need")
                .setFontSize(14)
                .setFixedPosition(0, H - 230, W)
                .setTextAlignment(TextAlignment.CENTER));

        // Certificate No (Top Right)
        document.add(new Paragraph("Certificate No: " + cert.getCertificateNumber())
                .setFontSize(14)
                .setFixedPosition(10, H - 80, 200)
                .setTextAlignment(TextAlignment.RIGHT));

        // Title
        document.add(new Paragraph("CERTIFICATE OF PARTICIPATION")
                .setBold().setFontSize(28)
                .setFixedPosition(0, H - 310, W)
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph("This Certificate is Proudly Awarded To")
                .setFontSize(16)
                .setFixedPosition(0, H - 330, W)
                .setTextAlignment(TextAlignment.CENTER));

        // Name
        document.add(new Paragraph(cert.getUserName())
                .setBold().setFontSize(42)
                .setFixedPosition(0, H - 395, W)
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph("For participating in the event:")
                .setFontSize(14)
                .setFixedPosition(0, H - 415, W)
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph(cert.getEventTitle())
                .setBold().setFontSize(22)
                .setFixedPosition(0, H - 450, W)
                .setTextAlignment(TextAlignment.CENTER));

        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        document.add(new Paragraph("Date: " + date)
                .setFontSize(12)
                .setFixedPosition(0, H - 475, W)
                .setTextAlignment(TextAlignment.CENTER));

        // Badge
        Image badge = new Image(ImageDataFactory.create(
                PdfGenerator.class.getClassLoader().getResource("static/badge1.jpeg")));
        badge.scaleToFit(120, 120);
        badge.setFixedPosition(180, 220);
        document.add(badge);

        // QR (Generated Unique)
        String qrLink = (verificationBaseUrl.endsWith("/") ? verificationBaseUrl : verificationBaseUrl + "/")
                + cert.getCertificateNumber().trim();

        System.out.println("🔗 QR Verification URL: " + qrLink); // Debug check

        Image qr = new Image(ImageDataFactory.create(generateQR(qrLink)));

        qr.scaleToFit(120, 120);
        qr.setFixedPosition(W - 180, 220);
        document.add(qr);

        // Load Signature Font
        InputStream fontStream = PdfGenerator.class.getClassLoader()
                .getResourceAsStream("static/fonts/GreatVibes-Regular.ttf");

        if (fontStream == null) {
            throw new FileNotFoundException("Font file not found: static/fonts/GreatVibes-Regular.ttf");
        }

        byte[] fontBytes = fontStream.readAllBytes();
        var sigFont = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H, true);

        // Signature Names in cursive
        document.add(new Paragraph(mdName)
                .setFont(sigFont).setFontSize(16)
                .setFixedPosition(300, 150, 200));

        document.add(new Paragraph(ecName)
                .setFont(sigFont).setFontSize(16)
                .setFixedPosition(W - 130, 150, 200));
        // Labels
        document.add(new Paragraph("Managing Director      Event Coordinator")
                .setFontSize(16)
                .setFixedPosition(120, 130, W)
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph("Your Helping Hand Matters")
                .setFontSize(16)
                .setFixedPosition(150, 60, W)
                .setTextAlignment(TextAlignment.CENTER));

        document.close();
        return baos;
    }
}
