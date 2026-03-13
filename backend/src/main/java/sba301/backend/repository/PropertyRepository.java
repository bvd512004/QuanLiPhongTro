package sba301.backend.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sba301.backend.entity.Property;
import sba301.backend.enums.PropertyStatus;

import java.util.List;


@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    Page<Property> findByStatusAndIsDeletedFalse(PropertyStatus status, Pageable pageable);

    @Modifying
    @Query("UPDATE Property p SET p.viewCount = p.viewCount + 1 WHERE p.id = :propertyId")
    void incrementViewCount(@Param("propertyId") Long propertyId);

    @Query("SELECT p FROM Property p WHERE p.isFeatured = true AND p.status = 'ACTIVE' AND p.isDeleted = false " +
            "ORDER BY p.averageRating DESC")
    List<Property> findFeaturedProperties(Pageable pageable);
    

}

