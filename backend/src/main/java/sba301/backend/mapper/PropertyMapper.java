package sba301.backend.mapper;


import org.springframework.stereotype.Component;
import sba301.backend.dto.response.AmenityResponse;
import sba301.backend.dto.response.CategoryResponse;
import sba301.backend.dto.response.PropertyImageResponse;
import sba301.backend.dto.response.PropertyResponse;
import sba301.backend.entity.Amenity;
import sba301.backend.entity.Category;
import sba301.backend.entity.Property;
import sba301.backend.entity.PropertyImage;

import java.util.stream.Collectors;

@Component
public class PropertyMapper {

    private final UserMapper userMapper;

    public PropertyMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public PropertyResponse toResponse(Property property) {
        if (property == null) return null;

        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .propertyType(property.getPropertyType())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .country(property.getCountry())
                .zipCode(property.getZipCode())
                .latitude(property.getLatitude())
                .longitude(property.getLongitude())
                .pricePerNight(property.getPricePerNight())
                .cleaningFee(property.getCleaningFee())
                .serviceFee(property.getServiceFee())
                .maxGuests(property.getMaxGuests())
                .bedrooms(property.getBedrooms())
                .beds(property.getBeds())
                .bathrooms(property.getBathrooms())
                .areaSqft(property.getAreaSqft())
                .minNights(property.getMinNights())
                .maxNights(property.getMaxNights())
                .checkInTime(property.getCheckInTime())
                .checkOutTime(property.getCheckOutTime())
                .houseRules(property.getHouseRules())
                .cancellationPolicy(property.getCancellationPolicy())
                .status(property.getStatus())
                .isInstantBook(property.getIsInstantBook())
                .isFeatured(property.getIsFeatured())
                .averageRating(property.getAverageRating())
                .totalReviews(property.getTotalReviews())
                .viewCount(property.getViewCount())
                .host(userMapper.toResponse(property.getHost()))
                .category(toCategoryResponse(property.getCategory()))
                .images(property.getImages().stream()
                        .map(this::toImageResponse)
                        .collect(Collectors.toList()))
                .amenities(property.getAmenities().stream()
                        .map(this::toAmenityResponse)
                        .collect(Collectors.toSet()))
                .primaryImageUrl(property.getPrimaryImageUrl())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }

    public CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .imageUrl(category.getImageUrl())
                .slug(category.getSlug())
                .displayOrder(category.getDisplayOrder())
                .build();
    }

    public AmenityResponse toAmenityResponse(Amenity amenity) {
        if (amenity == null) return null;

        return AmenityResponse.builder()
                .id(amenity.getId())
                .name(amenity.getName())
                .description(amenity.getDescription())
                .icon(amenity.getIcon())
                .category(amenity.getCategory())
                .build();
    }

    public PropertyImageResponse toImageResponse(PropertyImage image) {
        if (image == null) return null;

        return PropertyImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .caption(image.getCaption())
                .displayOrder(image.getDisplayOrder())
                .isPrimary(image.getIsPrimary())
                .mediaType(image.getMediaType())
                .fileSize(image.getFileSize())
                .duration(image.getDuration())
                .build();
    }
}