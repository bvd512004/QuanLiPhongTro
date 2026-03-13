package sba301.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.backend.entity.Amenity;
import sba301.backend.enums.AmenityCategory;

import java.util.List;


@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {

    List<Amenity> findByIsActiveTrueOrderByNameAsc();

    List<Amenity> findByCategoryAndIsActiveTrueOrderByNameAsc(AmenityCategory category);

    List<Amenity> findByIdIn(List<Long> ids);

    Boolean existsByNameIgnoreCase(String name);

}

