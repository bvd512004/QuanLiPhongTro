package sba301.backend.service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.backend.dto.request.UpdateUserRequest;
import sba301.backend.dto.response.UserResponse;
import sba301.backend.entity.Role;
import sba301.backend.entity.User;
import sba301.backend.enums.RoleName;
import sba301.backend.exception.ResourceNotFoundException;
import sba301.backend.repository.RoleRepository;
import sba301.backend.repository.UserRepository;
import sba301.backend.mapper.UserMapper;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UpdateUserRequest request) {

        // 🔥 lấy user từ token
        User user = getCurrentUser();

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getBio() != null) user.setBio(request.getBio());

        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public UserResponse becomeHost(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Role hostRole = roleRepository.findByName(RoleName.ROLE_HOST)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "ROLE_HOST"));

        user.setIsHost(true);
        user.addRole(hostRole);

        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}

