package sba301.backend.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.backend.dto.response.UserResponse;
import sba301.backend.entity.User;
import sba301.backend.enums.RoleName;
import sba301.backend.exception.BadRequestException;
import sba301.backend.exception.ResourceNotFoundException;
import sba301.backend.mapper.UserMapper;
import sba301.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminUserService {

    UserRepository userRepository;
    UserMapper userMapper;

    public Page<UserResponse> getUsers(String keyword, Boolean isActive, Pageable pageable) {
        // if keyword is empty, query still works with isActive filter.
        String normalizedKeyword = (keyword == null) ? null : keyword.trim();
        return userRepository.searchUsersAdmin(normalizedKeyword, isActive, pageable)
                .map(userMapper::toResponse);
    }

    @Transactional
    public UserResponse banUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (user.getRoles() != null && user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_ADMIN)) {
            throw new BadRequestException("Cannot ban admin user");
        }

        user.setIsActive(false);
        User saved = userRepository.save(user);
        log.info("Admin banned user {} ({})", saved.getId(), saved.getEmail());
        return userMapper.toResponse(saved);
    }

    @Transactional
    public UserResponse unbanUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setIsActive(true);
        User saved = userRepository.save(user);
        log.info("Admin unbanned user {} ({})", saved.getId(), saved.getEmail());
        return userMapper.toResponse(saved);
    }
}

