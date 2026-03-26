package sba301.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import sba301.backend.enums.DocumentType;

import java.time.LocalDateTime;

@Entity
@Table(name = "property_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "file_name", nullable = false)
    private String fileName; // Tên file gốc (VD: so-do-nha-mat-pho.pdf)

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl; // Đường dẫn lưu trên S3 hoặc local

    @Column(name = "file_extension", length = 10)
    private String fileExtension; // Đuôi file (pdf, jpg, png)

    // Lưu Enum dưới dạng String (VD: "LAND_CERTIFICATE") thay vì số (0, 1) để dễ đọc trong DB
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @Column(name = "file_size")
    private Long fileSize; // Dung lượng file (bytes) - Rất hữu ích để quản lý storage

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt; // Tự động lấy giờ hệ thống khi upload

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
}
