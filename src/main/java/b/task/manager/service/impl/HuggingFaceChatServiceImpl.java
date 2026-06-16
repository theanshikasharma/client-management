package b.task.manager.service.impl;

import b.task.manager.dto.ChatRequestDTO;
import b.task.manager.service.HuggingFaceChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HuggingFaceChatServiceImpl implements HuggingFaceChatService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${huggingface.model:meta-llama/Meta-Llama-3-8B-Instruct}")
    private String model;

    @Override
    public String chat(ChatRequestDTO request) {
        String apiKey = System.getenv("HUGGINGFACE_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Missing env var HUGGINGFACE_API_KEY");
        }

        String userMessage = request.getMessage();
        if (userMessage == null || userMessage.isBlank()) {
            return "(No message provided)";
        }

        int maxNewTokens = request.getMaxNewTokens() != null ? request.getMaxNewTokens() : 256;

        // Using text-generation inference-style endpoint:
        // POST https://api-inference.huggingface.co/models/{model}
        String url = "https://api-inference.huggingface.co/models/" + model;

        Map<String, Object> body = new HashMap<>();
        body.put("inputs", userMessage);
        body.put("parameters", Map.of("max_new_tokens", maxNewTokens, "return_full_text", false));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw new IllegalStateException("HF request failed with status " + resp.getStatusCode());
            }

            // HF may respond with array or object depending on the task
            JsonNode node = objectMapper.readTree(resp.getBody());
            // Common: [{"generated_text":"..."}]
            if (node.isArray() && node.size() > 0) {
                JsonNode first = node.get(0);
                JsonNode gen = first.get("generated_text");
                if (gen != null && gen.isTextual()) return gen.asText();
            }
            // Fallback: {"generated_text":"..."}
            JsonNode gen = node.get("generated_text");
            if (gen != null && gen.isTextual()) return gen.asText();

            return "(Unexpected HF response format)";
        } catch (RestClientException e) {
            throw new IllegalStateException("HF call error: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new IllegalStateException("HF parse error: " + e.getMessage(), e);
        }
    }
}

