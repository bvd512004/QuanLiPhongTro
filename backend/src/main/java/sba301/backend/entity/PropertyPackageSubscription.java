package sba301.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import sba301.backend.enums.PackageSubscriptionStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "property_package_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyPackageSubscription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posting_package_id")
    private PostingPackage postingPackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "transaction_id", length = 200)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private PackageSubscriptionStatus status = PackageSubscriptionStatus.PENDING;

}

