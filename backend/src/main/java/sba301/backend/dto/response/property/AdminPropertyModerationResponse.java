package sba301.backend.dto.response.property;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPropertyModerationResponse {

    private Long id;
    private String title;
    private String address;
    private String city;
    private BigDecimal pricePerNight;
    private String status;
    private String hostEmail;
    private String hostFullName;
    private LocalDateTime createdAt;
}

