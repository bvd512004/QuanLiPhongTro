package sba301.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostReviewReplyRequest {

    @NotBlank(message = "Host response is required")
    @Size(max = 2000, message = "Host response must not exceed 2000 characters")
    private String hostResponse;
}

