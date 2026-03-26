package sba301.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import sba301.backend.constants.ApiPath;
import sba301.backend.dto.request.HostReviewReplyRequest;
import sba301.backend.dto.response.ApiResponse;
import sba301.backend.dto.response.HostReviewResponse;
import sba301.backend.dto.response.PageResponse;
import sba301.backend.service.CustomUserDetailsService;
import sba301.backend.service.ReviewService;

@RestController
@RequestMapping(ApiPath.REVIEW)
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<PageResponse<HostReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long propertyId,
            @RequestParam(required = false) Integer rating) {
        PageResponse<HostReviewResponse> reviews = reviewService.getHostReviews(currentUser.getId(), page, size, propertyId, rating);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PutMapping("/{reviewId}/host-response")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ApiResponse<HostReviewResponse>> replyToReview(
            @AuthenticationPrincipal CustomUserDetailsService.UserPrincipal currentUser,
            @PathVariable Long reviewId,
            @Valid @RequestBody HostReviewReplyRequest request) {
        HostReviewResponse updatedReview = reviewService.replyToReview(currentUser.getId(), reviewId, request);
        return ResponseEntity.ok(ApiResponse.success("Review response updated", updatedReview));
    }
}

