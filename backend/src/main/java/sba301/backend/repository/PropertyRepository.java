package sba301.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.stereotype.Repository;
import sba301.backend.entity.Property;



@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    Page<Property> findByStatusAndIsDeletedFalse(PropertyStatus status, Pageable pageable);

    Page<Property> findByHostIdAndIsDeletedFalse(Long hostId, Pageable pageable);

    Page<Property> findByCategoryIdAndStatusAndIsDeletedFalse(Long categoryId, PropertyStatus status, Pageable pageable);

    Page<Property> findByCityIgnoreCaseAndStatusAndIsDeletedFalse(String city, PropertyStatus status, Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.status = :status AND p.isDeleted = false AND " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.city) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Property> searchProperties(@Param("keyword") String keyword,
                                    @Param("status") PropertyStatus status,
                                    Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.isFeatured = true AND p.status = 'ACTIVE' AND p.isDeleted = false " +
            "ORDER BY p.averageRating DESC")
    List<Property> findFeaturedProperties(Pageable pageable);

    @Modifying
    @Query("UPDATE Property p SET p.viewCount = p.viewCount + 1 WHERE p.id = :propertyId")
    void incrementViewCount(@Param("propertyId") Long propertyId);

    @Query("SELECT DISTINCT p.city FROM Property p WHERE p.status = 'ACTIVE' AND p.isDeleted = false ORDER BY p.city")
    List<String> findDistinctCities();

    @Query("SELECT DISTINCT CAST(p.propertyType AS string) FROM Property p WHERE p.status = 'ACTIVE' AND p.isDeleted = false AND p.propertyType IS NOT NULL ORDER BY CAST(p.propertyType AS String)")
    List<String> findDistinctPropertyTypes();

    @Query("SELECT SUM(p.viewCount) FROM Property p WHERE p.host.id = :hostId AND p.isDeleted = false")
    Long sumViewCountByHostId(@Param("hostId") Long hostId);

    @Query("""
                SELECT DISTINCT p FROM Property p 
                LEFT JOIN p.amenities a 
                WHERE p.status = 'ACTIVE' AND p.isDeleted = false
                AND (:categoryId IS NULL OR p.category.id = :categoryId)
                AND (
                    :rentalType IS NULL OR 
                    (:rentalType = 'SHORT_TERM' AND (
                        (:minPrice IS NULL OR p.pricePerNight >= :minPrice) AND 
                        (:maxPrice IS NULL OR p.pricePerNight <= :maxPrice)
                    ))
                )
                AND (COALESCE(:propertyTypes, NULL) IS NULL OR CAST(p.propertyType AS string) IN :propertyTypes)
                AND (     :city IS NULL\s
                        OR LOWER(p.city) LIKE LOWER(CONCAT('%', :city, '%'))\s
                        OR LOWER(p.address) LIKE LOWER(CONCAT('%', :city, '%')))
                AND (:isInstantBook IS NULL OR p.isInstantBook = :isInstantBook)
                AND (:minGuests IS NULL OR p.maxGuests >= :minGuests)
                AND (:minArea IS NULL OR p.areaSqft >= :minArea)
                AND (:maxArea IS NULL OR p.areaSqft <= :maxArea)
                AND (COALESCE(:amenityIds, NULL) IS NULL OR a.id IN :amenityIds)
                GROUP BY p.id
                HAVING COALESCE(:amenitySize, 0) = 0 OR COUNT(DISTINCT a.id) >= :amenitySize
            """)
    Page<Property> filterProperties(
            @Param("categoryId") Long categoryId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("propertyTypes") List<String> propertyTypes,
            @Param("city") String city,
            @Param("isInstantBook") Boolean isInstantBook,
            @Param("minGuests") Integer minGuests,
            @Param("minArea") Integer minArea,
            @Param("maxArea") Integer maxArea,
            @Param("amenityIds") List<Long> amenityIds,
            @Param("amenitySize") Long amenitySize,
            Pageable pageable
    );

    Long countByStatus(PropertyStatus status);

    Long countByHostId(Long hostId);

    Page<Property> findByStatus(PropertyStatus status, Pageable pageable);

}

