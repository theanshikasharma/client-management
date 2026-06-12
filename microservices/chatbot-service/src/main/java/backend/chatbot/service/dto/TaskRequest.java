package backend.chatbot.service.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskRequest {
    private String title;
    private String priority;
    private String status;
    private String deadline;
    private String createdBy;
}
