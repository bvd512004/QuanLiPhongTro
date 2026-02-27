package sba301.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.backend.entity.Amenity;


@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {
    

}

