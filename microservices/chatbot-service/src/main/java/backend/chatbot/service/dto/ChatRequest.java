package backend.chatbot.service.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class ChatRequest {
    private String message;
    private String userEmail;
}
