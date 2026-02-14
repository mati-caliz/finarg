package com.finarg.news.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.news.dto.AiAnalysisDTO;
import com.finarg.news.enums.AiSentiment;
import com.finarg.news.enums.NewsCategory;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class OllamaClient {

    private final WebClient webClient;
    private static final String DEFAULT_MODEL = "llama3.2:1b";
    private static final int MAX_TOKENS = 500;

    public OllamaClient(@Qualifier("ollamaWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public AiAnalysisDTO analyzeArticle(String title, String content) {
        try {
            String prompt = buildAnalysisPrompt(title, content);
            String response = generateCompletion(prompt);
            return parseAnalysisResponse(response);
        } catch (Exception e) {
            log.error("Error analyzing article with Ollama: {}", e.getMessage());
            return createFallbackAnalysis();
        }
    }

    private String buildAnalysisPrompt(String title, String content) {
        return String.format("""
            Eres un analista financiero especializado en economía argentina.
            Analiza el siguiente artículo y proporciona:

            1. RESUMEN: Un resumen de 2-3 oraciones (máximo 150 palabras)
            2. SENTIMIENTO: POSITIVO, NEGATIVO, NEUTRAL o MIXTO
            3. CATEGORIA: Una de estas categorías:
               - EXCHANGE_RATE (tipo de cambio, dólar)
               - MONETARY_POLICY (política monetaria, tasas, BCRA)
               - INFLATION (inflación, precios, IPC)
               - RESERVES (reservas internacionales)
               - FISCAL_POLICY (impuestos, gasto público, déficit)
               - FINANCIAL_MARKETS (bolsa, bonos, acciones)
               - ECONOMY_GENERAL (economía general)
               - CRYPTO (criptomonedas)
               - INTERNATIONAL (economía internacional)
            4. PUNTOS_CLAVE: 3-5 puntos clave separados por punto y coma

            Título: %s

            Contenido: %s

            Responde EXACTAMENTE en este formato:
            RESUMEN: [tu resumen]
            SENTIMIENTO: [POSITIVO/NEGATIVO/NEUTRAL/MIXTO]
            CATEGORIA: [categoría]
            PUNTOS_CLAVE: [punto 1; punto 2; punto 3]
            """, title, truncateContent(content));
    }

    private String generateCompletion(String prompt) {
        OllamaRequest request = new OllamaRequest(DEFAULT_MODEL, prompt, false, MAX_TOKENS);

        OllamaResponse response = webClient.post()
                .uri("/api/generate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(OllamaResponse.class)
                .block();

        return response != null ? response.getResponse() : "";
    }

    private AiAnalysisDTO parseAnalysisResponse(String response) {
        String summary = extractField(response, "RESUMEN");
        AiSentiment sentiment = parseSentiment(extractField(response, "SENTIMIENTO"));
        NewsCategory category = parseCategory(extractField(response, "CATEGORIA"));
        List<String> keyPoints = parseKeyPoints(extractField(response, "PUNTOS_CLAVE"));

        return AiAnalysisDTO.builder()
                .summary(summary.isEmpty() ? "Análisis no disponible" : summary)
                .sentiment(sentiment)
                .category(category)
                .keyPoints(keyPoints)
                .build();
    }

    private String extractField(String response, String fieldName) {
        Pattern pattern = Pattern.compile(
            fieldName + ":\\s*(.+?)(?=\\n[A-Z_]+:|$)",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        );
        Matcher matcher = pattern.matcher(response);
        return matcher.find() ? matcher.group(1).trim() : "";
    }

    private AiSentiment parseSentiment(String sentimentStr) {
        String normalized = sentimentStr.toUpperCase().trim();
        if (normalized.contains("POSITIVO") || normalized.contains("POSITIVE")) {
            return AiSentiment.POSITIVE;
        } else if (normalized.contains("NEGATIVO") || normalized.contains("NEGATIVE")) {
            return AiSentiment.NEGATIVE;
        } else if (normalized.contains("MIXTO") || normalized.contains("MIXED")) {
            return AiSentiment.MIXED;
        }
        return AiSentiment.NEUTRAL;
    }

    private NewsCategory parseCategory(String categoryStr) {
        try {
            return NewsCategory.valueOf(categoryStr.toUpperCase().trim());
        } catch (Exception e) {
            return NewsCategory.ECONOMY_GENERAL;
        }
    }

    private List<String> parseKeyPoints(String keyPointsStr) {
        return Arrays.stream(keyPointsStr.split(";"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .limit(5)
                .toList();
    }

    private String truncateContent(String content) {
        return content.length() > 2000
            ? content.substring(0, 2000) + "..."
            : content;
    }

    private AiAnalysisDTO createFallbackAnalysis() {
        return AiAnalysisDTO.builder()
                .summary("Análisis automático no disponible")
                .sentiment(AiSentiment.NEUTRAL)
                .category(NewsCategory.ECONOMY_GENERAL)
                .keyPoints(List.of())
                .build();
    }

    @Data
    static class OllamaRequest {
        private String model;
        private String prompt;
        private boolean stream;

        @JsonProperty("num_predict")
        private int numPredict;

        OllamaRequest(String model, String prompt, boolean stream, int numPredict) {
            this.model = model;
            this.prompt = prompt;
            this.stream = stream;
            this.numPredict = numPredict;
        }
    }

    @Data
    static class OllamaResponse {
        private String model;
        private String response;
        private boolean done;
    }
}
