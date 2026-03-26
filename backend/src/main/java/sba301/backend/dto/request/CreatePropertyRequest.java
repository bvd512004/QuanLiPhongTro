package sba301.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sba301.backend.enums.PropertyType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePropertyRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    private String zipCode;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // Short-term rental pricing (validated conditionally based on rentalType)
    private BigDecimal pricePerNight;

    @DecimalMin(value = "0")
    private BigDecimal cleaningFee;

    @DecimalMin(value = "0")
    private BigDecimal serviceFee;

    @NotNull(message = "Max guests is required")
    @Min(value = 1)
    private Integer maxGuests;

    @Min(value = 0)
    private Integer bedrooms;

    @Min(value = 0)
    private Integer beds;

    @Min(value = 0)
    private Integer bathrooms;

    private Integer areaSqft;

    // Short-term rental settings
    @Min(value = 1)
    private Integer minNights = 1;

    private Integer maxNights = 365;

    private String checkInTime;

    private String checkOutTime;

    private String houseRules;

    private String cancellationPolicy;

    private Boolean isInstantBook = false;

    private Long categoryId;

    private Set<Long> amenityIds;

    @Valid
    private List<PropertyImageRequest> images;

    @Valid
    private List<PropertyDocumentRequest> documents;
}
