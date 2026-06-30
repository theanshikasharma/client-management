package backend.task.manager.service.impl;

import backend.task.manager.dto.ChatRequestDTO;
import backend.task.manager.service.HuggingFaceChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HuggingFaceChatServiceImpl implements HuggingFaceChatService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Override
    public String chat(ChatRequestDTO request) {
        String apiKey = groqApiKey.isBlank() ? System.getenv("GROQ_API_KEY") : groqApiKey;
        if (apiKey == null || apiKey.isBlank()) {
            return "AI service not configured. Task operations work normally.";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", request.getMessage());

            Map<String, Object> body = new HashMap<>();
            body.put("model", "llama-3.1-8b-instant");
            body.put("messages", List.of(message));
            body.put("max_tokens", 256);
            body.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> resp = restTemplate.exchange(
                "https://api.groq.com/openai/v1/chat/completions",
                HttpMethod.POST, entity, String.class);

            JsonNode node = objectMapper.readTree(resp.getBody());
            return node.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            return "AI response unavailable: " + e.getMessage();
        }
    }
}
