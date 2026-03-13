package sba301.backend.utils;


import org.springframework.stereotype.Component;
import sba301.backend.dto.response.UserResponse;
import sba301.backend.entity.User;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) return null;

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .dateOfBirth(user.getDateOfBirth())
                .address(user.getAddress())
                .city(user.getCity())
                .country(user.getCountry())
                .bio(user.getBio())
                .isVerified(user.getIsVerified())
                .isHost(user.getIsHost())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .build();
    }
}
