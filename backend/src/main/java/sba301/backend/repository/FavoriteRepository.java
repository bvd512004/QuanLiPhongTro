package sba301.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;
import sba301.backend.entity.Favorite;


@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    

}

