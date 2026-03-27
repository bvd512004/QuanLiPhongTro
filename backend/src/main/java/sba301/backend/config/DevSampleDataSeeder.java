//package sba301.backend.config;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
//import org.springframework.context.annotation.Profile;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Component;
//import org.springframework.transaction.annotation.Transactional;
//import sba301.backend.entity.Amenity;
//import sba301.backend.entity.Booking;
//import sba301.backend.entity.Category;
//import sba301.backend.entity.PostingPackage;
//import sba301.backend.entity.Property;
//import sba301.backend.entity.PropertyDocument;
//import sba301.backend.entity.PropertyImage;
//import sba301.backend.entity.PropertyPackageSubscription;
//import sba301.backend.entity.Review;
//import sba301.backend.entity.Role;
//import sba301.backend.entity.User;
//import sba301.backend.enums.AmenityCategory;
//import sba301.backend.enums.BookingStatus;
//import sba301.backend.enums.DocumentType;
//import sba301.backend.enums.PackageSubscriptionStatus;
//import sba301.backend.enums.PaymentStatus;
//import sba301.backend.enums.PropertyStatus;
//import sba301.backend.enums.PropertyType;
//import sba301.backend.enums.RoleName;
//import sba301.backend.repository.AmenityRepository;
//import sba301.backend.repository.BookingRepository;
//import sba301.backend.repository.CategoryRepository;
//import sba301.backend.repository.PostingPackageRepository;
//import sba301.backend.repository.PropertyPackageSubscriptionRepository;
//import sba301.backend.repository.PropertyRepository;
//import sba301.backend.repository.ReviewRepository;
//import sba301.backend.repository.RoleRepository;
//import sba301.backend.repository.UserRepository;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.EnumSet;
//import java.util.HashSet;
//import java.util.List;
//import java.util.Set;
//
//@Component
//@Profile("!prod")
//@RequiredArgsConstructor
//@Slf4j
//public class DevSampleDataSeeder implements CommandLineRunner {
//
//    private final RoleRepository roleRepository;
//    private final UserRepository userRepository;
//    private final CategoryRepository categoryRepository;
//    private final AmenityRepository amenityRepository;
//    private final PostingPackageRepository postingPackageRepository;
//    private final PropertyRepository propertyRepository;
//    private final BookingRepository bookingRepository;
//    private final ReviewRepository reviewRepository;
//    private final PropertyPackageSubscriptionRepository propertyPackageSubscriptionRepository;
//    private final PasswordEncoder passwordEncoder;
//
//    @Override
//    @Transactional
//    public void run(String... args) {
//        log.info("Starting dev sample data seeding...");
//
//        seedRoles();
//
//        User host = seedUser(
//                "host.sample@stayease.local",
//                "Host",
//                "Sample",
//                Set.of(RoleName.ROLE_HOST, RoleName.ROLE_USER),
//                true,
//                true,
//                "0912345678",
//                "Da Nang",
//                "Viet Nam"
//        );
//
//        User guest = seedUser(
//                "guest.sample@stayease.local",
//                "Guest",
//                "Sample",
//                Set.of(RoleName.ROLE_USER),
//                false,
//                false,
//                "0987654321",
//                "Ho Chi Minh",
//                "Viet Nam"
//        );
//
//        seedUser(
//                "admin.sample@stayease.local",
//                "Admin",
//                "Sample",
//                Set.of(RoleName.ROLE_ADMIN,RoleName.ROLE_USER,RoleName.ROLE_HOST),
//                true,
//                false,
//                "0900000000",
//                "Ha Noi",
//                "Viet Nam"
//        );
//
//        Category apartmentCategory = seedCategory(
//                "Apartment",
//                "Can ho phu hop cho gia dinh va nhom ban",
//                "building",
//                "apartment",
//                1
//        );
//
//        Category houseCategory = seedCategory(
//                "House",
//                "Nha nguyen can cho ky nghi dai ngay",
//                "home",
//                "house",
//                2
//        );
//
//        Amenity wifiAmenity = seedAmenity("Wifi", "Internet toc do cao", "wifi", AmenityCategory.BASIC);
//        Amenity kitchenAmenity = seedAmenity("Kitchen", "Bep day du do dung", "utensils", AmenityCategory.BASIC);
//        Amenity parkingAmenity = seedAmenity("Free Parking", "Cho dau xe mien phi", "car", AmenityCategory.PARKING);
//        Amenity acAmenity = seedAmenity("Air Conditioning", "Dieu hoa 2 chieu", "snowflake", AmenityCategory.HEATING_COOLING);
//
//        PostingPackage premiumPackage = seedPackage(
//                "Premium 30 Days",
//                "premium-30-days",
//                "Uu tien hien thi trong 30 ngay",
//                BigDecimal.valueOf(299000),
//                30,
//                10,
//                "featured,badge,priority-search"
//        );
//
//        Property cityStudio = seedProperty(
//                "Sample City Studio",
//                host,
//                apartmentCategory,
//                Set.of(wifiAmenity, kitchenAmenity, acAmenity),
//                "12 Tran Phu",
//                "Da Nang",
//                PropertyType.STUDIO,
//                BigDecimal.valueOf(450000),
//                true,
//                "studio",
//                BigDecimal.valueOf(4.8),
//                1
//        );
//
//        Property beachHouse = seedProperty(
//                "Sample Beach House",
//                host,
//                houseCategory,
//                Set.of(wifiAmenity, parkingAmenity, acAmenity),
//                "88 Vo Nguyen Giap",
//                "Da Nang",
//                PropertyType.HOUSE,
//                BigDecimal.valueOf(1250000),
//                false,
//                "beach-house",
//                BigDecimal.valueOf(5.0),
//                1
//        );
//
//        Property mountainCabin = seedProperty(
//                "Sample Mountain Cabin",
//                host,
//                houseCategory,
//                Set.of(wifiAmenity, parkingAmenity),
//                "5 Ba Na Hills Road",
//                "Da Nang",
//                PropertyType.HOUSE,
//                BigDecimal.valueOf(980000),
//                false,
//                "mountain-cabin",
//                BigDecimal.valueOf(4.5),
//                3,
//                PropertyStatus.INACTIVE,
//                null
//        );
//
//        Property riversideLoft = seedProperty(
//                "Sample Riverside Loft",
//                host,
//                apartmentCategory,
//                Set.of(wifiAmenity, kitchenAmenity),
//                "77 Han River View",
//                "Da Nang",
//                PropertyType.APARTMENT,
//                BigDecimal.valueOf(760000),
//                false,
//                "riverside-loft",
//                BigDecimal.valueOf(4.1),
//                2,
//                PropertyStatus.REJECTED,
//                "Hinh anh giay to chua ro rang, vui long bo sung anh chat luong cao"
//        );
//
//        Property gardenVilla = seedProperty(
//                "Sample Garden Villa",
//                host,
//                houseCategory,
//                Set.of(wifiAmenity, kitchenAmenity, acAmenity, parkingAmenity),
//                "19 Green Garden Street",
//                "Hoi An",
//                PropertyType.VILLA,
//                BigDecimal.valueOf(1890000),
//                true,
//                "garden-villa",
//                BigDecimal.valueOf(4.9),
//                6,
//                PropertyStatus.UNDER_REVIEW,
//                null
//        );
//
//        Property downtownRoom = seedProperty(
//                "Sample Downtown Room",
//                host,
//                apartmentCategory,
//                Set.of(wifiAmenity, acAmenity),
//                "123 Bach Dang",
//                "Da Nang",
//                PropertyType.CABIN,
//                BigDecimal.valueOf(390000),
//                false,
//                "downtown-room",
//                BigDecimal.valueOf(3.9),
//                1,
//                PropertyStatus.PENDING,
//                null
//        );
//
//        Booking completedBooking = seedBooking(
//                "BK-SAMPLE-0001",
//                guest,
//                cityStudio,
//                LocalDate.now().minusDays(20),
//                LocalDate.now().minusDays(17),
//                BookingStatus.COMPLETED,
//                PaymentStatus.PAID,
//                "RATINGS5"
//        );
//
//        seedBooking(
//                "BK-SAMPLE-0002",
//                guest,
//                beachHouse,
//                LocalDate.now().minusDays(16),
//                LocalDate.now().minusDays(13),
//                BookingStatus.CONFIRMED,
//                PaymentStatus.PAID,
//                "EARLYCHECKIN"
//        );
//
//        seedBooking(
//                "BK-SAMPLE-0003",
//                guest,
//                mountainCabin,
//                LocalDate.now().minusDays(12),
//                LocalDate.now().minusDays(10),
//                BookingStatus.PENDING,
//                PaymentStatus.PENDING,
//                "TXN-PENDING-0003"
//        );
//
//        seedBooking(
//                "BK-SAMPLE-0004",
//                guest,
//                cityStudio,
//                LocalDate.now().minusDays(10),
//                LocalDate.now().minusDays(8),
//                BookingStatus.CANCELLED,
//                PaymentStatus.REFUNDED,
//                "TXN-CANCEL-0004"
//        );
//
//        seedBooking(
//                "BK-SAMPLE-0005",
//                guest,
//                riversideLoft,
//                LocalDate.now().minusDays(8),
//                LocalDate.now().minusDays(6),
//                BookingStatus.REJECTED,
//                PaymentStatus.FAILED,
//                "TXN-REJECT-0005"
//        );
//
//        seedBooking(
//                "BK-SAMPLE-0006",
//                guest,
//                beachHouse,
//                LocalDate.now().minusDays(2),
//                LocalDate.now().minusDays(1),
//                BookingStatus.NO_SHOW,
//                PaymentStatus.PAID,
//                "TXN-NOSHOW-0006"
//        );
//
//        seedBooking(
//                "BK-SAMPLE-0007",
//                guest,
//                gardenVilla,
//                LocalDate.now().minusDays(5),
//                LocalDate.now().minusDays(3),
//                BookingStatus.CONFIRMED,
//                PaymentStatus.PARTIALLY_PAID,
//                "TXN-CONFIRM-0007"
//        );
//
//        seedBooking(
//                "BK-SAMPLE-0008",
//                guest,
//                downtownRoom,
//                LocalDate.now().minusDays(32),
//                LocalDate.now().minusDays(29),
//                BookingStatus.PENDING,
//                PaymentStatus.PENDING,
//                "TXN-PENDING-0008"
//        );
//
//        seedReview(completedBooking, guest, cityStudio);
//        seedPackageSubscription(cityStudio, premiumPackage);
//
//        log.info("Sample data seeding complete. users={}, properties={}, bookings={}, reviews={}",
//                userRepository.count(), propertyRepository.count(), bookingRepository.count(), reviewRepository.count());
//    }
//
//    private void seedRoles() {
//        for (RoleName roleName : EnumSet.allOf(RoleName.class)) {
//            if (!roleRepository.existsByName(roleName)) {
//                roleRepository.save(Role.builder()
//                        .name(roleName)
//                        .description("System role: " + roleName.name())
//                        .build());
//            }
//        }
//    }
//
//    private User seedUser(
//            String email,
//            String firstName,
//            String lastName,
//            Set<RoleName> roleNames,
//            boolean verified,
//            boolean host,
//            String phone,
//            String city,
//            String country
//    ) {
//        return userRepository.findByEmail(email).orElseGet(() -> {
//            Set<Role> roles = new HashSet<>();
//            for (RoleName roleName : roleNames) {
//                Role role = roleRepository.findByName(roleName)
//                        .orElseThrow(() -> new IllegalStateException("Role not found: " + roleName));
//                roles.add(role);
//            }
//
//            User user = User.builder()
//                    .email(email)
//                    .password(passwordEncoder.encode("123456"))
//                    .firstName(firstName)
//                    .lastName(lastName)
//                    .phone(phone)
//                    .city(city)
//                    .country(country)
//                    .address(city)
//                    .bio("Sample account for development")
//                    .isVerified(verified)
//                    .isHost(host)
//                    .isActive(true)
//                    .roles(roles)
//                    .build();
//
//            return userRepository.save(user);
//        });
//    }
//
//    private Category seedCategory(String name, String description, String icon, String slug, int displayOrder) {
//        return categoryRepository.findBySlug(slug).orElseGet(() -> {
//            Category category = Category.builder()
//                    .name(name)
//                    .description(description)
//                    .icon(icon)
//                    .slug(slug)
//                    .displayOrder(displayOrder)
//                    .isActive(true)
//                    .build();
//            return categoryRepository.save(category);
//        });
//    }
//
//    private Amenity seedAmenity(String name, String description, String icon, AmenityCategory category) {
//        if (amenityRepository.existsByNameIgnoreCase(name)) {
//            return amenityRepository.findAll().stream()
//                    .filter(amenity -> amenity.getName() != null && amenity.getName().equalsIgnoreCase(name))
//                    .findFirst()
//                    .orElseThrow(() -> new IllegalStateException("Amenity exists but cannot be loaded: " + name));
//        }
//
//        Amenity amenity = Amenity.builder()
//                .name(name)
//                .description(description)
//                .icon(icon)
//                .category(category)
//                .isActive(true)
//                .build();
//
//        return amenityRepository.save(amenity);
//    }
//
//    private PostingPackage seedPackage(
//            String name,
//            String slug,
//            String description,
//            BigDecimal price,
//            int durationDays,
//            int priority,
//            String features
//    ) {
//        return postingPackageRepository.findAll().stream()
//                .filter(existing -> slug.equals(existing.getSlug()))
//                .findFirst()
//                .orElseGet(() -> postingPackageRepository.save(PostingPackage.builder()
//                        .name(name)
//                        .slug(slug)
//                        .description(description)
//                        .price(price)
//                        .durationDays(durationDays)
//                        .priorityLevel(priority)
//                        .isActive(true)
//                        .features(features)
//                        .build()));
//    }
//
//    private Property seedProperty(
//            String title,
//            User host,
//            Category category,
//            Set<Amenity> amenities,
//            String address,
//            String city,
//            PropertyType propertyType,
//            BigDecimal price,
//            boolean instantBook,
//            String imageSlug,
//            BigDecimal rating,
//            int totalReviews
//    ) {
//        return seedProperty(
//                title,
//                host,
//                category,
//                amenities,
//                address,
//                city,
//                propertyType,
//                price,
//                instantBook,
//                imageSlug,
//                rating,
//                totalReviews,
//                PropertyStatus.ACTIVE,
//                null
//        );
//    }
//
//    private Property seedProperty(
//            String title,
//            User host,
//            Category category,
//            Set<Amenity> amenities,
//            String address,
//            String city,
//            PropertyType propertyType,
//            BigDecimal price,
//            boolean instantBook,
//            String imageSlug,
//            BigDecimal rating,
//            int totalReviews,
//            PropertyStatus status,
//            String reason
//    ) {
//        return propertyRepository.findAll().stream()
//                .filter(existing -> title.equalsIgnoreCase(existing.getTitle()))
//                .findFirst()
//                .orElseGet(() -> {
//                    Property property = Property.builder()
//                            .title(title)
//                            .description("Sample property generated for development and demo")
//                            .propertyType(propertyType)
//                            .address(address)
//                            .city(city)
//                            .country("Viet Nam")
//                            .pricePerNight(price)
//                            .cleaningFee(BigDecimal.valueOf(50000))
//                            .serviceFee(BigDecimal.valueOf(30000))
//                            .maxGuests(4)
//                            .bedrooms(2)
//                            .beds(2)
//                            .bathrooms(1)
//                            .areaSqft(540)
//                            .checkInTime("14:00")
//                            .checkOutTime("12:00")
//                            .houseRules("Khong hut thuoc trong nha")
//                            .cancellationPolicy("Hoan tien 50% truoc 7 ngay")
//                            .status(status)
//                            .reason(reason)
//                            .isInstantBook(instantBook)
//                            .isFeatured(true)
//                            .averageRating(rating)
//                            .totalReviews(totalReviews)
//                            .viewCount(120L)
//                            .host(host)
//                            .category(category)
//                            .amenities(amenities)
//                            .build();
//
//                    property.addImage(PropertyImage.builder()
//                            .imageUrl("https://picsum.photos/seed/" + imageSlug + "/1200/800")
//                            .caption("Main image")
//                            .displayOrder(1)
//                            .isPrimary(true)
//                            .mediaType("IMAGE")
//                            .build());
//
//                    property.addDocument(PropertyDocument.builder()
//                            .fileName("ownership-proof-" + imageSlug + ".pdf")
//                            .fileUrl("https://example.com/docs/ownership-proof-" + imageSlug + ".pdf")
//                            .fileExtension("pdf")
//                            .documentType(DocumentType.LAND_CERTIFICATE)
//                            .fileSize(1024L)
//                            .build());
//
//                    return propertyRepository.save(property);
//                });
//    }
//
//    private Booking seedBooking(
//            String bookingCode,
//            User guest,
//            Property property,
//            LocalDate checkIn,
//            LocalDate checkOut,
//            BookingStatus status,
//            PaymentStatus paymentStatus,
//            String transactionId
//    ) {
//        return bookingRepository.findByBookingCode(bookingCode).orElseGet(() -> {
//            BigDecimal nights = BigDecimal.valueOf(checkOut.toEpochDay() - checkIn.toEpochDay());
//            BigDecimal subtotal = property.getPricePerNight().multiply(nights);
//            BigDecimal cleaningFee = BigDecimal.valueOf(50000);
//            BigDecimal serviceFee = BigDecimal.valueOf(30000);
//            BigDecimal total = subtotal.add(cleaningFee).add(serviceFee);
//
//            Booking booking = Booking.builder()
//                    .bookingCode(bookingCode)
//                    .checkInDate(checkIn)
//                    .checkOutDate(checkOut)
//                    .numGuests(2)
//                    .numAdults(2)
//                    .numChildren(0)
//                    .numInfants(0)
//                    .pricePerNight(property.getPricePerNight())
//                    .cleaningFee(cleaningFee)
//                    .serviceFee(serviceFee)
//                    .taxAmount(BigDecimal.ZERO)
//                    .discountAmount(BigDecimal.ZERO)
//                    .totalPrice(total)
//                    .status(status)
//                    .paymentStatus(paymentStatus)
//                    .paymentMethod("VNPAY")
//                    .transactionId(transactionId)
//                    .specialRequests("Sample request")
//                    .guestMessage("Sample guest message")
//                    .guest(guest)
//                    .property(property)
//                    .build();
//
//            return bookingRepository.save(booking);
//        });
//    }
//
//    private void seedReview(Booking booking, User guest, Property property) {
//        if (reviewRepository.existsByBookingId(booking.getId())) {
//            return;
//        }
//
//        Review review = Review.builder()
//                .overallRating(BigDecimal.valueOf(4.8))
//                .cleanlinessRating(BigDecimal.valueOf(4.9))
//                .accuracyRating(BigDecimal.valueOf(4.8))
//                .checkinRating(BigDecimal.valueOf(4.7))
//                .communicationRating(BigDecimal.valueOf(5.0))
//                .locationRating(BigDecimal.valueOf(4.8))
//                .valueRating(BigDecimal.valueOf(4.6))
//                .comment("Phong sach se, chu nha ho tro nhanh va than thien")
//                .hostResponse("Cam on ban da o lai, hen gap lai!")
//                .isPublic(true)
//                .isRecommended(true)
//                .user(guest)
//                .property(property)
//                .booking(booking)
//                .build();
//
//        reviewRepository.save(review);
//    }
//
//    private void seedPackageSubscription(Property property, PostingPackage postingPackage) {
//        List<PropertyPackageSubscription> activeSubscriptions =
//                propertyPackageSubscriptionRepository.findByPropertyIdAndIsActiveTrue(property.getId());
//
//        if (!activeSubscriptions.isEmpty()) {
//            return;
//        }
//
//        PropertyPackageSubscription subscription = PropertyPackageSubscription.builder()
//                .property(property)
//                .postingPackage(postingPackage)
//                .startAt(LocalDateTime.now().minusDays(2))
//                .endAt(LocalDateTime.now().plusDays(28))
//                .status(PackageSubscriptionStatus.ACTIVE)
//                .isActive(true)
//                .transactionId("TXN-SUB-SAMPLE-001")
//                .build();
//
//        propertyPackageSubscriptionRepository.save(subscription);
//    }
//}
//
//
