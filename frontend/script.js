const API_URL = "http://localhost:8080/api/chat";

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    const message = messageInput.value.trim();

    if (message === "") {
        return;
    }

    // Show user message
    addMessage(message, "user");

    // Clear input
    messageInput.value = "";

    // Reset textarea height
    messageInput.style.height = "auto";

    // Disable input while waiting
    sendButton.disabled = true;
    messageInput.disabled = true;

    // Show typing animation
    showTyping();

    try {

        console.log("Sending message to:", API_URL);

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });


        console.log("HTTP status:", response.status);


        // Try to read JSON
        const data = await response.json();

        console.log("Backend response:", data);


        // Remove typing
        removeTyping();


        if (!response.ok) {

            const errorMessage =
                data.error ||
                data.message ||
                "Server returned an error.";

            addMessage(
                "❌ " + errorMessage,
                "bot"
            );

            return;
        }


        /*
         * Your ChatResponse.java returns:
         *
         * {
         *     "response": "..."
         * }
         */

        if (data.response) {

            addMessage(
                data.response,
                "bot"
            );

        } else {

            addMessage(
                "Gemini returned an empty response.",
                "bot"
            );
        }


    } catch (error) {

        console.error("Connection error:", error);

        removeTyping();

        addMessage(
            "❌ Cannot connect to the backend.\n\n" +
            "Make sure Spring Boot is running on:\n" +
            "http://localhost:8080",
            "bot"
        );

    } finally {

        sendButton.disabled = false;

        messageInput.disabled = false;

        messageInput.focus();
    }
}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(message, sender) {

    const messageDiv = document.createElement("div");

    messageDiv.classList.add("message");


    if (sender === "user") {

        messageDiv.classList.add("user-message");

        messageDiv.innerHTML = `

            <div class="message-body">

                <div class="name">
                    You
                </div>

                <div class="bubble">
                    ${formatText(message)}
                </div>

            </div>

        `;

    } else {

        messageDiv.classList.add("bot-message");

        messageDiv.innerHTML = `

            <div class="avatar">
                C
            </div>

            <div class="message-body">

                <div class="name">
                    Cursio
                </div>

                <div class="bubble">
                    ${formatText(message)}
                </div>

            </div>

        `;
    }


    chatBox.appendChild(messageDiv);

    scrollToBottom();
}


/* =========================
   FORMAT TEXT
========================= */

function formatText(text) {

    // Escape HTML
    const div = document.createElement("div");

    div.textContent = text;

    let safeText = div.innerHTML;

    // Convert new lines
    safeText = safeText.replace(/\n/g, "<br>");

    return safeText;
}


/* =========================
   TYPING
========================= */

function showTyping() {

    // Prevent duplicate typing
    if (document.getElementById("typingMessage")) {
        return;
    }


    const typingDiv = document.createElement("div");

    typingDiv.id = "typingMessage";

    typingDiv.classList.add("message", "bot-message");


    typingDiv.innerHTML = `

        <div class="avatar">
            C
        </div>

        <div class="message-body">

            <div class="name">
                Cursio
            </div>

            <div class="bubble typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;


    chatBox.appendChild(typingDiv);

    scrollToBottom();
}


/* =========================
   REMOVE TYPING
========================= */

function removeTyping() {

    const typing = document.getElementById("typingMessage");

    if (typing) {
        typing.remove();
    }
}


/* =========================
   SCROLL
========================= */

function scrollToBottom() {

    chatBox.scrollTop = chatBox.scrollHeight;
}


/* =========================
   NEW CHAT
========================= */

function newChat() {

    chatBox.innerHTML = `

        <div class="message bot-message">

            <div class="avatar">
                C
            </div>

            <div class="message-body">

                <div class="name">
                    Cursio
                </div>

                <div class="bubble">

                    <p>
                        Hello! 👋
                    </p>

                    <p>
                        New conversation started.
                        How can I help you?
                    </p>

                </div>

            </div>

        </div>

    `;
}


/* =========================
   ENTER KEY
========================= */

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter" && !event.shiftKey) {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================
   AUTO RESIZE TEXTAREA
========================= */

messageInput.addEventListener(
    "input",
    function() {

        this.style.height = "auto";

        this.style.height =
            Math.min(this.scrollHeight, 150) + "px";

    }
);