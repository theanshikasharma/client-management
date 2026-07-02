package b.task.manager.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String name;
    private String email;
    private String token;
    private String otpRequestId;
    private int otpTtlSeconds;
}

