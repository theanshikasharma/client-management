package backend.chatbot.service.controller;
import backend.chatbot.service.dto.*;
import backend.chatbot.service.service.McpOrchestrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequiredArgsConstructor
public class ChatbotController {
    private final McpOrchestrationService mcpService;
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "chatbot-service"));
    }
    @PostMapping("/process")
    public ResponseEntity<ChatResponse> process(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(mcpService.process(request));
    }
}
