package sba301.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import sba301.backend.dto.response.ApiResponse;
import sba301.backend.dto.response.DashboardStatsResponse;
import sba301.backend.dto.response.MonthlyRevenueResponse;
import sba301.backend.service.CustomUserDetailsService;
import sba301.backend.service.DashboardService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;


    @GetMapping("/stats")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser) {
        DashboardStatsResponse stats = dashboardService.getHostDashboardStats(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/monthly-revenue")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<List<MonthlyRevenueResponse>>> getMonthlyRevenue(
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser,
            @RequestParam(required = false) Integer year) {
        List<MonthlyRevenueResponse> monthlyRevenue = dashboardService.getHostMonthlyRevenue(currentUser.getId(), year);
        return ResponseEntity.ok(ApiResponse.success(monthlyRevenue));
    }
}

