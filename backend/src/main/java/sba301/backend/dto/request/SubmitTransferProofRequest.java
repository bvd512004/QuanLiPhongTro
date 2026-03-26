package sba301.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitTransferProofRequest {

    // Tuỳ chọn: frontend cho phép để trống
    private String transferReference;

    @NotBlank(message = "Transfer proof image URL is required")
    private String transferProofImageUrl;
}

