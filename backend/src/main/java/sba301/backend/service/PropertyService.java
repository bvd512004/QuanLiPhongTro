package sba301.backend.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.backend.dto.request.CreatePropertyRequest;
import sba301.backend.dto.response.PageResponse;
import sba301.backend.dto.response.PropertyResponse;
import sba301.backend.entity.*;
import sba301.backend.enums.PropertyStatus;
import sba301.backend.exception.ResourceNotFoundException;
import sba301.backend.exception.UnauthorizedException;
import sba301.backend.mapper.PropertyMapper;
import sba301.backend.repository.AmenityRepository;
import sba301.backend.repository.BookingRepository;
import sba301.backend.repository.CategoryRepository;
import sba301.backend.repository.PropertyRepository;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PropertyService {
    PropertyRepository propertyRepository;
    CategoryRepository categoryRepository;
    AmenityRepository amenityRepository;
    UserService userService;
    PropertyMapper propertyMapper;
    BookingRepository bookingRepository;

    @Transactional
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));

        propertyRepository.incrementViewCount(id);
        return propertyMapper.toResponse(property);
    }

    public PageResponse<PropertyResponse> getHostProperties(Long hostId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Property> propertyPage = propertyRepository.findByHostIdAndIsDeletedFalse(hostId, pageable);

        List<PropertyResponse> content = propertyPage.getContent().stream()
                .map(propertyMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.from(propertyPage, content);
    }

    @Transactional
    public PropertyResponse createProperty(CreatePropertyRequest request) {
        User currentUser = userService.getCurrentUser();

        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .propertyType(request.getPropertyType())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .zipCode(request.getZipCode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .pricePerNight(request.getPricePerNight())
                .cleaningFee(request.getCleaningFee())
                .serviceFee(request.getServiceFee())
                .maxGuests(request.getMaxGuests())
                .bedrooms(request.getBedrooms())
                .beds(request.getBeds())
                .bathrooms(request.getBathrooms())
                .areaSqft(request.getAreaSqft())
                .minNights(request.getMinNights())
                .maxNights(request.getMaxNights())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .houseRules(request.getHouseRules())
                .cancellationPolicy(request.getCancellationPolicy())
                .isInstantBook(request.getIsInstantBook())
                .status(PropertyStatus.PENDING)
                .host(currentUser)
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            property.setCategory(category);
        }

        if (request.getAmenityIds() != null && !request.getAmenityIds().isEmpty()) {
            List<Amenity> amenities = amenityRepository.findByIdIn(request.getAmenityIds().stream().toList());
            property.setAmenities(new HashSet<>(amenities));
        }

        Property savedProperty = propertyRepository.save(property);

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            request.getImages().forEach(imageReq -> {
                PropertyImage image = PropertyImage.builder()
                        .imageUrl(imageReq.getImageUrl())
                        .caption(imageReq.getCaption())
                        .displayOrder(imageReq.getDisplayOrder())
                        .isPrimary(imageReq.getIsPrimary())
                        .mediaType(imageReq.getMediaType() != null ? imageReq.getMediaType() : "IMAGE")
                        .fileSize(imageReq.getFileSize())
                        .duration(imageReq.getDuration())
                        .build();
                savedProperty.addImage(image);
            });
            propertyRepository.save(savedProperty);
        }

        return propertyMapper.toResponse(savedProperty);
    }

    @Transactional
    public void deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));

        User currentUser = userService.getCurrentUser();
        if (!property.getHost().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this property");
        }

        property.setIsDeleted(true);
        propertyRepository.save(property);
    }

    @Transactional
    public PropertyResponse updatePropertyStatus(Long id, String statusStr, Long hostId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));

        // Verify ownership
        if (!property.getHost().getId().equals(hostId)) {
            throw new UnauthorizedException("You are not authorized to update this property");
        }

        // Parse and update status
        PropertyStatus newStatus;
        try {
            newStatus = PropertyStatus.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + statusStr);
        }

        property.setStatus(newStatus);
        Property updated = propertyRepository.save(property);

        return propertyMapper.toResponse(updated);
    }
}