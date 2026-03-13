package sba301.backend.mapper;

import org.mapstruct.Mapper;
import sba301.backend.dto.response.PropertyResponse;
import sba301.backend.entity.Property;

@Mapper(componentModel = "spring")
public interface PropertyMapper {

    PropertyResponse toResponse(Property property);
}
