package sba301.backend.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sba301.backend.dto.response.AdminDashboardStatsResponse;
import sba301.backend.enums.PropertyStatus;
import sba301.backend.repository.PropertyRepository;
import sba301.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminDashboardService {

    UserRepository userRepository;
    PropertyRepository propertyRepository;

    public AdminDashboardStatsResponse getAdminStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long bannedUsers = userRepository.countByIsActiveFalse();

        long totalProperties = propertyRepository.count();
        long activeProperties = propertyRepository.countByStatus(PropertyStatus.ACTIVE);
        long inactiveProperties = propertyRepository.countByStatus(PropertyStatus.INACTIVE);
        long underReviewProperties = propertyRepository.countByStatus(PropertyStatus.UNDER_REVIEW);
        long rejectedProperties = propertyRepository.countByStatus(PropertyStatus.REJECTED);

        return AdminDashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .bannedUsers(bannedUsers)
                .totalProperties(totalProperties)
                .activeProperties(activeProperties)
                .inactiveProperties(inactiveProperties)
                .underReviewProperties(underReviewProperties)
                .rejectedProperties(rejectedProperties)
                .build();
    }
}

