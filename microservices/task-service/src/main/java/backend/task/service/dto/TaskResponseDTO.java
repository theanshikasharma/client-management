package backend.task.service.dto;

import backend.task.service.entity.TaskPriority;
import backend.task.service.entity.TaskStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate deadline;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
