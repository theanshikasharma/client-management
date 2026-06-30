package backend.task.manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/otp")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class OtpController {

    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generate(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email required"));
        }
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(email, otp);

        // Print clearly in backend console for demo
        System.out.println("\n========================================");
        System.out.println("  OTP FOR: " + email);
        System.out.println("  CODE:    " + otp);
        System.out.println("========================================\n");

        return ResponseEntity.ok(Map.of(
            "message", "OTP generated successfully",
            "email", email,
            "hint", "Check backend console for OTP code"
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String otp = req.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP required"));
        }
        String stored = otpStore.get(email);
        if (stored == null) {
            return ResponseEntity.status(400).body(Map.of("error", "No OTP found for this email. Please generate first."));
        }
        if (!stored.equals(otp)) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid OTP. Please try again."));
        }
        otpStore.remove(email);
        return ResponseEntity.ok(Map.of("message", "OTP verified successfully", "verified", true));
    }
}
