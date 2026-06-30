package backend.task.manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AdminController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "role", "admin"));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("uptime", "Running");
        stats.put("port", 8082);
        stats.put("database", "PostgreSQL 16.14");
        stats.put("services", List.of("task-service", "user-service", "chatbot-service", "api-gateway"));
        return ResponseEntity.ok(stats);
    }
}
