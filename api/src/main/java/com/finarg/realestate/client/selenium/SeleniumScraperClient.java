package com.finarg.realestate.client.selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Slf4j
@Component
public class SeleniumScraperClient {

    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        + "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

    private WebDriver driver;

    @PostConstruct
    public void init() {
        try {
            log.info("Initializing Selenium WebDriver for scraping");
            WebDriverManager.chromedriver().setup();

            ChromeOptions options = new ChromeOptions();
            options.addArguments("--headless=new");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--disable-gpu");
            options.addArguments("--window-size=1920,1080");
            options.addArguments("--user-agent=" + USER_AGENT);
            options.addArguments("--disable-blink-features=AutomationControlled");
            options.addArguments("--accept-lang=es-AR,es;q=0.9");
            options.setExperimentalOption("excludeSwitches", new String[]{"enable-automation"});
            options.setExperimentalOption("useAutomationExtension", false);

            driver = new ChromeDriver(options);
            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));

            log.info("Selenium WebDriver initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize Selenium WebDriver: {}", e.getMessage());
            log.warn("Scraping with Selenium will not be available. Fallback to simple HTTP scraping");
        }
    }

    public String fetchPageSource(String url) {
        if (driver == null) {
            log.warn("Selenium WebDriver not available for URL: {}", url);
            return null;
        }

        try {
            log.debug("Fetching page with Selenium: {}", url);
            driver.get(url);

            Thread.sleep(10000 + (long) (Math.random() * 3000));

            JavascriptExecutor js = (JavascriptExecutor) driver;

            for (int attempt = 0; attempt < 3; attempt++) {
                js.executeScript("window.scrollTo(0, document.body.scrollHeight * 0.3);");
                Thread.sleep(1500 + (long) (Math.random() * 500));

                js.executeScript("window.scrollTo(0, document.body.scrollHeight * 0.6);");
                Thread.sleep(1500 + (long) (Math.random() * 500));

                js.executeScript("window.scrollTo(0, document.body.scrollHeight);");
                Thread.sleep(2000 + (long) (Math.random() * 500));

                js.executeScript("window.scrollTo(0, 0);");
                Thread.sleep(2000 + (long) (Math.random() * 500));

                String pageSource = driver.getPageSource();
                String pageTitle = driver.getTitle();

                assert pageSource != null;
                log.debug("Attempt {} - Title: '{}', Size: {} bytes", attempt + 1, pageTitle, pageSource.length());

                assert pageTitle != null;
                boolean isCloudflarePage = (pageTitle.contains("Un momento") && pageSource.length() < 50000)
                    || (pageTitle.contains("Just a moment") && pageSource.length() < 50000)
                    || (pageSource.contains("Verificación de seguridad en curso") && pageSource.length() < 100000)
                    || pageSource.length() < 40000;

                if (!isCloudflarePage) {
                    log.info("Successfully bypassed Cloudflare on attempt {}", attempt + 1);
                    saveHtmlToFile(url, pageSource);
                    return pageSource;
                }

                if (attempt < 2) {
                    log.warn("Cloudflare detected on attempt {} (title: '{}', {} bytes), retrying...",
                        attempt + 1, pageTitle, pageSource.length());
                    Thread.sleep(15000 + (long) (Math.random() * 5000));
                } else {
                    log.warn("Still blocked by Cloudflare after {} attempts (title: '{}', {} bytes)",
                        attempt + 1, pageTitle, pageSource.length());
                    saveHtmlToFile(url, pageSource);
                    return pageSource;
                }
            }

            String finalPageSource = driver.getPageSource();
            saveHtmlToFile(url, finalPageSource);
            return finalPageSource;

        } catch (Exception e) {
            log.error("Error fetching page with Selenium: {}", e.getMessage());
            return null;
        }
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
        if (driver != null) {
            log.info("Closing Selenium WebDriver");
            try {
                driver.quit();
            } catch (Exception e) {
                log.error("Error closing WebDriver: {}", e.getMessage());
            }
        }
    }
}
