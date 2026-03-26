package sba301.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostReviewResponse {
    private Long id;
    private BigDecimal overallRating;
    private String comment;
    private String hostResponse;
    private LocalDateTime createdAt;

    private Long propertyId;
    private String propertyTitle;

    private Long guestId;
    private String guestFirstName;
    private String guestLastName;
    private String guestAvatarUrl;
}

