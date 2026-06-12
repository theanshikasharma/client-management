package backend.chatbot.service.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String priority;
    private String status;
    private String deadline;
    private String createdAt;
}
