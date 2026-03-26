package sba301.backend.mapper;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import sba301.backend.dto.response.BookingResponse;
import sba301.backend.dto.response.PropertyResponse;
import sba301.backend.dto.response.UserResponse;
import sba301.backend.entity.Amenity;
import sba301.backend.entity.Booking;
import sba301.backend.entity.Category;
import sba301.backend.entity.Property;
import sba301.backend.entity.PropertyImage;
import sba301.backend.entity.Role;
import sba301.backend.entity.User;
import sba301.backend.enums.AmenityCategory;
import sba301.backend.enums.RoleName;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {UserMapperImpl.class, PropertyMapperImpl.class, BookingMapperImpl.class})
class MapStructMapperTest {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PropertyMapper propertyMapper;

    @Autowired
    private BookingMapper bookingMapper;

    @Test
    void userMapper_shouldMapRoleEnumsToStringNames() {
        Role hostRole = Role.builder().name(RoleName.ROLE_HOST).build();
        Role userRole = Role.builder().name(RoleName.ROLE_USER).build();

        Set<Role> roles = new HashSet<>();
        roles.add(hostRole);
        roles.add(userRole);

        User user = User.builder()
                .email("host@example.com")
                .firstName("Anh")
                .lastName("Tran")
                .roles(roles)
                .build();
        user.setId(10L);

        UserResponse response = userMapper.toResponse(user);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Anh Tran", response.getFullName());
        assertNotNull(response.getRoles());
        assertTrue(response.getRoles().contains("ROLE_HOST"));
        assertTrue(response.getRoles().contains("ROLE_USER"));
    }

    @Test
    void propertyMapper_shouldMapCategoryAmenitiesAndImages() {
        Category category = Category.builder().name("Apartment").build();
        category.setId(2L);

        Amenity wifi = Amenity.builder().name("Wifi").category(AmenityCategory.BASIC).build();
        wifi.setId(3L);

        PropertyImage image = PropertyImage.builder()
                .imageUrl("https://cdn.local/property-1.jpg")
                .isPrimary(true)
                .build();
        image.setId(4L);

        User host = User.builder()
                .email("owner@example.com")
                .firstName("Minh")
                .lastName("Pham")
                .build();
        host.setId(5L);

        Property property = Property.builder()
                .title("Cozy Studio")
                .address("123 Street")
                .pricePerNight(BigDecimal.valueOf(40))
                .host(host)
                .category(category)
                .images(List.of(image))
                .amenities(Set.of(wifi))
                .build();
        property.setId(1L);

        PropertyResponse response = propertyMapper.toResponse(property);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertNotNull(response.getCategory());
        assertEquals(2L, response.getCategory().getId());
        assertNotNull(response.getAmenities());
        assertEquals(1, response.getAmenities().size());
        assertNotNull(response.getImages());
        assertEquals(1, response.getImages().size());
    }

    @Test
    void bookingMapper_shouldMapGuestAndProperty() {
        User guest = User.builder()
                .email("guest@example.com")
                .firstName("Lan")
                .lastName("Nguyen")
                .build();
        guest.setId(11L);

        User host = User.builder()
                .email("host@example.com")
                .firstName("Host")
                .lastName("User")
                .build();
        host.setId(12L);

        Property property = Property.builder()
                .title("Room A")
                .address("456 Avenue")
                .pricePerNight(BigDecimal.valueOf(55))
                .host(host)
                .build();
        property.setId(13L);

        Booking booking = Booking.builder()
                .bookingCode("BK-001")
                .checkInDate(LocalDate.of(2026, 4, 10))
                .checkOutDate(LocalDate.of(2026, 4, 12))
                .pricePerNight(BigDecimal.valueOf(55))
                .totalPrice(BigDecimal.valueOf(110))
                .guest(guest)
                .property(property)
                .build();
        booking.setId(14L);

        BookingResponse response = bookingMapper.toResponse(booking);

        assertNotNull(response);
        assertEquals(14L, response.getId());
        assertNotNull(response.getGuest());
        assertEquals(11L, response.getGuest().getId());
        assertNotNull(response.getProperty());
        assertEquals(13L, response.getProperty().getId());
    }
}

