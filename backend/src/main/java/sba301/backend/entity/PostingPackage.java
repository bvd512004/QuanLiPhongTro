package sba301.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posting_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostingPackage extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "duration_days")
    private Integer durationDays; // number of days the package is active

    @Column(name = "priority_level")
    private Integer priorityLevel = 0; // higher value = higher priority in listing

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "features", columnDefinition = "TEXT")
    private String features; // optional JSON or comma-separated features

    @OneToMany(mappedBy = "postingPackage", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PropertyPackageSubscription> subscriptions = new ArrayList<>();

}

