package sba301.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "property_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyImage extends BaseEntity {
    
    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;
    
    @Column(name = "caption")
    private String caption;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    // Media type: IMAGE, VIDEO, VIDEO_360
    @Column(name = "media_type", length = 20)
    private String mediaType = "IMAGE";

    // File size in bytes
    @Column(name = "file_size")
    private Long fileSize;

    // Duration in seconds (for videos)
    @Column(name = "duration")
    private Integer duration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
}

