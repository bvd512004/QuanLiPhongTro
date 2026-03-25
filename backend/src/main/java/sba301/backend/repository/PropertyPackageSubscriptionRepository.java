package sba301.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sba301.backend.entity.PropertyPackageSubscription;

import java.util.List;

public interface PropertyPackageSubscriptionRepository extends JpaRepository<PropertyPackageSubscription, Long> {
    List<PropertyPackageSubscription> findByPropertyIdAndIsActiveTrue(Long propertyId);
}

