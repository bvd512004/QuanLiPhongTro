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
import sba301.backend.dto.response.ApiResponse;
import sba301.backend.dto.response.PageResponse;
import sba301.backend.dto.response.UserResponse;
import sba301.backend.service.AdminUserService;

@RestController
@RequestMapping(ApiPath.ADMIN_USER)
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminUserController {

    AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Sort sortObj = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<UserResponse> resultPage = adminUserService.getUsers(keyword, isActive, pageable);
        PageResponse<UserResponse> pageResponse = PageResponse.from(resultPage);

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @PatchMapping("/{id}/ban")
    public ResponseEntity<ApiResponse<UserResponse>> banUser(@PathVariable Long id) {
        UserResponse dto = adminUserService.banUser(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PatchMapping("/{id}/unban")
    public ResponseEntity<ApiResponse<UserResponse>> unbanUser(@PathVariable Long id) {
        UserResponse dto = adminUserService.unbanUser(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    private Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        String[] parts = sortParam.split(",");
        String property = parts[0].trim();
        if (property.isEmpty()) property = "createdAt";

        Sort.Direction direction = Sort.Direction.DESC;
        if (parts.length > 1) {
            String dir = parts[1].trim();
            if ("asc".equalsIgnoreCase(dir)) direction = Sort.Direction.ASC;
        }
        return Sort.by(direction, property);
    }
}

