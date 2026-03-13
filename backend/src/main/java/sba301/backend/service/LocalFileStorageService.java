package sba301.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Fallback service for local file storage
 * Used when Cloudinary is not enabled
 */
@Service
@Slf4j
public class LocalFileStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * Save file to local storage
     * @param file MultipartFile to save
     * @param folder Sub-folder (images, videos, etc.)
     * @return Map with url and file info
     */
    public Map<String, Object> saveFile(MultipartFile file, String folder) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        // Validate file type and size
        String contentType = file.getContentType();
        if (contentType != null) {
            if (contentType.startsWith("image/")) {
                // Max 10MB for images
                if (file.getSize() > 10 * 1024 * 1024) {
                    throw new IOException("Image size must not exceed 10MB");
                }
            } else if (contentType.startsWith("video/")) {
                // Max 100MB for videos
                if (file.getSize() > 100 * 1024 * 1024) {
                    throw new IOException("Video size must not exceed 100MB");
                }
            } else {
                throw new IOException("Only image and video files are supported");
            }
        }

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir, folder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        String filename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Build URL
        String fileUrl = String.format("http://localhost:%s/uploads/%s/%s", serverPort, folder, filename);

        // Determine media type
        String mediaType = "IMAGE";
        if (file.getContentType() != null) {
            if (file.getContentType().startsWith("video/")) {
                mediaType = "VIDEO";
            }
        }

        // Return info
        Map<String, Object> result = new HashMap<>();
        result.put("url", fileUrl);
        result.put("filename", filename);
        result.put("originalFilename", originalFilename);
        result.put("size", file.getSize());
        result.put("mediaType", mediaType);
        result.put("format", extension.replace(".", ""));

        log.info("Saved file locally: {} ({})", filename, formatFileSize(file.getSize()));
        return result;
    }

    /**
     * Delete file from local storage
     */
    public void deleteFile(String folder, String filename) throws IOException {
        Path filePath = Paths.get(uploadDir, folder, filename);
        Files.deleteIfExists(filePath);
        log.info("Deleted file: {}/{}", folder, filename);
    }

    /**
     * Format file size for logging
     */
    private String formatFileSize(long size) {
        if (size < 1024) return size + " B";
        if (size < 1024 * 1024) return String.format("%.2f KB", size / 1024.0);
        return String.format("%.2f MB", size / (1024.0 * 1024.0));
    }
}

