package sba301.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import sba301.backend.enums.BookingStatus;
import sba301.backend.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {
    
    @Column(name = "booking_code", unique = true, nullable = false, length = 20)
    private String bookingCode;
    
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;
    
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;
    
    @Column(name = "num_guests")
    private Integer numGuests;
    
    @Column(name = "num_adults")
    private Integer numAdults;
    
    @Column(name = "num_children")
    private Integer numChildren;
    
    @Column(name = "num_infants")
    private Integer numInfants;
    
    @Column(name = "price_per_night", precision = 10, scale = 2, nullable = false)
    private BigDecimal pricePerNight;
    
    @Column(name = "num_nights")
    private Integer numNights;
    
    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(name = "cleaning_fee", precision = 10, scale = 2)
    private BigDecimal cleaningFee;
    
    @Column(name = "service_fee", precision = 10, scale = 2)
    private BigDecimal serviceFee;
    
    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;
    
    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;
    
    @Column(name = "total_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPrice;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private BookingStatus status = BookingStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    
    @Column(name = "transaction_id", length = 100)
    private String transactionId;
    
    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;
    
    @Column(name = "guest_message", columnDefinition = "TEXT")
    private String guestMessage;
    
    @Column(name = "host_response", columnDefinition = "TEXT")
    private String hostResponse;
    
    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;
    
    @Column(name = "cancelled_by", length = 20)
    private String cancelledBy;
    
    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private User guest;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
    
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Review review;

    // Helper methods
    @PrePersist
    @PreUpdate
    public void calculateFields() {
        if (checkInDate != null && checkOutDate != null) {
            this.numNights = (int) ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        }
        if (pricePerNight != null && numNights != null) {
            this.subtotal = pricePerNight.multiply(BigDecimal.valueOf(numNights));
        }
    }
}

