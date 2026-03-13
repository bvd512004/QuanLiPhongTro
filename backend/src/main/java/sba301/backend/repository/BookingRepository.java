package sba301.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sba301.backend.entity.Booking;
import sba301.backend.enums.BookingStatus;
import sba301.backend.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);

    Page<Booking> findByGuestIdOrderByCreatedAtDesc(Long guestId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.property.host.id = :hostId ORDER BY b.createdAt DESC")
    Page<Booking> findByHostId(@Param("hostId") Long hostId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.property.id = :propertyId AND b.status IN ('PENDING', 'CONFIRMED') " +
            "AND ((b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn))")
    List<Booking> findConflictingBookings(@Param("propertyId") Long propertyId,
                                          @Param("checkIn") LocalDate checkIn,
                                          @Param("checkOut") LocalDate checkOut);

    @Query("SELECT b FROM Booking b WHERE b.guest.id = :guestId AND b.checkInDate > :today " +
            "AND b.status IN ('PENDING', 'CONFIRMED') ORDER BY b.checkInDate ASC")
    List<Booking> findUpcomingBookings(@Param("guestId") Long guestId, @Param("today") LocalDate today);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.property.host.id = :hostId " +
            "AND b.status = 'COMPLETED' AND b.createdAt >= :startDate")
    BigDecimal getTotalRevenueByHost(@Param("hostId") Long hostId, @Param("startDate") LocalDate startDate);

    // Statistics methods
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.property.host.id = :hostId AND b.status = :status AND b.paymentStatus = :paymentStatus")
    Long countByHostIdAndStatusAndPaymentStatus(
            @Param("hostId") Long hostId,
            @Param("status") BookingStatus status,
            @Param("paymentStatus") PaymentStatus paymentStatus);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.property.host.id = :hostId AND b.status = :status AND b.createdAt BETWEEN :start AND :end")
    Long countByHostIdAndStatusAndCreatedAtBetween(
            @Param("hostId") Long hostId,
            @Param("status") BookingStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.property.host.id = :hostId AND b.status = :status")
    BigDecimal sumTotalPriceByHostIdAndStatus(@Param("hostId") Long hostId, @Param("status") BookingStatus status);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.property.host.id = :hostId AND b.status = :status AND b.checkInDate > :checkInDate")
    BigDecimal sumTotalPriceByHostIdAndStatusAndCheckInDateAfter(
            @Param("hostId") Long hostId,
            @Param("status") BookingStatus status,
            @Param("checkInDate") LocalDate checkInDate);

    // Calendar methods
    @Query("SELECT b FROM Booking b WHERE b.property.host.id = :hostId " +
            "AND b.status IN ('PENDING', 'CONFIRMED') " +
            "AND ((b.checkInDate <= :endDate AND b.checkOutDate >= :startDate)) " +
            "ORDER BY b.checkInDate ASC")
    List<Booking> findByHostIdAndDateRange(
            @Param("hostId") Long hostId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.property.host.id = :hostId AND b.status = :status")
    @Deprecated // Use the method with PaymentStatus instead
    Long countByHostIdAndStatus(@Param("hostId") Long hostId, @Param("status") BookingStatus status);

    // Dashboard statistics methods
    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.property.host.id = :hostId " +
            "AND b.status IN ('CONFIRMED', 'COMPLETED') " +
            "AND MONTH(b.checkInDate) = :month AND YEAR(b.checkInDate) = :year")
    BigDecimal sumRevenueByHostIdAndMonth(
            @Param("hostId") Long hostId,
            @Param("month") Integer month,
            @Param("year") Integer year);

    @Query("SELECT SUM(b.numGuests) FROM Booking b WHERE b.property.host.id = :hostId " +
            "AND b.status IN ('CONFIRMED', 'COMPLETED')")
    Long sumTotalGuestsByHostId(@Param("hostId") Long hostId);

    @Query("SELECT SUM(b.numGuests) FROM Booking b WHERE b.property.host.id = :hostId " +
            "AND b.status IN ('CONFIRMED', 'COMPLETED') " +
            "AND MONTH(b.checkInDate) = :month AND YEAR(b.checkInDate) = :year")
    Long sumGuestsByHostIdAndMonth(
            @Param("hostId") Long hostId,
            @Param("month") Integer month,
            @Param("year") Integer year);

    @Query("SELECT MONTH(b.checkInDate) as month, YEAR(b.checkInDate) as year, SUM(b.totalPrice) as revenue " +
            "FROM Booking b WHERE b.property.host.id = :hostId " +
            "AND b.status IN ('CONFIRMED', 'COMPLETED') " +
            "AND YEAR(b.checkInDate) = :year " +
            "GROUP BY MONTH(b.checkInDate), YEAR(b.checkInDate) " +
            "ORDER BY MONTH(b.checkInDate)")
    List<Object[]> findMonthlyRevenueByHostIdAndYear(@Param("hostId") Long hostId, @Param("year") Integer year);
}
