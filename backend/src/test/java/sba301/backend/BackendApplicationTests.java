package sba301.backend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Disable contextLoads to avoid requiring external MySQL during local dev/CI. Enable when test DB is configured.")
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }

}
