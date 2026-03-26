package sba301.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sba301.backend.constants.ApiPath;
import sba301.backend.dto.response.ApiResponse;
import sba301.backend.dto.response.CategoryResponse;
import sba301.backend.entity.Category;
import sba301.backend.mapper.PropertyMapper;
import sba301.backend.repository.CategoryRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(ApiPath.CATEGORY)
@RequiredArgsConstructor
@Slf4j
public class CategoryController {
    private final CategoryRepository categoryRepository;
    private final PropertyMapper propertyMapper;
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(propertyMapper::toCategoryResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/with-count")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesWithCount() {
        List<Object[]> results = categoryRepository.findAllWithPropertyCount();
        List<CategoryResponse> categories = results.stream()
                .map(row -> {
                    CategoryResponse dto = propertyMapper.toCategoryResponse((Category) row[0]);
                    dto.setPropertyCount((Long) row[1]);
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

}
