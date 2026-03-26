package sba301.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sba301.backend.constants.ApiPath;
import sba301.backend.dto.response.AmenityResponse;
import sba301.backend.dto.response.ApiResponse;
import sba301.backend.enums.AmenityCategory;
import sba301.backend.mapper.PropertyMapper;
import sba301.backend.repository.AmenityRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(ApiPath.AMENITY)
@RequiredArgsConstructor
@Slf4j
public class AmenityController {
    private final AmenityRepository amenityRepository;
    private final PropertyMapper propertyMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AmenityResponse>>> getAllAmenities() {
        List<AmenityResponse> amenities = amenityRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(propertyMapper::toAmenityResponse)
                .collect(Collectors.toList());
        log.info("Get all amenities"+amenities);
        return ResponseEntity.ok(ApiResponse.success(amenities));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<AmenityResponse>>> getAmenitiesByCategory(
            @PathVariable AmenityCategory category) {
        List<AmenityResponse> amenities = amenityRepository.findByCategoryAndIsActiveTrueOrderByNameAsc(category)
                .stream()
                .map(propertyMapper::toAmenityResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(amenities));
    }
}
