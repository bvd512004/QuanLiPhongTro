package sba301.backend.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import sba301.backend.dto.response.property.AdminPropertyModerationResponse;
import sba301.backend.entity.Property;
import sba301.backend.entity.User;
import sba301.backend.enums.PropertyStatus;
import sba301.backend.exception.BadRequestException;
import sba301.backend.repository.PropertyRepository;

import static sba301.backend.specification.PropertySpecifications.buildModerationSpec;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminPropertyService {

    PropertyRepository propertyRepository;

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

        property.setStatus(PropertyStatus.REJECTED);
        Property saved = propertyRepository.save(property);
        return toModerationDto(saved);
    }

    private Property findPropertyOrThrow(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
    }

    private boolean isPendingOrUnderReviewOrInactive(Property property) {
        PropertyStatus status = property.getStatus();
        return status == PropertyStatus.PENDING
                || status == PropertyStatus.UNDER_REVIEW
                || status == PropertyStatus.INACTIVE;
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
}

