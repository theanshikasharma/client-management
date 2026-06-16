package b.task.manager.controller;

import b.task.manager.dto.ChatRequestDTO;
import b.task.manager.dto.ChatResponseDTO;
import b.task.manager.service.HuggingFaceChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final HuggingFaceChatService huggingFaceChatService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody ChatRequestDTO request) {
        String reply = huggingFaceChatService.chat(request);
        return new ResponseEntity<>(ChatResponseDTO.builder().reply(reply).build(), HttpStatus.OK);
    }
}

