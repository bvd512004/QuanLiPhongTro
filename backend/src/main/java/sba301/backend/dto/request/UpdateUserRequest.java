package sba301.backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @Size(max = 50, message = "First name tối đa 50 ký tự")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "First name không chứa ký tự đặc biệt")
    private String firstName;

    @Size(max = 50, message = "Last name tối đa 50 ký tự")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "Last name không chứa ký tự đặc biệt")
    private String lastName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(\\+84|0)\\d{9,10}$",
            message = "Số điện thoại phải đúng định dạng VN"
    )
    private String phone;    @Size(max = 255, message = "Avatar URL quá dài")
    @Pattern(
            regexp = "^(https?:\\/\\/.*)?$",
            message = "Avatar phải là URL hợp lệ"
    )
    private String avatarUrl;

    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate dateOfBirth;

    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    private String address;

    @Size(max = 100, message = "City tối đa 100 ký tự")
    private String city;

    @Size(max = 100, message = "Country tối đa 100 ký tự")
    private String country;

    @Size(max = 500, message = "Bio tối đa 500 ký tự")
    private String bio;
}