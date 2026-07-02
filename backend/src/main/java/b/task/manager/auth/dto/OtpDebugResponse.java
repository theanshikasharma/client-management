package b.task.manager.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpDebugResponse {
    private String email;
    private String otp;
    private String otpRequestId;
    private long expiresAtEpochMillis;
}

