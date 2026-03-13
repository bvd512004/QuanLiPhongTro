package sba301.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    // Doanh thu tháng này (confirmed bookings in current month)
    private BigDecimal monthlyRevenue;
    private Double monthlyRevenueChangePercent; // % thay đổi so với tháng trước

    // Tổng lượt khách (total guests from confirmed/completed bookings)
    private Long totalGuests;
    private Double totalGuestsChangePercent; // % thay đổi so với tháng trước

    // Lượt xem trang (total views of all properties)
    private Long totalViews;
    private Double totalViewsChangePercent; // % thay đổi so với tháng trước

    // Đánh giá trung bình
    private Double averageRating;
    private Long totalReviews;
}

