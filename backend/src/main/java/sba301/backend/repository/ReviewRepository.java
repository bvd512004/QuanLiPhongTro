package sba301.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;
import sba301.backend.entity.Review;


@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

}

