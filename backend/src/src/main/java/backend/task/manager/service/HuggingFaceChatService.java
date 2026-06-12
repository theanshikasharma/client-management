package backend.task.manager.service;

import backend.task.manager.dto.ChatRequestDTO;

public interface HuggingFaceChatService {
    String chat(ChatRequestDTO request);
}

