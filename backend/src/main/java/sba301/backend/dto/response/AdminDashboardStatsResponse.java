package sba301.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long bannedUsers;

    private long totalProperties;
    private long activeProperties;
    private long inactiveProperties;
    private long underReviewProperties;
    private long rejectedProperties;
}

