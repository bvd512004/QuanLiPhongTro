package sba301.backend.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sba301.backend.dto.response.HostReviewResponse;
import sba301.backend.entity.Review;

import java.math.BigDecimal;
import java.util.Optional;


@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByPropertyIdAndIsPublicTrueOrderByCreatedAtDesc(Long propertyId, Pageable pageable);

    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Review> findByBookingId(Long bookingId);

    Boolean existsByBookingId(Long bookingId);

    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.property.id = :propertyId AND r.isPublic = true")
    BigDecimal getAverageRatingByProperty(@Param("propertyId") Long propertyId);

    Long countByPropertyIdAndIsPublicTrue(Long propertyId);

    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.property.host.id = :hostId AND r.isPublic = true")
    BigDecimal getAverageRatingByHostId(@Param("hostId") Long hostId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.property.host.id = :hostId AND r.isPublic = true")
    Long countByHostId(@Param("hostId") Long hostId);

    @Query("""
            SELECT new sba301.backend.dto.response.HostReviewResponse(
                r.id,
                r.overallRating,
                r.comment,
                r.hostResponse,
                r.createdAt,
                p.id,
                p.title,
                u.id,
                u.firstName,
                u.lastName,
                u.avatarUrl
            )
            FROM Review r
            JOIN r.property p
            JOIN r.user u
            WHERE p.host.id = :hostId
              AND (r.isPublic = true OR r.isPublic IS NULL)
              AND (:propertyId IS NULL OR p.id = :propertyId)
              AND (:minRating IS NULL OR r.overallRating >= :minRating)
              AND (:maxRating IS NULL OR r.overallRating < :maxRating)
            ORDER BY r.createdAt DESC
            """)
    Page<HostReviewResponse> findHostReviews(
            @Param("hostId") Long hostId,
            @Param("propertyId") Long propertyId,
            @Param("minRating") BigDecimal minRating,
            @Param("maxRating") BigDecimal maxRating,
            Pageable pageable);
}

