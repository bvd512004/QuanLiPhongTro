package sba301.backend.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.backend.dto.response.CategoryResponse;
import sba301.backend.dto.response.PropertyImageResponse;
import sba301.backend.dto.response.property.AdminHostSummaryResponse;
import sba301.backend.dto.response.property.AdminPropertyDetailResponse;
import sba301.backend.dto.response.property.AdminPropertyDocumentResponse;
import sba301.backend.dto.response.property.AdminPropertyModerationResponse;
import sba301.backend.entity.PropertyDocument;
import sba301.backend.entity.PropertyImage;
import sba301.backend.entity.Property;
import sba301.backend.entity.User;
import sba301.backend.enums.PropertyStatus;
import sba301.backend.exception.BadRequestException;
import sba301.backend.mapper.PropertyMapper;
import sba301.backend.repository.PropertyRepository;

import java.util.stream.Collectors;

import static sba301.backend.specification.PropertySpecifications.buildModerationSpec;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminPropertyService {

    PropertyRepository propertyRepository;
    PropertyMapper propertyMapper;

    public Page<AdminPropertyModerationResponse> getPropertiesForModeration(PropertyStatus status,
                                                                            String keyword,
                                                                            Pageable pageable) {
        PropertyStatus effectiveStatus = status != null ? status : PropertyStatus.INACTIVE;

        return propertyRepository.findAll(buildModerationSpec(effectiveStatus, keyword), pageable)
                .map(this::toModerationDto);
    }

    public AdminPropertyModerationResponse approveProperty(Long id) {
        Property property = findPropertyOrThrow(id);

        if (!isPendingOrUnderReviewOrInactive(property)) {
            throw new BadRequestException("Property status " + property.getStatus() + " cannot be approved");
        }

        property.setStatus(PropertyStatus.ACTIVE);
        Property saved = propertyRepository.save(property);
        return toModerationDto(saved);
    }

    public AdminPropertyModerationResponse rejectProperty(Long id, String reason) {
        Property property = findPropertyOrThrow(id);

        if (!isPendingOrUnderReviewOrInactive(property)) {
            throw new BadRequestException("Property status " + property.getStatus() + " cannot be rejected");
        }

        log.info("Property {} rejected by admin. Reason: {}", id, reason);

        property.setReason(reason);
        property.setStatus(PropertyStatus.REJECTED);
        Property saved = propertyRepository.save(property);
        return toModerationDto(saved);
    }

    @Transactional(readOnly = true)
    public AdminPropertyDetailResponse getPropertyDetail(Long id) {
        Property property = propertyRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));

        return AdminPropertyDetailResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .propertyType(property.getPropertyType())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .country(property.getCountry())
                .zipCode(property.getZipCode())
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
                .primaryImageUrl(property.getPrimaryImageUrl())
                .images(property.getImages() == null ? null : property.getImages().stream().map(this::toImageResponse).collect(Collectors.toList()))
                .documents(property.getDocuments() == null ? null : property.getDocuments().stream()
                        .map(this::toDocumentResponse)
                        .collect(Collectors.toList()))
                .category(toCategoryResponse(property))
                .amenities(property.getAmenities() == null ? null : property.getAmenities().stream()
                        .map(propertyMapper::toAmenityResponse)
                        .collect(Collectors.toSet()))
                .host(toHostSummary(property.getHost()))
                .reason(property.getReason())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }

    private Property findPropertyOrThrow(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
    }

    private boolean isPendingOrUnderReviewOrInactive(Property property) {
        PropertyStatus status = property.getStatus();
        return status == PropertyStatus.INACTIVE;
    }

    private AdminPropertyModerationResponse toModerationDto(Property property) {
        User host = property.getHost();

        String hostEmail = host != null ? host.getEmail() : null;
        String hostFullName = host != null ? host.getFullName() : null;

        return AdminPropertyModerationResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .address(property.getAddress())
                .city(property.getCity())
                .pricePerNight(property.getPricePerNight())
                .status(property.getStatus() != null ? property.getStatus().name() : null)
                .hostEmail(hostEmail)
                .hostFullName(hostFullName)
                .createdAt(property.getCreatedAt())
                .build();
    }

    private PropertyImageResponse toImageResponse(PropertyImage image) {
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

    private AdminPropertyDocumentResponse toDocumentResponse(PropertyDocument doc) {
        if (doc == null) return null;
        return AdminPropertyDocumentResponse.builder()
                .id(doc.getId())
                .documentType(doc.getDocumentType())
                .fileName(doc.getFileName())
                .fileUrl(doc.getFileUrl())
                .fileExtension(doc.getFileExtension())
                .fileSize(doc.getFileSize())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }

    private AdminHostSummaryResponse toHostSummary(User host) {
        if (host == null) return null;
        return AdminHostSummaryResponse.builder()
                .id(host.getId())
                .email(host.getEmail())
                .fullName(host.getFullName())
                .phone(host.getPhone())
                .isVerified(host.getIsVerified())
                .isHost(host.getIsHost())
                .isActive(host.getIsActive())
                .createdAt(host.getCreatedAt())
                .build();
    }

    private CategoryResponse toCategoryResponse(Property property) {
        if (property == null) return null;
        return propertyMapper.toCategoryResponse(property.getCategory());
    }
}

