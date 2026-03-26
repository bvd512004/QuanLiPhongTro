package sba301.backend.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import sba301.backend.dto.response.AmenityResponse;
import sba301.backend.dto.response.CategoryResponse;
import sba301.backend.dto.response.PropertyDocumentResponse;
import sba301.backend.dto.response.PropertyImageResponse;
import sba301.backend.dto.response.PropertyResponse;
import sba301.backend.entity.Amenity;
import sba301.backend.entity.Category;
import sba301.backend.entity.Property;
import sba301.backend.entity.PropertyDocument;
import sba301.backend.entity.PropertyImage;

@Mapper(componentModel = "spring", uses = UserMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PropertyMapper {

    PropertyResponse toResponse(Property property);

    @Mapping(target = "propertyCount", ignore = true)
    CategoryResponse toCategoryResponse(Category category);

    AmenityResponse toAmenityResponse(Amenity amenity);

    PropertyImageResponse toImageResponse(PropertyImage image);

    PropertyDocumentResponse toDocumentResponse(PropertyDocument document);
}