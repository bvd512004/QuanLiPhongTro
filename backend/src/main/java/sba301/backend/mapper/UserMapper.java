package sba301.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import sba301.backend.dto.response.UserResponse;
import sba301.backend.entity.Role;
import sba301.backend.entity.User;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "roles", expression = "java(toRoleNames(user.getRoles()))")
    UserResponse toResponse(User user);

    default Set<String> toRoleNames(Set<Role> roles) {
        if (roles == null) {
            return null;
        }
        return roles.stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
    }
}

