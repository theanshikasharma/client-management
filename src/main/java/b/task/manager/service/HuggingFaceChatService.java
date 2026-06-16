package b.task.manager.service;

import b.task.manager.dto.ChatRequestDTO;

public interface HuggingFaceChatService {
    String chat(ChatRequestDTO request);
}

