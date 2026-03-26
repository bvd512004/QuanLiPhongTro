package sba301.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String address;
    private String city;
    private String country;
    private String bio;
    private Boolean isVerified;
    private Boolean isHost;
    private Boolean isActive;
    private Set<String> roles;
    private LocalDateTime createdAt;
}

