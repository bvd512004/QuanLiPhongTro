package sba301.backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    
    @Size(max = 50)
    private String firstName;
    
    @Size(max = 50)
    private String lastName;
    
    @Size(max = 20)
    private String phone;
    
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String address;
    
    @Size(max = 100)
    private String city;
    
    @Size(max = 100)
    private String country;
    
    @Size(max = 500)
    private String bio;
}

