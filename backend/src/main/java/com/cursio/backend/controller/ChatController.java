package com.cursio.backend.controller;

import com.cursio.backend.model.ChatRequest;
import com.cursio.backend.model.ChatResponse;
import com.cursio.backend.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request) {

        String response = chatService.chat(request.getMessage());

        return ResponseEntity.ok(
                new ChatResponse(response)
        );
    }
}