package backend.user.service.service;

import backend.user.service.dto.*;

public interface UserService {
    AuthResponseDTO register(RegisterRequestDTO dto);
    AuthResponseDTO login(LoginRequestDTO dto);
}
