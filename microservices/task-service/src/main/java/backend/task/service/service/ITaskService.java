package backend.task.service.service;

import backend.task.service.dto.*;
import org.springframework.data.domain.Page;
import java.util.List;

public interface ITaskService {
    TaskResponseDTO createTask(TaskRequestDTO dto);
    List<TaskResponseDTO> getAllTasks();
    Page<TaskResponseDTO> getTasksPaged(int page, int size, String sortBy, String direction);
    TaskResponseDTO getTaskById(Long id);
    TaskResponseDTO updateTask(Long id, TaskRequestDTO dto);
    void deleteTask(Long id);
}
