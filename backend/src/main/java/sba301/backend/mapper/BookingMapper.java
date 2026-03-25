package sba301.backend.mapper;

import org.springframework.stereotype.Component;
import sba301.backend.dto.response.BookingResponse;
import sba301.backend.entity.Booking;

@Component
public class BookingMapper {

    private final UserMapper userMapper;
    private final PropertyMapper propertyMapper;

    public BookingMapper(UserMapper userMapper, PropertyMapper propertyMapper) {
        this.userMapper = userMapper;
        this.propertyMapper = propertyMapper;
    }

    public BookingResponse toResponse(Booking booking) {
        if (booking == null) return null;

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .numGuests(booking.getNumGuests())
                .numAdults(booking.getNumAdults())
                .numChildren(booking.getNumChildren())
                .numInfants(booking.getNumInfants())
                .pricePerNight(booking.getPricePerNight())
                .numNights(booking.getNumNights())
                .subtotal(booking.getSubtotal())
                .cleaningFee(booking.getCleaningFee())
                .serviceFee(booking.getServiceFee())
                .taxAmount(booking.getTaxAmount())
                .discountAmount(booking.getDiscountAmount())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .paymentMethod(booking.getPaymentMethod())
                .specialRequests(booking.getSpecialRequests())
                .guestMessage(booking.getGuestMessage())
                .hostResponse(booking.getHostResponse())
                .guest(userMapper.toResponse(booking.getGuest()))
                .property(propertyMapper.toResponse(booking.getProperty()))
                .createdAt(booking.getCreatedAt())
                .build();
    }
}

