package b.task.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequestDTO {

    /** User message */
    private String message;

    /** Optional conversation context */
    private List<Map<String, String>> history;

    /** Optional generation options */
    private Integer maxNewTokens;
}

