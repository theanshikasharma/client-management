package backend.chatbot.service.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatResponse {
    private String response;
    private String intent;
    private boolean taskCreated;
}
