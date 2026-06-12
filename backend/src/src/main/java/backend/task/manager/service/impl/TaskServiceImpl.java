package backend.task.manager.service.impl;

import backend.task.manager.dto.*;
import backend.task.manager.entity.*;
import backend.task.manager.exception.TaskNotFoundException;
import backend.task.manager.repository.TaskRepository;
import backend.task.manager.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
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
                .status(dto.getStatus() != null ? dto.getStatus() : TaskStatus.PENDING)
                .priority(dto.getPriority() != null ? dto.getPriority() : TaskPriority.MEDIUM)
                .deadline(dto.getDeadline())
                .createdBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : "system")
                .build();
        return toDTO(taskRepository.save(task));
    }

    @Override
    public List<TaskResponseDTO> getAllTasks() {
        return taskRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public Page<TaskResponseDTO> getTasksPaged(int page, int size, String sortBy, String direction) {
        // Defensive defaults
        int safePage = Math.max(0, page);
        int safeSize = (size < 1) ? 10 : Math.min(size, 100);

        // Whitelist sortable fields to avoid runtime failures from invalid sortBy
        String safeSortBy = normalizeSortBy(sortBy);
        Sort.Direction safeDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Sort sort = Sort.by(safeDirection, safeSortBy);
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);
        return taskRepository.findAll(pageable).map(this::toDTO);
    }

    private String normalizeSortBy(String sortBy) {
        if (sortBy == null) return "createdAt";
        return switch (sortBy) {
            case "id", "title", "description", "status", "priority", "deadline", "createdAt", "updatedAt" -> sortBy;
            default -> "createdAt";
        };
    }


    @Override
    public TaskResponseDTO getTaskById(Long id) {
        return toDTO(taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id)));
    }

    @Override
    public TaskResponseDTO updateTask(Long id, TaskRequestDTO dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
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
                .createdBy(task.getCreatedBy())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
