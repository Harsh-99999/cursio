package com.cursio.backend.service;

import com.cursio.backend.client.GeminiClient;
import com.cursio.backend.model.Conversation;
import com.cursio.backend.model.Message;
import com.cursio.backend.repository.ConversationRepository;
import com.cursio.backend.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final GeminiClient geminiClient;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    private Long currentConversationId = null;

    public ChatService(
            GeminiClient geminiClient,
            ConversationRepository conversationRepository,
            MessageRepository messageRepository
    ) {
        this.geminiClient = geminiClient;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    public String chat(String prompt) {

        // Create conversation only once
        Conversation conversation;

        if (currentConversationId == null) {

            conversation = new Conversation();

            conversation.setTitle(
                    prompt.length() > 50
                            ? prompt.substring(0, 50)
                            : prompt
            );

            conversation = conversationRepository.save(conversation);

            currentConversationId = conversation.getId();

        } else {

            conversation = conversationRepository
                    .findById(currentConversationId)
                    .orElseThrow(() ->
                            new RuntimeException("Conversation not found")
                    );
        }

        // Save user's message
        Message userMessage = new Message();

        userMessage.setRole("user");
        userMessage.setContent(prompt);
        userMessage.setConversation(conversation);

        messageRepository.save(userMessage);

        // Get previous messages
        List<Message> previousMessages =
                messageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                currentConversationId
                        );

        // Build prompt containing conversation history
        StringBuilder fullPrompt = new StringBuilder();

        fullPrompt.append("""
                You are Cursio, a helpful AI assistant.

                Continue the conversation naturally.
                Use the previous messages to understand context.

                Conversation:
                """);

        for (Message message : previousMessages) {

            fullPrompt.append("\n")
                    .append(message.getRole())
                    .append(": ")
                    .append(message.getContent());
        }

        fullPrompt.append("\nassistant: ");

        // Ask Gemini
        String response =
                geminiClient.generateContent(fullPrompt.toString());

        // Save assistant response
        Message assistantMessage = new Message();

        assistantMessage.setRole("assistant");
        assistantMessage.setContent(response);
        assistantMessage.setConversation(conversation);

        messageRepository.save(assistantMessage);

        return response;
    }

    public List<Message> getMessages(Long conversationId) {

        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(
                        conversationId
                );
    }
}