package com.bodegon.club.service;

import com.bodegon.club.entity.Promotion;
import com.bodegon.club.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@bodegon.com}")
    private String fromEmail;

    @Async
    public void sendPromotionEmailToAll(List<User> users, Promotion promotion) {
        log.info("Starting mass email sending for promotion: {}", promotion.getTitle());
        
        for (User user : users) {
            try {
                sendHtmlEmail(user.getEmail(), 
                    "🔥 Nueva Promoción: " + promotion.getTitle(), 
                    buildPromotionHtml(user, promotion));
            } catch (Exception e) {
                log.error("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
            }
        }
        log.info("Finished mass email sending for promotion: {}", promotion.getTitle());
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        
        mailSender.send(message);
    }

    private String buildPromotionHtml(User user, Promotion promotion) {
        String discountInfo = "PERCENTAGE".equals(promotion.getDiscountType()) 
            ? promotion.getDiscountValue() + "% de descuento" 
            : "$" + promotion.getDiscountValue() + " de descuento";

        return """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #0e1a10; padding: 20px; text-align: center;">
                    <h1 style="color: #4ade80; margin: 0;">Club del Bodegón</h1>
                </div>
                <div style="padding: 30px;">
                    <h2>¡Hola %s! 👋</h2>
                    <p>Tenemos una nueva promoción exclusiva para vos en <strong>El Bodegón</strong>:</p>
                    
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #4ade80; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #111;">%s</h3>
                        <p style="font-size: 18px; font-weight: bold; color: #059669;">%s</p>
                        <p style="margin-bottom: 0;">%s</p>
                    </div>
                    
                    <p>¡No te lo pierdas! Vení a visitarnos y disfrutá de los mejores platos.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://bodegon-club.vercel.app" style="background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver en el Dashboard</a>
                    </div>
                </div>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                    <p>Este es un mensaje automático de Club del Bodegón.<br>Si no querés recibir más correos, podés ajustar tus preferencias en el perfil.</p>
                </div>
            </body>
            </html>
            """.formatted(user.getFullName(), promotion.getTitle(), discountInfo, promotion.getDescription());
    }
}
