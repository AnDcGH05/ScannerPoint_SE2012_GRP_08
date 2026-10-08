package common.storage;

import common.exception.BadRequestException;
import common.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Saves uploaded documents and payment slips under {@code app.upload-dir}.
 * Only PDF, JPG and PNG up to 5 MB are accepted; files are renamed with a UUID
 * so a customer can never overwrite somebody else's file.
 *
 * The database stores paths like {@code uploads/slips/1a2b...jpg}.
 */
@Service
public class FileStorageService {

    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Map<String, String> ALLOWED = Map.of(
            "application/pdf", "pdf",
            "image/jpeg", "jpg",
            "image/png", "png");

    private final Path root;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.root = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    /** @param folder sub-folder such as "documents" or "slips" */
    public String store(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please choose a file to upload");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("The file is larger than 5 MB");
        }
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        String ext = ALLOWED.get(type);
        if (ext == null) {
            throw new BadRequestException("Only PDF, JPG or PNG files are allowed");
        }
        String name = UUID.randomUUID() + "." + ext;
        try {
            Path dir = root.resolve(folder);
            Files.createDirectories(dir);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Could not save the file", e);
        }
        return "uploads/" + folder + "/" + name;
    }

    public Resource load(String storedPath) {
        Path file = resolve(storedPath);
        if (!Files.isRegularFile(file)) {
            throw new NotFoundException("The file is no longer on the server");
        }
        return new PathResource(file);
    }

    public MediaType mediaType(String storedPath) {
        String p = storedPath.toLowerCase(Locale.ROOT);
        if (p.endsWith(".pdf")) return MediaType.APPLICATION_PDF;
        if (p.endsWith(".png")) return MediaType.IMAGE_PNG;
        return MediaType.IMAGE_JPEG;
    }

    public void delete(String storedPath) {
        try {
            Files.deleteIfExists(resolve(storedPath));
        } catch (IOException ignored) {
            // the database row is what matters; a left-over file is harmless
        }
    }

    private Path resolve(String storedPath) {
        String relative = storedPath.startsWith("uploads/") ? storedPath.substring("uploads/".length()) : storedPath;
        Path file = root.resolve(relative).normalize();
        if (!file.startsWith(root)) {
            throw new BadRequestException("Invalid file path");
        }
        return file;
    }
}
