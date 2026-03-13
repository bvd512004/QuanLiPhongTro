package sba301.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarBookingResponse {
    private LocalDate date;
    private String type; // "available", "checked-in", "guest"
    private String guestName;
    private String bookingCode;
    private Long bookingId;
    private String status; // PENDING, CONFIRMED, etc.
}