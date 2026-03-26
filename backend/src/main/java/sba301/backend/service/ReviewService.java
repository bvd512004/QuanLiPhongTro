package sba301.backend.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import sba301.backend.dto.request.HostReviewReplyRequest;
import sba301.backend.dto.response.HostReviewResponse;
import sba301.backend.dto.response.PageResponse;
import sba301.backend.entity.Review;
import sba301.backend.repository.ReviewRepository;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewService {

    ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public PageResponse<HostReviewResponse> getHostReviews(Long hostId, int page, int size, Long propertyId, Integer rating) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 50));

        BigDecimal minRating = null;
        BigDecimal maxRating = null;
        if (rating != null) {
            if (rating < 1 || rating > 5) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating filter must be between 1 and 5");
            }
            minRating = BigDecimal.valueOf(rating);
            maxRating = BigDecimal.valueOf(rating + 1L);
        }

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<HostReviewResponse> reviewPage = reviewRepository.findHostReviews(hostId, propertyId, minRating, maxRating, pageable);
        return PageResponse.from(reviewPage);
    }

    @Transactional
    public HostReviewResponse replyToReview(Long hostId, Long reviewId, HostReviewReplyRequest request) {
        String content = request.getHostResponse() == null ? "" : request.getHostResponse().trim();
        if (content.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Host response must not be blank");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        Long reviewHostId = review.getProperty().getHost().getId();
        if (!hostId.equals(reviewHostId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to reply to this review");
        }

        review.setHostResponse(content);
        Review savedReview = reviewRepository.save(review);

        return HostReviewResponse.builder()
                .id(savedReview.getId())
                .overallRating(savedReview.getOverallRating())
                .comment(savedReview.getComment())
                .hostResponse(savedReview.getHostResponse())
                .createdAt(savedReview.getCreatedAt())
                .propertyId(savedReview.getProperty().getId())
                .propertyTitle(savedReview.getProperty().getTitle())
                .guestId(savedReview.getUser().getId())
                .guestFirstName(savedReview.getUser().getFirstName())
                .guestLastName(savedReview.getUser().getLastName())
                .guestAvatarUrl(savedReview.getUser().getAvatarUrl())
                .build();
    }
}

