package b.task.manager.dto;

import b.task.manager.entity.TaskPriority;
import b.task.manager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskRequestDTO {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate deadline;
}
