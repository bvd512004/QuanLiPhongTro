# Entities overview — QuanLiPhongTro backend

Tài liệu này tóm tắt các entity chính trong `sba301.backend.entity` và mối quan hệ giữa chúng. Mục tiêu: giúp teammate hiểu model nhanh và dễ bắt đầu phát triển.

---

## Quy ước chung
- `BaseEntity` cung cấp `id`, `createdAt`, `updatedAt`, `isDeleted`.
- JPA annotations: @ManyToOne, @OneToMany, @ManyToMany, @OneToOne.
- Trường tên bảng theo annotation `@Table(name = "...")`.

---

## Danh sách entity chính (mô tả ngắn)

1. `User` (bảng `users`)
   - Các trường chính: `email`, `password`, `firstName`, `lastName`, `phone`, `avatarUrl`, `dateOfBirth`, `isHost`, `isActive`, v.v.
   - Quan hệ:
     - Nhiều `Role` (user_roles) — @ManyToMany
     - 1 user (host) có nhiều `Property` — @OneToMany(mappedBy = "host")
     - 1 user (guest) có nhiều `Booking` — @OneToMany(mappedBy = "guest")
     - 1 user có nhiều `Review`, `Favorite`.

2. `Role` (bảng `roles`)
   - Mô tả role của user (ví dụ ADMIN, HOST, USER) — liên kết ManyToMany với `User`.

3. `Property` (bảng `properties`)
   - Các trường chính: `title`, `description`, `address`, `city`, `pricePerNight`, `status`, `isFeatured`, v.v.
   - Quan hệ:
     - N thuộc `PropertyImage` — danh sách ảnh.
     - N thuộc `Amenity` — ManyToMany (bảng trung gian `property_amenities`).
     - 1 `Category` (ManyToOne)
     - 1 `User` (host) — ManyToOne
     - N `Booking`, N `Review`, N `Favorite` — OneToMany
     - N `PropertyPackageSubscription` — OneToMany (mối quan hệ mới, lưu lịch sử gói)

4. `PropertyImage` (bảng `property_images`)
   - Lưu ảnh, cờ `isPrimary`, `displayOrder`.
   - ManyToOne -> `Property`.

5. `Amenity` (bảng `amenities`) và `Category` (bảng `categories`)
   - Các bảng tham chiếu dữ liệu mô tả tiện nghi và danh mục.

6. `Booking` (bảng `bookings`)
   - Chứa thông tin đặt phòng: checkInDate, checkOutDate, numNights, totalPrice, status, paymentStatus, transactionId, v.v.
   - Quan hệ: ManyToOne -> `User` (guest), ManyToOne -> `Property`, OneToOne -> `Review`.

7. `Review` (bảng `reviews`)
   - Review của khách cho booking/property.
   - Quan hệ: ManyToOne -> `Property`, ManyToOne -> `User`.

8. `Favorite` (bảng `favorites`)
   - Lưu bookmark user -> property.

9. `Conversation` / `Message`
   - Dùng cho chat giữa host và guest (nếu có): Conversation chứa Message.

10. Posting packages (Mới)
   - `PostingPackage` (bảng `posting_packages`)
     - Mô tả gói đăng tin (ví dụ Tin Thường, VIP Bạc, VIP Vàng, VIP Kim Cương).
     - Trường chính: `name`, `slug`, `description`, `price` (BigDecimal), `durationDays`, `priorityLevel`, `isActive`, `features`.
     - Quan hệ: OneToMany -> `PropertyPackageSubscription`.

   - `PropertyPackageSubscription` (bảng `property_package_subscriptions`)
     - Lưu một lần gán gói cho property, có ngày bắt đầu / kết thúc, trạng thái.
     - Trường chính: `postingPackage` (ManyToOne), `property` (ManyToOne), `startAt`, `endAt`, `isActive`, `transactionId`, `status` (enum `PackageSubscriptionStatus`).

---

## Quan hệ tóm tắt (ER diagram — ASCII)

Entities (chỉ lấy các thực thể chính):

User           Role
  | M:N         / (user_roles)
  |           /
  |         /
  |       /
  |     /
  |   /
  v v
Property ---< PropertyImage
  ^  \
  |   > Booking
  |   > Review
  |   > Favorite
  |
  +--< PropertyPackageSubscription >-- PostingPackage

Cách đọc:
- `A ---< B` nghĩa: A (1) to B (many)
- `A < > B` nghĩa many-to-many

Chi tiết ví dụ (một số mũi tên cụ thể):
- `User (host) 1 ----* Property`
- `Property 1 ----* PropertyImage`
- `Property 1 ----* Booking` và `Booking * ----1 User (guest)`
- `PostingPackage 1 ----* PropertyPackageSubscription * ----1 Property` (nối nhiều-nhiều theo thời gian: mỗi subscription là 1 lần gán gói cho 1 property)

---

## Next steps đề xuất
- Tạo REST API/Service để:
  - Quản trị (CRUD) `PostingPackage` (admin)
  - Host chọn gói (tạo `PropertyPackageSubscription`), xem gói hiện tại của property
  - Endpoint trả về các gói để frontend hiển thị UI giống ảnh
- Scheduler/Job: kiểm tra các `PropertyPackageSubscription` hết hạn và set `status = EXPIRED`.

---

Nếu bạn muốn, tôi có thể:
- Vẽ sơ đồ ER chi tiết bằng công cụ (PNG) và thêm vào repo.
- Tạo controller + service + DTO cho `PostingPackage` và subscription.
- Thêm migration Flyway chi tiết hơn (hiện đã thêm 2 migration schema + seed cơ bản).

Nếu ok, tôi sẽ tiếp tục (ví dụ tạo API list gói + API để gán gói cho property).
