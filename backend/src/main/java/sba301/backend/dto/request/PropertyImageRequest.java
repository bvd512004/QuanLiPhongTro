package sba301.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyImageRequest {
    
    @NotBlank(message = "Image URL is required")
    private String imageUrl;
    
    private String caption;

    @NotNull(message = "Display order is required")
    private Integer displayOrder;

    @NotNull(message = "isPrimary flag is required")
    private Boolean isPrimary;

    // Media type: IMAGE, VIDEO, VIDEO_360
    private String mediaType = "IMAGE";

    // File size in bytes
    private Long fileSize;

    // Duration in seconds (for videos)
    private Integer duration;
}
