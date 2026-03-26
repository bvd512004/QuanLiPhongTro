package sba301.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sba301.backend.enums.DocumentType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDocumentRequest {

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File URL is required")
    @Size(max = 1000, message = "File URL must not exceed 1000 characters")
    private String fileUrl;

    @Size(max = 10, message = "File extension must not exceed 10 characters")
    private String fileExtension;

    @NotNull(message = "Document type is required")
    private DocumentType documentType;

    @Positive(message = "File size must be greater than 0")
    private Long fileSize;
}
