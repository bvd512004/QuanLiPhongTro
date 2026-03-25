package sba301.backend.dto.response.property;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sba301.backend.dto.response.AmenityResponse;
import sba301.backend.dto.response.CategoryResponse;
import sba301.backend.dto.response.PropertyImageResponse;
import sba301.backend.enums.PropertyStatus;
import sba301.backend.enums.PropertyType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPropertyDetailResponse {
    private Long id;

    private String title;
    private String description;
    private PropertyType propertyType;
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;

    private BigDecimal pricePerNight;
    private BigDecimal cleaningFee;
    private BigDecimal serviceFee;

    private Integer maxGuests;
    private Integer bedrooms;
    private Integer beds;
    private Integer bathrooms;
    private Integer areaSqft;

    private Integer minNights;
    private Integer maxNights;
    private String checkInTime;
    private String checkOutTime;
    private String houseRules;
    private String cancellationPolicy;

    private PropertyStatus status;
    private Boolean isInstantBook;
    private Boolean isFeatured;

    private String primaryImageUrl;
    private List<PropertyImageResponse> images;
    private List<AdminPropertyDocumentResponse> documents;

    private CategoryResponse category;
    private Set<AmenityResponse> amenities;
    private AdminHostSummaryResponse host;

    private String reason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

