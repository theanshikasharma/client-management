package backend.task.manager.controller;

import backend.task.manager.dto.ChatRequestDTO;
import backend.task.manager.dto.ChatResponseDTO;
import backend.task.manager.service.HuggingFaceChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final HuggingFaceChatService huggingFaceChatService;

    @CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
    @PostMapping("/chat")
    public ResponseEntity<ChatResponseDTO> chat(@Valid @RequestBody ChatRequestDTO request) {
        String reply = huggingFaceChatService.chat(request);
        return new ResponseEntity<>(ChatResponseDTO.builder().reply(reply).build(), HttpStatus.OK);
    }
}

