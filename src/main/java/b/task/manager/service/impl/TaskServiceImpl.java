package b.task.manager.service.impl;

import b.task.manager.dto.*;
import b.task.manager.entity.Task;
import b.task.manager.exception.TaskNotFoundException;
import b.task.manager.repository.TaskRepository;
import b.task.manager.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    @Override
    public TaskResponseDTO createTask(TaskRequestDTO dto) {
        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : b.task.manager.entity.TaskStatus.PENDING)
                .priority(dto.getPriority() != null ? dto.getPriority() : b.task.manager.entity.TaskPriority.MEDIUM)
                .deadline(dto.getDeadline())
                .build();
        return toDTO(taskRepository.save(task));
    }

    @Override
    public List<TaskResponseDTO> getAllTasks() {
        return taskRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public TaskResponseDTO getTaskById(Long id) {
        return toDTO(taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id)));
    }

    @Override
    public TaskResponseDTO updateTask(Long id, TaskRequestDTO dto) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        task.setDeadline(dto.getDeadline());
        return toDTO(taskRepository.save(task));
    }

    @Override
    public void deleteTask(Long id) {
        taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        taskRepository.deleteById(id);
    }

    private TaskResponseDTO toDTO(Task task) {
        return TaskResponseDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .deadline(task.getDeadline())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
