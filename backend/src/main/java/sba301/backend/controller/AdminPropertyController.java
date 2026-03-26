package sba301.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.backend.constants.ApiPath;
import sba301.backend.dto.request.property.AdminPropertyRejectRequest;
import sba301.backend.dto.response.ApiResponse;
import sba301.backend.dto.response.PageResponse;
import sba301.backend.dto.response.property.AdminPropertyDetailResponse;
import sba301.backend.dto.response.property.AdminPropertyModerationResponse;
import sba301.backend.enums.PropertyStatus;
import sba301.backend.service.AdminPropertyService;

import java.time.LocalDateTime;

@RestController
@RequestMapping(ApiPath.ADMIN_PROPERTY)
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminPropertyController {

    AdminPropertyService adminPropertyService;

    @GetMapping("/moderation")
    public ResponseEntity<ApiResponse<PageResponse<AdminPropertyModerationResponse>>> getPropertiesForModeration(
            @RequestParam(name = "status", required = false) PropertyStatus status,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "sort", defaultValue = "createdAt,desc") String sortParam
    ) {
        Sort sort = parseSort(sortParam);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<AdminPropertyModerationResponse> resultPage =
                adminPropertyService.getPropertiesForModeration(status, keyword, pageable);

        PageResponse<AdminPropertyModerationResponse> pageResponse = PageResponse.from(resultPage);

        ApiResponse<PageResponse<AdminPropertyModerationResponse>> response = ApiResponse.<PageResponse<AdminPropertyModerationResponse>>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .data(pageResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AdminPropertyModerationResponse>> approveProperty(@PathVariable Long id) {
        AdminPropertyModerationResponse dto = adminPropertyService.approveProperty(id);

        ApiResponse<AdminPropertyModerationResponse> response = ApiResponse.<AdminPropertyModerationResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .data(dto)
                .build();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AdminPropertyModerationResponse>> rejectProperty(
            @PathVariable Long id,
            @RequestBody(required = false) AdminPropertyRejectRequest request
    ) {
        String reason = request != null ? request.getReason() : null;

        AdminPropertyModerationResponse dto = adminPropertyService.rejectProperty(id, reason);

        ApiResponse<AdminPropertyModerationResponse> response = ApiResponse.<AdminPropertyModerationResponse>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .data(dto)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminPropertyDetailResponse>> getPropertyDetail(@PathVariable Long id) {
        AdminPropertyDetailResponse dto = adminPropertyService.getPropertyDetail(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    private Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String[] parts = sortParam.split(",");
        String property = parts[0].trim();
        if (property.isEmpty()) {
            property = "createdAt";
        }

        Sort.Direction direction = Sort.Direction.DESC;
        if (parts.length > 1) {
            String dir = parts[1].trim();
            if ("asc".equalsIgnoreCase(dir)) {
                direction = Sort.Direction.ASC;
            } else if ("desc".equalsIgnoreCase(dir)) {
                direction = Sort.Direction.DESC;
            }
        }

        return Sort.by(direction, property);
    }
}

