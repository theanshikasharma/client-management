package b.task.manager.service;

import b.task.manager.dto.*;
import java.util.List;

public interface TaskService {
    TaskResponseDTO createTask(TaskRequestDTO dto);
    List<TaskResponseDTO> getAllTasks();
    TaskResponseDTO getTaskById(Long id);
    TaskResponseDTO updateTask(Long id, TaskRequestDTO dto);
    void deleteTask(Long id);
}
