package sba301.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Map;

import sba301.backend.constants.ApiPath;
import sba301.backend.dto.response.ApiResponse;
import sba301.backend.dto.response.PageResponse;
import sba301.backend.dto.response.PropertyResponse;
import sba301.backend.service.PropertyService;

import java.util.List;

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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> getPropertyById(@PathVariable Long id) {
        PropertyResponse property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(ApiResponse.success(property));
    }

}
