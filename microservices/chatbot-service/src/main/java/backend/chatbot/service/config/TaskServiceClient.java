package backend.chatbot.service.config;
import backend.chatbot.service.dto.TaskRequest;
import backend.chatbot.service.dto.TaskResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@FeignClient(name = "task-service", url = "${task.service.url}")
public interface TaskServiceClient {
    @PostMapping("/tasks")
    TaskResponse createTask(@RequestBody TaskRequest request);
    @GetMapping("/tasks")
    List<TaskResponse> getAllTasks();
}
