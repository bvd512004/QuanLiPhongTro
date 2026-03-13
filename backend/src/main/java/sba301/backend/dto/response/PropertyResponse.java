package sba301.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sba301.backend.enums.PropertyStatus;
import sba301.backend.enums.PropertyType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PropertyResponse {
    private Long id;
    private String title;
    private String description;
    private PropertyType propertyType;
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private BigDecimal latitude;
    private BigDecimal longitude;


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
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Long viewCount;
    private String primaryImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
