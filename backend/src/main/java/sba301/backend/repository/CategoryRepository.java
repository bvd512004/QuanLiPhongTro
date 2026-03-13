package sba301.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import sba301.backend.entity.Category;

import java.util.List;
import java.util.Optional;


@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();

    Boolean existsBySlug(String slug);

    @Query("SELECT c, COUNT(p) FROM Category c LEFT JOIN c.properties p " +
            "WHERE c.isActive = true GROUP BY c ORDER BY c.displayOrder")
    List<Object[]> findAllWithPropertyCount();

}

