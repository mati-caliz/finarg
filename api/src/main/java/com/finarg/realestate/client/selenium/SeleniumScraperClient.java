package com.finarg.realestate.client.selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

@Slf4j
@Component
public class SeleniumScraperClient {

    private static final List<String> USER_AGENTS = Arrays.asList(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
    );

    private static final int PAGES_BEFORE_ROTATION = 5;
    private static final int MAX_RETRIES = 3;
    private static final int INITIAL_BACKOFF_MS = 2000;

    private final Random random = new Random();
    private final List<String> proxies = new ArrayList<>();

    private WebDriver driver;
    private int pagesScraped = 0;
    private int currentProxyIndex = 0;

    @PostConstruct
    public void init() {
        try {
            log.info("Initializing Selenium WebDriver for scraping");

            loadProxies();

            WebDriverManager.chromedriver().setup();
            log.info("ChromeDriver configured automatically for installed Chrome version");

            initializeDriver();

            log.info("Selenium WebDriver initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize Selenium WebDriver: {}", e.getMessage(), e);
            log.warn("Scraping with Selenium will not be available.");
        }
    }

    private void loadProxies() {
        String proxyList = System.getenv("SCRAPER_PROXIES");
        if (proxyList != null && !proxyList.isEmpty()) {
            String[] proxyArray = proxyList.split(",");
            for (String proxy : proxyArray) {
                String trimmed = proxy.trim();
                if (!trimmed.isEmpty()) {
                    proxies.add(trimmed);
                }
            }
            log.info("Loaded {} proxies for rotation", proxies.size());
        } else {
            log.info("No proxies configured. Running without proxy rotation.");
        }
    }

    private void initializeDriver() {
        ChromeOptions options = new ChromeOptions();

            String sessionId = String.valueOf(System.currentTimeMillis());
            options.addArguments("user-data-dir=/tmp/chrome-profile-scraper-" + sessionId);

            String userAgent = USER_AGENTS.get(random.nextInt(USER_AGENTS.size()));
            options.addArguments("--user-agent=" + userAgent);
            log.debug("Using User-Agent: {}", userAgent);

            if (!proxies.isEmpty()) {
                String proxy = proxies.get(currentProxyIndex);
                options.addArguments("--proxy-server=" + proxy);
                log.info("Using proxy: {}", proxy);
                currentProxyIndex = (currentProxyIndex + 1) % proxies.size();
            }

            options.addArguments("--headless");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--disable-blink-features=AutomationControlled");
            options.addArguments("--disable-web-security");
            options.addArguments("--disable-features=IsolateOrigins,site-per-process");
            options.addArguments("--window-size=1920,1080");

            List<String> excludeSwitches = Arrays.asList("enable-automation", "enable-logging");
            options.setExperimentalOption("excludeSwitches", excludeSwitches);
            options.setExperimentalOption("useAutomationExtension", false);

            Map<String, Object> prefs = new HashMap<>();
            prefs.put("credentials_enable_service", false);
            prefs.put("profile.password_manager_enabled", false);
            prefs.put("profile.default_content_setting_values.notifications", 2);
            prefs.put("profile.managed_default_content_settings.images", 2);
            options.setExperimentalOption("prefs", prefs);

            driver = new ChromeDriver(options);

            try {
                String script = "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
                        + "Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});"
                        + "Object.defineProperty(navigator, 'languages', {get: () => ['es-AR', 'es', 'en']});"
                        + "window.chrome = {runtime: {}};"
                        + "Object.defineProperty(navigator, 'permissions', "
                        + "{get: () => ({query: () => Promise.resolve({state: 'granted'})})});";
                ((JavascriptExecutor) driver).executeScript(script);
                log.info("Anti-bot JavaScript injection successful");
            } catch (Exception e) {
                log.warn("Could not inject anti-bot script: {}", e.getMessage());
            }

            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(60));
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
    }

    private void rotateSessionIfNeeded() {
        pagesScraped++;
        if (pagesScraped >= PAGES_BEFORE_ROTATION) {
            log.info("Rotating Selenium session after {} pages", pagesScraped);
            closeDriver();
            try {
                Thread.sleep(3000 + random.nextInt(3000));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            initializeDriver();
            pagesScraped = 0;
        }
    }

    private void closeDriver() {
        if (driver != null) {
            try {
                driver.quit();
                log.debug("WebDriver closed for rotation");
            } catch (Exception e) {
                log.debug("Error closing WebDriver: {}", e.getMessage());
            }
            driver = null;
        }
    }

    public String fetchPageSource(String url) {
        return fetchPageSourceWithRetry(url, 0);
    }

    private String fetchPageSourceWithRetry(String url, int attemptNumber) {
        if (driver == null) {
            log.warn("Selenium WebDriver not available for URL: {}", url);
            return null;
        }

        try {
            if (attemptNumber > 0) {
                int backoffMs = INITIAL_BACKOFF_MS * (int) Math.pow(2, attemptNumber - 1);
                log.info("Retry attempt {} for {}, waiting {} ms", attemptNumber, url, backoffMs);
                Thread.sleep(backoffMs);
            }

            log.debug("Fetching page with Selenium: {}", url);

            Thread.sleep(1000 + random.nextInt(2000));

            driver.get(url);

            try {
                String reinjectScript = "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
                        + "delete navigator.__webdriver_script_fn;";
                ((JavascriptExecutor) driver).executeScript(reinjectScript);
            } catch (Exception e) {
                log.debug("Could not re-inject anti-bot script: {}", e.getMessage());
            }

            waitForCloudflareBypass();

            humanLikeBehavior();

            String pageSource = driver.getPageSource();

            if (isBlocked(Objects.requireNonNull(driver.getTitle()), pageSource)) {
                log.warn("Still blocked by Cloudflare after waiting. Manual intervention might be needed.");
                Thread.sleep(10000);
                pageSource = driver.getPageSource();

                if (isBlocked(driver.getTitle(), pageSource) && attemptNumber < MAX_RETRIES) {
                    log.warn("Page still blocked after waiting. Retrying with new session...");
                    closeDriver();
                    initializeDriver();
                    return fetchPageSourceWithRetry(url, attemptNumber + 1);
                }
            }

            saveHtmlToFile(url, pageSource);
            rotateSessionIfNeeded();
            return pageSource;

        } catch (Exception e) {
            log.error("Error fetching page with Selenium: {}", e.getMessage());

            if (attemptNumber < MAX_RETRIES) {
                log.info("Retrying due to error (attempt {}/{})", attemptNumber + 1, MAX_RETRIES);
                closeDriver();
                initializeDriver();
                return fetchPageSourceWithRetry(url, attemptNumber + 1);
            }

            return null;
        }
    }

    private void waitForCloudflareBypass() {
        try {
            new WebDriverWait(driver, Duration.ofSeconds(20)).until(d -> {
                String title = d.getTitle();
                assert title != null;
                return !title.contains("Un momento")
                        && !title.contains("Just a moment")
                        && !title.contains("Verificación de seguridad");
            });
            log.info("Cloudflare challenge passed (or not present).");
        } catch (Exception e) {
            log.warn("Timeout waiting for Cloudflare bypass. Manual intervention might be needed.");
        }
    }

    private void humanLikeBehavior() {
        try {
            JavascriptExecutor js = (JavascriptExecutor) driver;

            Thread.sleep(1500 + random.nextInt(1500));

            long height = (long) js.executeScript("return document.body.scrollHeight");

            int scrollSteps = 3 + random.nextInt(3);
            for (int i = 1; i <= scrollSteps; i++) {
                long target = (height / scrollSteps) * i + random.nextInt(100) - 50;
                js.executeScript("window.scrollTo({top: " + target + ", behavior: 'smooth'});");
                Thread.sleep(800 + random.nextInt(1200));

                if (random.nextInt(100) < 30) {
                    int scrollBack = 50 + random.nextInt(100);
                    js.executeScript("window.scrollBy(0, -" + scrollBack + ");");
                    Thread.sleep(400 + random.nextInt(400));
                }
            }

            long intermediatePos = (long) (height * 0.4 + random.nextInt(200));
            js.executeScript("window.scrollTo({top: " + intermediatePos + ", behavior: 'smooth'});");
            Thread.sleep(500 + random.nextInt(500));

            int mouseX = 100 + random.nextInt(800);
            int mouseY = 100 + random.nextInt(600);
            String mouseScript = "document.dispatchEvent(new MouseEvent('mousemove', {"
                    + "clientX: " + mouseX + ", clientY: " + mouseY + "}));";
            js.executeScript(mouseScript);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.debug("Human behavior simulation error: {}", e.getMessage());
        }
    }

    private boolean isBlocked(String title, String source) {
        return (title.contains("Un momento") && source.length() < 50000)
                || (title.contains("Just a moment") && source.length() < 50000)
                || (source.contains("Verificación de seguridad en curso"));
    }

    private void saveHtmlToFile(String url, String html) {
        try {
            String filename = url.replaceAll("[^a-zA-Z0-9-]", "_") + ".html";
            String filepath = "/tmp/scraper_" + filename;
            java.nio.file.Files.writeString(
                    java.nio.file.Paths.get(filepath),
                    html,
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.TRUNCATE_EXISTING
            );
            log.info("Saved HTML to: {}", filepath);
        } catch (Exception e) {
            log.debug("Could not save HTML to file: {}", e.getMessage());
        }
    }

    public boolean isAvailable() {
        return driver != null;
    }

    @PreDestroy
    public void cleanup() {
        log.info("Closing Selenium WebDriver");
        closeDriver();
    }
}
