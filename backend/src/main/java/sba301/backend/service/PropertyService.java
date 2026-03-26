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
import org.springframework.security.access.AccessDeniedException;
import sba301.backend.dto.request.CreatePropertyRequest;
import sba301.backend.dto.request.PropertyDocumentRequest;
import sba301.backend.dto.request.PropertyImageRequest;
import sba301.backend.dto.response.PageResponse;
import sba301.backend.dto.response.PropertyResponse;
import sba301.backend.entity.*;
import sba301.backend.enums.PropertyStatus;
import sba301.backend.exception.ResourceNotFoundException;
import sba301.backend.exception.UnauthorizedException;
import sba301.backend.mapper.PropertyMapper;
import sba301.backend.repository.AmenityRepository;
import sba301.backend.repository.CategoryRepository;
import sba301.backend.repository.PropertyRepository;
import sba301.backend.exception.ResourceNotFoundException;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PropertyService {
    PropertyRepository propertyRepository;
    PropertyMapper propertyMapper;
    UserService userService;
    CategoryRepository categoryRepository;
    AmenityRepository amenityRepository;

    public PageResponse<PropertyResponse> getAllActiveProperties(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Property> propertyPage = propertyRepository.findByStatusAndIsDeletedFalse(PropertyStatus.ACTIVE, pageable);

        List<PropertyResponse> content = propertyPage.getContent().stream()
                .map(propertyMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.from(propertyPage, content);
    }

    public List<PropertyResponse> getFeaturedProperties(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return propertyRepository.findFeaturedProperties(pageable).stream()
                .map(propertyMapper::toResponse)
                .collect(Collectors.toList());
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
                .status(PropertyStatus.INACTIVE)
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
        if (request.getDocuments() != null && !request.getDocuments().isEmpty()) {
            request.getDocuments().forEach(docReq -> {
                PropertyDocument document = PropertyDocument.builder()
                        .fileName(docReq.getFileName())
                        .fileUrl(docReq.getFileUrl())
                        .fileExtension(docReq.getFileExtension())
                        .documentType(docReq.getDocumentType())
                        .fileSize(docReq.getFileSize())
                        .property(savedProperty)
                        .build();
                savedProperty.getDocuments().add(document);
            });
            propertyRepository.save(savedProperty);
        }

        return propertyMapper.toResponse(savedProperty);
    }

    public PropertyResponse getHostPropertyById(Long hostId, Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", propertyId));

        if (Boolean.TRUE.equals(property.getIsDeleted())) {
            throw new ResourceNotFoundException("Property", "id", propertyId);
        }

        if (!property.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("You do not have permission to access this property");
        }

        return propertyMapper.toResponse(property);
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

        PropertyStatus currentStatus = property.getStatus();
        boolean validTransition =
                (currentStatus == PropertyStatus.ACTIVE && newStatus == PropertyStatus.INACTIVE) ||
                (currentStatus == PropertyStatus.REJECTED && newStatus == PropertyStatus.INACTIVE);

        if (!validTransition) {
            throw new IllegalArgumentException(
                    "Invalid host transition from " + currentStatus + " to " + newStatus
            );
        }

        property.setStatus(newStatus);
        if (newStatus == PropertyStatus.INACTIVE) {
            // Old rejection message should not persist once host resubmits for review.
            property.setReason(null);
        }
        Property updated = propertyRepository.save(property);

        return propertyMapper.toResponse(updated);
    }

    @Transactional
    public PropertyResponse updateProperty(Long hostId, Long propertyId, CreatePropertyRequest request) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", propertyId));

        if (Boolean.TRUE.equals(property.getIsDeleted())) {
            throw new ResourceNotFoundException("Property", "id", propertyId);
        }

        if (!property.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("You do not have permission to update this property");
        }

        if (property.getStatus() == PropertyStatus.ACTIVE) {
            throw new IllegalArgumentException("Active properties cannot be edited");
        }

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPropertyType(request.getPropertyType());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setCountry(request.getCountry());
        property.setZipCode(request.getZipCode());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());
        property.setPricePerNight(request.getPricePerNight());
        property.setCleaningFee(request.getCleaningFee());
        property.setServiceFee(request.getServiceFee());
        property.setMaxGuests(request.getMaxGuests());
        property.setBedrooms(request.getBedrooms());
        property.setBeds(request.getBeds());
        property.setBathrooms(request.getBathrooms());
        property.setAreaSqft(request.getAreaSqft());
        property.setMinNights(request.getMinNights());
        property.setMaxNights(request.getMaxNights());
        property.setCheckInTime(request.getCheckInTime());
        property.setCheckOutTime(request.getCheckOutTime());
        property.setHouseRules(request.getHouseRules());
        property.setCancellationPolicy(request.getCancellationPolicy());
        property.setIsInstantBook(request.getIsInstantBook());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            property.setCategory(category);
        } else {
            property.setCategory(null);
        }

        if (request.getAmenityIds() != null) {
            if (request.getAmenityIds().isEmpty()) {
                property.setAmenities(new HashSet<>());
            } else {
                List<Amenity> amenities = amenityRepository.findByIdIn(request.getAmenityIds().stream().toList());
                property.setAmenities(new HashSet<>(amenities));
            }
        }

        if (request.getImages() != null) {
            property.getImages().clear();
            for (PropertyImageRequest imageReq : request.getImages()) {
                PropertyImage image = PropertyImage.builder()
                        .imageUrl(imageReq.getImageUrl())
                        .caption(imageReq.getCaption())
                        .displayOrder(imageReq.getDisplayOrder())
                        .isPrimary(imageReq.getIsPrimary())
                        .mediaType(imageReq.getMediaType() != null ? imageReq.getMediaType() : "IMAGE")
                        .fileSize(imageReq.getFileSize())
                        .duration(imageReq.getDuration())
                        .build();
                property.addImage(image);
            }
        }

        if (request.getDocuments() != null) {
            property.getDocuments().clear();
            for (PropertyDocumentRequest docReq : request.getDocuments()) {
                PropertyDocument document = PropertyDocument.builder()
                        .fileName(docReq.getFileName())
                        .fileUrl(docReq.getFileUrl())
                        .fileExtension(docReq.getFileExtension())
                        .documentType(docReq.getDocumentType())
                        .fileSize(docReq.getFileSize())
                        .build();
                property.addDocument(document);
            }
        }

        Property savedProperty = propertyRepository.save(property);
        return propertyMapper.toResponse(savedProperty);
    }


    @Transactional
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));
        propertyRepository.incrementViewCount(id);
        return propertyMapper.toResponse(property);
    }

}