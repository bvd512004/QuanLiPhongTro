package sba301.backend.dto.response.property;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminHostSummaryResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Boolean isVerified;
    private Boolean isHost;
    private Boolean isActive;
    private LocalDateTime createdAt;
}

