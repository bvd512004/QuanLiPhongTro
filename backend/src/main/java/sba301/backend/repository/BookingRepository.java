package sba301.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;
import sba301.backend.entity.Booking;


@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

}
