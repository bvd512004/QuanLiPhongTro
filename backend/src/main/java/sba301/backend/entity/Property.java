package sba301.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import sba301.backend.enums.PropertyStatus;
import sba301.backend.enums.PropertyType;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property extends BaseEntity {
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", length = 50)
    private PropertyType propertyType;
    
    @Column(name = "address", nullable = false)
    private String address;
    
    @Column(name = "city", length = 100)
    private String city;
    
    @Column(name = "state", length = 100)
    private String state;
    
    @Column(name = "country", length = 100)
    private String country;
    
    @Column(name = "zip_code", length = 20)
    private String zipCode;
    
    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(name = "price_per_night", precision = 10, scale = 2, nullable = false)
    private BigDecimal pricePerNight;
    
    @Column(name = "cleaning_fee", precision = 10, scale = 2)
    private BigDecimal cleaningFee;
    
    @Column(name = "service_fee", precision = 10, scale = 2)
    private BigDecimal serviceFee;
    
    @Column(name = "max_guests")
    private Integer maxGuests;
    
    @Column(name = "bedrooms")
    private Integer bedrooms;
    
    @Column(name = "beds")
    private Integer beds;
    
    @Column(name = "bathrooms")
    private Integer bathrooms;
    
    @Column(name = "area_sqft")
    private Integer areaSqft;
    
    @Column(name = "min_nights")
    private Integer minNights = 1;
    
    @Column(name = "max_nights")
    private Integer maxNights = 365;
    
    @Column(name = "check_in_time", length = 10)
    private String checkInTime;
    
    @Column(name = "check_out_time", length = 10)
    private String checkOutTime;
    
    @Column(name = "house_rules", columnDefinition = "TEXT")
    private String houseRules;
    
    @Column(name = "cancellation_policy", columnDefinition = "TEXT")
    private String cancellationPolicy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private PropertyStatus status = PropertyStatus.PENDING;
    
    @Column(name = "is_instant_book")
    private Boolean isInstantBook = false;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;
    
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;
    
    @Column(name = "view_count")
    private Long viewCount = 0L;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<PropertyImage> images = new ArrayList<>();
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "property_amenities",
        joinColumns = @JoinColumn(name = "property_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    @Builder.Default
    private Set<Amenity> amenities = new HashSet<>();
    
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();
    
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();
    
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Favorite> favorites = new ArrayList<>();

    // Helper methods
    public void addImage(PropertyImage image) {
        images.add(image);
        image.setProperty(this);
    }
    
    public String getPrimaryImageUrl() {
        return images.stream()
            .filter(PropertyImage::getIsPrimary)
            .findFirst()
            .map(PropertyImage::getImageUrl)
            .orElse(images.isEmpty() ? null : images.get(0).getImageUrl());
    }
}

