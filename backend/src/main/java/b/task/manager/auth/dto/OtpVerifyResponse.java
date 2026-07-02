package b.task.manager.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpVerifyResponse {
    private boolean verified;
    private String token;
    private String message;
    private String email;
    private String otpRequestId;
}

