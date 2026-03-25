package sba301.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.backend.constants.ApiPath;
import sba301.backend.dto.request.UpdateUserRequest;
import sba301.backend.dto.response.ApiResponse;
import sba301.backend.dto.response.UserResponse;
import sba301.backend.service.UserService;
import sba301.backend.utils.UserMapper;

@RestController
@RequestMapping(ApiPath.USER)
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {

        UserResponse user = userMapper.toResponse(userService.getCurrentUser());

        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestBody UpdateUserRequest request) {

        UserResponse user = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Update success", user));
    }
}
