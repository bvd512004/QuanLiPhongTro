package sba301.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {
    
    @Column(name = "overall_rating", precision = 2, scale = 1, nullable = false)
    private BigDecimal overallRating;
    
    @Column(name = "cleanliness_rating", precision = 2, scale = 1)
    private BigDecimal cleanlinessRating;
    
    @Column(name = "accuracy_rating", precision = 2, scale = 1)
    private BigDecimal accuracyRating;
    
    @Column(name = "checkin_rating", precision = 2, scale = 1)
    private BigDecimal checkinRating;
    
    @Column(name = "communication_rating", precision = 2, scale = 1)
    private BigDecimal communicationRating;
    
    @Column(name = "location_rating", precision = 2, scale = 1)
    private BigDecimal locationRating;
    
    @Column(name = "value_rating", precision = 2, scale = 1)
    private BigDecimal valueRating;
    
    @Column(name = "comment", columnDefinition = "TEXT", nullable = false)
    private String comment;
    
    @Column(name = "host_response", columnDefinition = "TEXT")
    private String hostResponse;
    
    @Column(name = "is_public")
    private Boolean isPublic = true;
    
    @Column(name = "is_recommended")
    private Boolean isRecommended = true;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;
}

