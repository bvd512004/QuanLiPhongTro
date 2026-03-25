package sba301.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sba301.backend.enums.AmenityCategory;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmenityResponse {
    
    private Long id;
    private String name;
    private String description;
    private String icon;
    private AmenityCategory category;
}

