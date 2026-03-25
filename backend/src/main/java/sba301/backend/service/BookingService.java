package sba301.backend.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.backend.dto.response.*;
import sba301.backend.entity.Booking;
import sba301.backend.entity.User;
import sba301.backend.enums.BookingStatus;
import sba301.backend.enums.PaymentStatus;
import sba301.backend.exception.BadRequestException;
import sba301.backend.exception.ResourceNotFoundException;
import sba301.backend.exception.UnauthorizedException;
import sba301.backend.mapper.BookingMapper;
import sba301.backend.repository.BookingRepository;
import sba301.backend.repository.PropertyRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingService {
    BookingRepository bookingRepository;
    UserService userService;
    PropertyRepository propertyRepository;
    BookingMapper bookingMapper;

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return bookingMapper.toResponse(booking);
    }

    public BookingResponse getBookingByCode(String code) {
        Booking booking = bookingRepository.findByBookingCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "code", code));
        return bookingMapper.toResponse(booking);
    }

    public PageResponse<BookingResponse> getGuestBookings(Long guestId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingPage = bookingRepository.findByGuestIdOrderByCreatedAtDesc(guestId, pageable);

        List<BookingResponse> content = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.from(bookingPage, content);
    }

    public PageResponse<BookingResponse> getHostBookings(Long hostId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingPage = bookingRepository.findByHostId(hostId, pageable);

        List<BookingResponse> content = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.from(bookingPage, content);
    }

    public List<BookingResponse> getUpcomingBookings(Long guestId) {
        return bookingRepository.findUpcomingBookings(guestId, LocalDate.now()).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }
    @Transactional
    public BookingResponse confirmBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        User currentUser = userService.getCurrentUser();
        if (!booking.getProperty().getHost().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only the host can confirm this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be confirmed");
        }

        if (booking.getPaymentStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("Payment must be completed before confirmation");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toResponse(savedBooking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        User currentUser = userService.getCurrentUser();
        boolean isGuest = booking.getGuest().getId().equals(currentUser.getId());
        boolean isHost = booking.getProperty().getHost().getId().equals(currentUser.getId());

        if (!isGuest && !isHost) {
            throw new UnauthorizedException("You are not authorized to cancel this booking");
        }

        // Host can reject PENDING bookings or cancel CONFIRMED bookings
        // Guest can only cancel their own bookings (any status except COMPLETED)
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledBy(isGuest ? "USER" : "HOST");

        // If host is cancelling/rejecting, store response
        if (isHost && reason != null) {
            booking.setHostResponse(reason);
        }

        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toResponse(savedBooking);
    }

    public boolean isPropertyAvailable(Long propertyId, LocalDate checkIn, LocalDate checkOut) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(propertyId, checkIn, checkOut);
        return conflicts.isEmpty();
    }

    public List<LocalDate> getBookedDates(Long propertyId) {
        List<Booking> bookings = bookingRepository.findConflictingBookings(
                propertyId,
                LocalDate.now(),
                LocalDate.now().plusYears(1)
        );

        return bookings.stream()
                .flatMap(booking -> {
                    List<LocalDate> dates = new java.util.ArrayList<>();
                    LocalDate date = booking.getCheckInDate();
                    while (!date.isAfter(booking.getCheckOutDate())) {
                        dates.add(date);
                        date = date.plusDays(1);
                    }
                    return dates.stream();
                })
                .distinct()
                .collect(Collectors.toList());
    }

    public BookingStatsResponse getHostBookingStats(Long hostId) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate startOfPreviousMonth = startOfMonth.minusMonths(1);
        LocalDate endOfPreviousMonth = startOfMonth.minusDays(1);

        // Get pending bookings count (paid but not confirmed)
        Long pendingCount = bookingRepository.countByHostIdAndStatusAndPaymentStatus(
                hostId, BookingStatus.PENDING, PaymentStatus.PAID);

        // Get confirmed bookings this month
        Long confirmedThisMonth = bookingRepository.countByHostIdAndStatusAndCreatedAtBetween(
                hostId, BookingStatus.CONFIRMED, startOfMonth.atStartOfDay(), now.atTime(23, 59, 59));

        // Get confirmed bookings previous month
        Long previousMonthConfirmed = bookingRepository.countByHostIdAndStatusAndCreatedAtBetween(
                hostId, BookingStatus.CONFIRMED, startOfPreviousMonth.atStartOfDay(), endOfPreviousMonth.atTime(23, 59, 59));

        // Calculate expected revenue from confirmed bookings
        BigDecimal expectedRevenue = bookingRepository.sumTotalPriceByHostIdAndStatus(hostId, BookingStatus.CONFIRMED);
        if (expectedRevenue == null) expectedRevenue = BigDecimal.ZERO;

        // Calculate upcoming revenue (confirmed bookings with check-in date in future)
        BigDecimal upcomingRevenue = bookingRepository.sumTotalPriceByHostIdAndStatusAndCheckInDateAfter(
                hostId, BookingStatus.CONFIRMED, now);
        if (upcomingRevenue == null) upcomingRevenue = BigDecimal.ZERO;

        return BookingStatsResponse.builder()
                .pendingCount(pendingCount)
                .confirmedThisMonth(confirmedThisMonth)
                .previousMonthConfirmed(previousMonthConfirmed)
                .expectedRevenue(expectedRevenue)
                .upcomingRevenue(upcomingRevenue)
                .build();
    }

    public BookingCalendarResponse getHostBookingCalendar(Long hostId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<Booking> bookings = bookingRepository.findByHostIdAndDateRange(hostId, startDate, endDate);

        List<CalendarBookingResponse> calendarBookings = bookings.stream()
                .flatMap(booking -> {
                    LocalDate checkIn = booking.getCheckInDate();
                    LocalDate checkOut = booking.getCheckOutDate();

                    return checkIn.datesUntil(checkOut)
                            .filter(date -> !date.isBefore(startDate) && !date.isAfter(endDate))
                            .map(date -> {
                                String type = "guest";
                                if (date.equals(checkIn) && booking.getStatus() == BookingStatus.CONFIRMED) {
                                    type = "checked-in";
                                }

                                return CalendarBookingResponse.builder()
                                        .date(date)
                                        .type(type)
                                        .guestName(booking.getGuest().getFirstName() + " " + booking.getGuest().getLastName())
                                        .bookingCode(booking.getBookingCode())
                                        .bookingId(booking.getId())
                                        .status(booking.getStatus().toString())
                                        .build();
                            });
                })
                .collect(Collectors.toList());

        String monthName = startDate.getMonth().toString();

        return BookingCalendarResponse.builder()
                .month(month)
                .year(year)
                .monthName(monthName)
                .bookings(calendarBookings)
                .build();
    }

}