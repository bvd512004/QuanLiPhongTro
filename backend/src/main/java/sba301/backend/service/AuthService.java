package sba301.backend.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.backend.config.JwtTokenProvider;
import sba301.backend.dto.request.LoginRequest;
import sba301.backend.dto.request.RegisterRequest;
import sba301.backend.dto.response.AuthResponse;
import sba301.backend.dto.response.UserResponse;
import sba301.backend.entity.Role;
import sba301.backend.entity.User;
import sba301.backend.enums.RoleName;
import sba301.backend.exception.BadRequestException;
import sba301.backend.exception.ConflictException;
import sba301.backend.repository.RoleRepository;
import sba301.backend.repository.UserRepository;
import sba301.backend.mapper.UserMapper;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Service
public class AuthService {

    AuthenticationManager authenticationManager;
    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    JwtTokenProvider tokenProvider;
    UserMapper userMapper;

    public AuthResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationInMs())
                .user(userMapper.toResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        Role role = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new BadRequestException("Role not found"));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));


        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(null)
                .tokenType("Bearer")
                .expiresIn(0L)
                .user(userMapper.toResponse(user))
                .build();
    }

    public UserResponse getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            throw new BadRequestException("User not authenticated");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        return userMapper.toResponse(user);
    }
}