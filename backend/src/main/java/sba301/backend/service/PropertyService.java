package sba301.backend.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.backend.dto.response.PageResponse;
import sba301.backend.dto.response.PropertyResponse;
import sba301.backend.entity.Property;
import sba301.backend.enums.PropertyStatus;
import sba301.backend.mapper.PropertyMapper;
import sba301.backend.repository.PropertyRepository;
import sba301.backend.exception.ResourceNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PropertyService {
    @Autowired
    PropertyRepository propertyRepository;

    @Autowired
    PropertyMapper propertyMapper;


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

    @Transactional
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));
        propertyRepository.incrementViewCount(id);
        return propertyMapper.toResponse(property);
    }

}