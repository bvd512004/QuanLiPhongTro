package sba301.backend.dto.response;

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
public class PropertyDocumentResponse {

    private Long id;
    private String fileName;
    private String fileUrl;
    private String fileExtension;
    private DocumentType documentType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}

