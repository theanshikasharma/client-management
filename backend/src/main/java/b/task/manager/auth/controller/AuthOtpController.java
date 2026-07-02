package b.task.manager.auth.controller;

import b.task.manager.auth.dto.*;
import b.task.manager.auth.service.OtpService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthOtpController {

    private final OtpService otpService;

    public AuthOtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    /**
     * Dev-friendly login/register endpoints.
     * Returns a dev token immediately + an otpRequestId.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        String otpRequestId = otpService.generateOtp(request.getEmail());

        // Dev token (replace with real JWT if your project has it)
        String token = "dev-jwt-for-" + request.getEmail();
        return new ResponseEntity<>(AuthResponse.builder()
                .name(request.getName())
                .email(request.getEmail())
                .token(token)
                .otpRequestId(otpRequestId)
                .otpTtlSeconds(otpService.getOtpTtlSeconds())
                .build(), HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        return login(request);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<OtpVerifyResponse> verifyOtp(@RequestBody OtpVerifyRequest req) {
        boolean ok = otpService.verify(req.getEmail(), req.getOtpRequestId(), req.getOtp());

        if (!ok) {
            return new ResponseEntity<>(OtpVerifyResponse.builder()
                    .verified(false)
                    .message("Invalid or expired OTP")
                    .email(req.getEmail())
                    .otpRequestId(req.getOtpRequestId())
                    .build(), HttpStatus.UNAUTHORIZED);
        }

        String token = "dev-jwt-for-" + req.getEmail();
        return new ResponseEntity<>(OtpVerifyResponse.builder()
                .verified(true)
                .token(token)
                .message("OTP verified")
                .email(req.getEmail())
                .otpRequestId(req.getOtpRequestId())
                .build(), HttpStatus.OK);
    }

    /**
     * DEV ONLY endpoint to show the OTP in real time.
     * This returns the current OTP (still ephemeral + ttl).
     */
    @GetMapping("/otp-debug")
    public ResponseEntity<OtpDebugResponse> otpDebug(@RequestParam String email, @RequestParam String otpRequestId) {
        String otp = otpService.getOtpForRequestId(otpRequestId);
        Long expiresAt = otpService.getExpiresAtForRequestId(otpRequestId);

        if (otp == null || expiresAt == null) {
            return new ResponseEntity<>(OtpDebugResponse.builder()
                    .email(email)
                    .otp("")
                    .otpRequestId(otpRequestId)
                    .expiresAtEpochMillis(0)
                    .build(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(OtpDebugResponse.builder()
                .email(email)
                .otp(otp)
                .otpRequestId(otpRequestId)
                .expiresAtEpochMillis(expiresAt)
                .build(), HttpStatus.OK);

    }
}

