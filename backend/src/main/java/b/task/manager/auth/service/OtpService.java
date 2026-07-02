package b.task.manager.auth.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final int OTP_TTL_SECONDS = 60;
    private static final int OTP_LENGTH = 6;

    private final SecureRandom random = new SecureRandom();

    private static class OtpEntry {
        final String otp;
        final long expiresAtEpochMillis;

        private OtpEntry(String otp, long expiresAtEpochMillis) {
            this.otp = otp;
            this.expiresAtEpochMillis = expiresAtEpochMillis;
        }
    }

    private final Map<String, OtpEntry> byRequestId = new ConcurrentHashMap<>();
    private final Map<String, String> requestIdByEmail = new ConcurrentHashMap<>();

    public int getOtpTtlSeconds() {
        return OTP_TTL_SECONDS;
    }

    /**
     * Generates a new OTP for the given email.
     * Logs OTP to console for dev.
     */
    public synchronized String generateOtp(String email) {
        String otp = generateOtpValue();
        long expiresAt = Instant.now().toEpochMilli() + OTP_TTL_SECONDS * 1000L;

        String otpRequestId = java.util.UUID.randomUUID().toString();
        byRequestId.put(otpRequestId, new OtpEntry(otp, expiresAt));
        requestIdByEmail.put(email, otpRequestId);

        System.out.println("[DEV OTP] email=" + email + " otpRequestId=" + otpRequestId + " otp=" + otp + " ttlSeconds=" + OTP_TTL_SECONDS);
        return otpRequestId;
    }

    public String getOtpForRequestId(String otpRequestId) {
        OtpEntry entry = byRequestId.get(otpRequestId);
        return entry == null ? null : entry.otp;
    }

    public Long getExpiresAtForRequestId(String otpRequestId) {
        OtpEntry entry = byRequestId.get(otpRequestId);
        return entry == null ? null : entry.expiresAtEpochMillis;
    }


    public boolean verify(String email, String otpRequestId, String otp) {
        // Validate otpRequestId first
        OtpEntry entry = byRequestId.get(otpRequestId);
        if (entry == null) return false;

        if (Instant.now().toEpochMilli() > entry.expiresAtEpochMillis) return false;

        // Optional: ensure otpRequestId belongs to email
        String mappedRequestId = requestIdByEmail.get(email);
        if (mappedRequestId == null || !mappedRequestId.equals(otpRequestId)) return false;

        return entry.otp.equals(otp);
    }

    private String generateOtpValue() {
        int max = (int) Math.pow(10, OTP_LENGTH) - 1;
        int min = (int) Math.pow(10, OTP_LENGTH - 1);
        int num = random.nextInt(max - min + 1) + min;
        return String.valueOf(num);
    }
}

