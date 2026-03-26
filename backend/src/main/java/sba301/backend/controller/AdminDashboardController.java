package sba301.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sba301.backend.constants.ApiPath;
import sba301.backend.dto.response.AdminDashboardStatsResponse;
import sba301.backend.dto.response.ApiResponse;
import sba301.backend.service.AdminDashboardService;

@RestController
@RequestMapping(ApiPath.ADMIN_DASHBOARD)
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminDashboardController {

    AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getStats() {
        AdminDashboardStatsResponse stats = adminDashboardService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

