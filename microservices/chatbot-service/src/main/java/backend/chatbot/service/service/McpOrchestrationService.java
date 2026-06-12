package backend.chatbot.service.service;

import backend.chatbot.service.config.TaskServiceClient;
import backend.chatbot.service.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class McpOrchestrationService {

    private final TaskServiceClient taskServiceClient;
    private final RestTemplate restTemplate;

    @Value("${huggingface.api.key}")
    private String hfApiKey;

    @Value("${huggingface.model}")
    private String hfModel;

    public ChatResponse process(ChatRequest request) {
        String intent = detectIntent(request.getMessage());
        log.info("Intent: {}", intent);
        return switch (intent) {
            case "CREATE_TASK" -> handleCreateTask(request.getMessage(), request.getUserEmail());
            case "LIST_TASKS" -> handleListTasks();
            case "TASK_STATUS" -> handleTaskStatus();
            default -> handleGeneralQuery(request.getMessage());
        };
    }

    private String detectIntent(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("create") || lower.contains("add") || lower.contains("new task")) return "CREATE_TASK";
        if (lower.contains("list") || lower.contains("show") || lower.contains("all tasks")) return "LIST_TASKS";
        if (lower.contains("status") || lower.contains("progress") || lower.contains("pending")) return "TASK_STATUS";
        return "GENERAL";
    }

    private ChatResponse handleCreateTask(String message, String userEmail) {
        String title = extractTitle(message);
        String priority = extractPriority(message);
        String deadline = extractDeadline(message);
        try {
            TaskResponse created = taskServiceClient.createTask(
                TaskRequest.builder().title(title).priority(priority)
                    .status("PENDING").deadline(deadline.isEmpty() ? null : deadline)
                    .createdBy(userEmail != null ? userEmail : "ai-assistant").build()
            );
            String ai = callHuggingFace("Confirm in one sentence: Task '" + created.getTitle() + "' with " + created.getPriority() + " priority created.");
            return ChatResponse.builder()
                .response("✅ " + ai + "\n\n**Title:** " + created.getTitle() + "\n**Priority:** " + created.getPriority() + "\n**Status:** PENDING" + (deadline.isEmpty() ? "" : "\n**Deadline:** " + deadline))
                .intent("CREATE_TASK").taskCreated(true).build();
        } catch (Exception e) {
            log.error("Create task failed", e);
            return ChatResponse.builder().response("❌ Failed to create task.").intent("CREATE_TASK").taskCreated(false).build();
        }
    }

    private ChatResponse handleListTasks() {
        try {
            List<TaskResponse> tasks = taskServiceClient.getAllTasks();
            if (tasks.isEmpty()) return ChatResponse.builder().response("No tasks found. Try creating one!").intent("LIST_TASKS").taskCreated(false).build();
            StringBuilder sb = new StringBuilder("📋 **Found " + tasks.size() + " tasks:**\n\n");
            tasks.forEach(t -> sb.append("• **").append(t.getTitle()).append("** — ").append(t.getPriority()).append(" · ").append(t.getStatus()).append("\n"));
            return ChatResponse.builder().response(sb.toString()).intent("LIST_TASKS").taskCreated(false).build();
        } catch (Exception e) {
            return ChatResponse.builder().response("❌ Could not fetch tasks.").intent("LIST_TASKS").taskCreated(false).build();
        }
    }

    private ChatResponse handleTaskStatus() {
        try {
            List<TaskResponse> tasks = taskServiceClient.getAllTasks();
            long done = tasks.stream().filter(t -> "DONE".equals(t.getStatus())).count();
            long pending = tasks.stream().filter(t -> "PENDING".equals(t.getStatus())).count();
            long inProgress = tasks.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count();
            long high = tasks.stream().filter(t -> "HIGH".equals(t.getPriority())).count();
            int pct = tasks.isEmpty() ? 0 : (int)((done * 100) / tasks.size());
            return ChatResponse.builder()
                .response("📊 **Task Status:**\n\nTotal: " + tasks.size() + "\nCompletion: " + pct + "%\nPending: " + pending + "\nIn Progress: " + inProgress + "\nDone: " + done + "\nHigh Priority: " + high)
                .intent("TASK_STATUS").taskCreated(false).build();
        } catch (Exception e) {
            return ChatResponse.builder().response("❌ Could not fetch status.").intent("TASK_STATUS").taskCreated(false).build();
        }
    }

    private ChatResponse handleGeneralQuery(String message) {
        String ai = callHuggingFace("You are a Deloitte AI assistant. Answer briefly: " + message);
        return ChatResponse.builder().response(ai).intent("GENERAL").taskCreated(false).build();
    }

    private String callHuggingFace(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(hfApiKey);
            Map<String, Object> body = new HashMap<>();
            body.put("inputs", prompt);
            body.put("parameters", Map.of("max_new_tokens", 150, "temperature", 0.7, "return_full_text", false));
            ResponseEntity<List> resp = restTemplate.exchange(
                "https://api-inference.huggingface.co/models/" + hfModel,
                HttpMethod.POST, new HttpEntity<>(body, headers), List.class);
            if (resp.getBody() != null && !resp.getBody().isEmpty()) {
                Map<?, ?> first = (Map<?, ?>) resp.getBody().get(0);
                String text = (String) first.get("generated_text");
                if (text != null && !text.isBlank()) return text.trim();
            }
        } catch (Exception e) { log.warn("HuggingFace failed: {}", e.getMessage()); }
        return "Request processed successfully.";
    }

    private String extractTitle(String message) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("task[—\\-–:]\\s*(.+)", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(message);
        if (m.find()) return m.group(1).replaceAll("(?i)tomorrow|today|next week|high|low|medium|priority", "").trim();
        return message.length() > 60 ? message.substring(0, 60) : message;
    }

    private String extractPriority(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("high") || lower.contains("urgent")) return "HIGH";
        if (lower.contains("low")) return "LOW";
        return "MEDIUM";
    }

    private String extractDeadline(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("tomorrow")) return LocalDate.now().plusDays(1).toString();
        if (lower.contains("next week")) return LocalDate.now().plusWeeks(1).toString();
        if (lower.contains("today")) return LocalDate.now().toString();
        return "";
    }
}
