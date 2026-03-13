package sba301.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCalendarResponse {
    private int month;
    private int year;
    private String monthName;
    private List<CalendarBookingResponse> bookings;
}
