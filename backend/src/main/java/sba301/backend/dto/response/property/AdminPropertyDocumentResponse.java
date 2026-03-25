package sba301.backend.dto.response.property;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sba301.backend.enums.DocumentType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPropertyDocumentResponse {
    private Long id;
    private DocumentType documentType;
    private String fileName;
    private String fileUrl;
    private String fileExtension;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}

