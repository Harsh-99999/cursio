package com.cursio.backend.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class GeminiClient {

    private final RestClient restClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String MODEL = "gemini-3.1-flash-lite";

    public GeminiClient() {
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String generateContent(String prompt) {

        String url = "/v1beta/models/" + MODEL
                + ":generateContent?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        try {

            Map<?, ?> response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                throw new RuntimeException("Empty response from Gemini");
            }

            return extractText(response);

        } catch (Exception e) {
            e.printStackTrace();

            throw new RuntimeException(
                    "Failed to communicate with Gemini: " + e.getMessage(),
                    e
            );
        }
    }

    private String extractText(Map<?, ?> response) {

        Object candidatesObject = response.get("candidates");

        if (!(candidatesObject instanceof List<?> candidates)
                || candidates.isEmpty()) {

            throw new RuntimeException(
                    "Gemini returned no candidates: " + response
            );
        }

        Object candidateObject = candidates.get(0);

        if (!(candidateObject instanceof Map<?, ?> candidate)) {
            throw new RuntimeException("Invalid Gemini response");
        }

        Object contentObject = candidate.get("content");

        if (!(contentObject instanceof Map<?, ?> content)) {
            throw new RuntimeException(
                    "Gemini response has no content: " + response
            );
        }

        Object partsObject = content.get("parts");

        if (!(partsObject instanceof List<?> parts)
                || parts.isEmpty()) {

            throw new RuntimeException(
                    "Gemini response has no parts: " + response
            );
        }

        Object partObject = parts.get(0);

        if (!(partObject instanceof Map<?, ?> part)) {
            throw new RuntimeException("Invalid Gemini part");
        }

        Object text = part.get("text");

        if (text == null) {
            throw new RuntimeException(
                    "Gemini returned no text: " + response
            );
        }

        return text.toString();
    }
}