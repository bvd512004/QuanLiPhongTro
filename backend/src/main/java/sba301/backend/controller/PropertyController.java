package sba301.backend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.List;
import sba301.backend.constants.ApiPath;
import sba301.backend.dto.request.CreatePropertyRequest;
import sba301.backend.dto.response.ApiResponse;
import sba301.backend.dto.response.PageResponse;
import sba301.backend.dto.response.PropertyResponse;
import sba301.backend.service.CustomUserDetailsService;
import sba301.backend.service.PropertyService;

@RestController
@RequestMapping(ApiPath.PROPERTY)
public class PropertyController {

    @Autowired
    PropertyService propertyService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PropertyResponse>>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<PropertyResponse> properties = propertyService.getAllActiveProperties(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getFeaturedProperties(
            @RequestParam(defaultValue = "8") int limit) {
        List<PropertyResponse> properties = propertyService.getFeaturedProperties(limit);
        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @PostMapping
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<PropertyResponse>> createProperty(
            @Valid @RequestBody CreatePropertyRequest request) {
        PropertyResponse property = propertyService.createProperty(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Property created", property));
    }

    @GetMapping("/host/{hostId}")
    public ResponseEntity<ApiResponse<PageResponse<PropertyResponse>>> getHostProperties(
            @PathVariable Long hostId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PageResponse<PropertyResponse> properties = propertyService.getHostProperties(hostId, page, size);
        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @GetMapping("/my-properties")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<PageResponse<PropertyResponse>>> getMyProperties(
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PageResponse<PropertyResponse> properties = propertyService.getHostProperties(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @GetMapping("/my-properties/{id}")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<PropertyResponse>> getMyPropertyById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser) {
        PropertyResponse property = propertyService.getHostPropertyById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(property));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<PropertyResponse>> updateProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser,
            @Valid @RequestBody CreatePropertyRequest request) {
        PropertyResponse property = propertyService.updateProperty(currentUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Property updated", property));
    }
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<PropertyResponse>> updatePropertyStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> request,
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser) {
        String status = request.get("status");
        PropertyResponse property = propertyService.updatePropertyStatus(id, status, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Property status updated", property));
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.ok(ApiResponse.success("Property deleted", null));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> getPropertyById(@PathVariable Long id) {
        PropertyResponse property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(ApiResponse.success(property));
    }

}
