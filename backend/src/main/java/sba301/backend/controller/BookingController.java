package sba301.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sba301.backend.constants.ApiPath;
import sba301.backend.dto.response.*;
import sba301.backend.service.BookingService;
import sba301.backend.service.CustomUserDetailsService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(ApiPath.BOOKING)
@RequiredArgsConstructor
@Slf4j
public class BookingController {
    private final BookingService bookingService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByCode(@PathVariable String code) {
        BookingResponse booking = bookingService.getBookingByCode(code);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }
    @GetMapping("/host-bookings")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getHostBookings(
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<BookingResponse> bookings = bookingService.getHostBookings(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getUpcomingBookings(
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser) {
        List<BookingResponse> bookings = bookingService.getUpcomingBookings(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/check-availability")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAvailability(
            @RequestParam Long propertyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        boolean available = bookingService.isPropertyAvailable(propertyId, checkIn, checkOut);
        return ResponseEntity.ok(ApiResponse.success(Map.of("available", available)));
    }

    @GetMapping("/booked-dates/{propertyId}")
    public ResponseEntity<ApiResponse<List<LocalDate>>> getBookedDates(@PathVariable Long propertyId) {
        List<LocalDate> bookedDates = bookingService.getBookedDates(propertyId);
        return ResponseEntity.ok(ApiResponse.success(bookedDates));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(@PathVariable Long id) {
        BookingResponse booking = bookingService.confirmBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Booking confirmed", booking));
    }


    @GetMapping("/host-stats")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<BookingStatsResponse>> getHostBookingStats(
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser) {
        BookingStatsResponse stats = bookingService.getHostBookingStats(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/host-calendar")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<BookingCalendarResponse>> getHostBookingCalendar(
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        // Use current date if not specified
        if (year == 0) year = LocalDate.now().getYear();
        if (month == 0) month = LocalDate.now().getMonthValue();

        BookingCalendarResponse calendar = bookingService.getHostBookingCalendar(currentUser.getId(), year, month);
        return ResponseEntity.ok(ApiResponse.success(calendar));
    }

}
