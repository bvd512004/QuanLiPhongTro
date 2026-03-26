package sba301.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import sba301.backend.dto.response.BookingResponse;
import sba301.backend.entity.Booking;

@Mapper(
        componentModel = "spring",
        uses = {UserMapper.class, PropertyMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface BookingMapper {

    BookingResponse toResponse(Booking booking);
}

