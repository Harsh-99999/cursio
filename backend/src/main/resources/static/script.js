/* =====================================================
   CURSIO AI
   FRONTEND SCRIPT
   ===================================================== */

const API_URL = "/api/chat";
const AUTH_URL = "/auth";


const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const logoutButton = document.getElementById("logoutButton");
const newChatButton = document.getElementById("newChatButton");

const authModal = document.getElementById("authModal");
const closeAuthButton = document.getElementById("closeAuthButton");

const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authSubmitButton = document.getElementById("authSubmitButton");
const authSubmitText = document.getElementById("authSubmitText");

const authSwitchText = document.getElementById("authSwitchText");
const authSwitchButton = document.getElementById("authSwitchButton");

const authError = document.getElementById("authError");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const userStatus = document.getElementById("userStatus");


/* =====================================================
   AUTH MODE
   ===================================================== */

let authMode = "login";


/* =====================================================
   OPEN AUTH MODAL
   ===================================================== */

function openAuthModal(mode) {

    authMode = mode;

    authError.textContent = "";
    authError.style.color = "";

    authForm.reset();


    if (mode === "login") {

        authTitle.textContent =
            "Login to Cursio";

        authSubtitle.textContent =
            "Welcome back!";

        authSubmitText.textContent =
            "Login";

        authSwitchText.textContent =
            "Don't have an account?";

        authSwitchButton.textContent =
            "Register";

        usernameInput.autocomplete =
            "username";

        passwordInput.autocomplete =
            "current-password";

    } else {

        authTitle.textContent =
            "Create your Cursio account";

        authSubtitle.textContent =
            "Join Cursio today.";

        authSubmitText.textContent =
            "Register";

        authSwitchText.textContent =
            "Already have an account?";

        authSwitchButton.textContent =
            "Login";

        usernameInput.autocomplete =
            "username";

        passwordInput.autocomplete =
            "new-password";
    }


    authModal.classList.add("show");

    authModal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(
        () => usernameInput.focus(),
        100
    );
}


/* =====================================================
   CLOSE AUTH MODAL
   ===================================================== */

function closeAuthModal() {

    authModal.classList.remove("show");

    authModal.setAttribute(
        "aria-hidden",
        "true"
    );

    authError.textContent = "";
}


/* =====================================================
   SWITCH AUTH MODE
   ===================================================== */

function switchAuthMode() {

    if (authMode === "login") {

        openAuthModal("register");

    } else {

        openAuthModal("login");
    }
}


/* =====================================================
   MODAL EVENTS
   ===================================================== */

closeAuthButton.addEventListener(
    "click",
    closeAuthModal
);


authModal.addEventListener(
    "click",
    function (event) {

        if (event.target === authModal) {

            closeAuthModal();
        }
    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            authModal.classList.contains("show")
        ) {

            closeAuthModal();
        }
    }
);


/* =====================================================
   AUTH SWITCH BUTTON
   ===================================================== */

authSwitchButton.addEventListener(
    "click",
    switchAuthMode
);


/* =====================================================
   LOGIN / REGISTER FORM
   ===================================================== */

authForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        if (!username || !password) {

            showAuthError(
                "Please enter username and password."
            );

            return;
        }


        if (authMode === "login") {

            await loginUser(
                username,
                password
            );

        } else {

            await registerUser(
                username,
                password
            );
        }
    }
);


/* =====================================================
   AUTH ERROR
   ===================================================== */

function showAuthError(message) {

    authError.style.color = "";
    authError.textContent = message;
}


/* =====================================================
   AUTH LOADING
   ===================================================== */

function setAuthLoading(loading) {

    authSubmitButton.disabled =
        loading;

    authSwitchButton.disabled =
        loading;

    closeAuthButton.disabled =
        loading;


    if (loading) {

        authSubmitText.textContent =
            "Please wait...";

    } else {

        authSubmitText.textContent =
            authMode === "login"
                ? "Login"
                : "Register";
    }
}


/* =====================================================
   REGISTER
   ===================================================== */

async function registerUser(
    username,
    password
) {

    setAuthLoading(true);

    showAuthError("");


    try {

        const response =
            await fetch(
                `${AUTH_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );


        const data =
            await response.text();


        if (!response.ok) {

            showAuthError(
                data ||
                "Registration failed."
            );

            return;
        }


        authError.style.color =
            "#22c55e";

        authError.textContent =
            "Registration successful! You can now login.";


        setTimeout(
            () => {

                openAuthModal("login");

            },
            1000
        );


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        showAuthError(
            "Cannot connect to backend."
        );

    } finally {

        setAuthLoading(false);
    }
}


/* =====================================================
   LOGIN
   ===================================================== */

async function loginUser(
    username,
    password
) {

    setAuthLoading(true);

    showAuthError("");


    try {

        const response =
            await fetch(
                `${AUTH_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            const text =
                await response.text();

            data = {
                message: text
            };
        }


        if (!response.ok) {

            showAuthError(
                data.message ||
                "Invalid username or password."
            );

            return;
        }


        if (!data.token) {

            showAuthError(
                "Login failed: server did not return a token."
            );

            return;
        }


        localStorage.setItem(
            "cursio_token",
            data.token
        );


        localStorage.setItem(
            "cursio_username",
            username
        );


        updateAuthUI();

        closeAuthModal();


        addMessage(
            "You are now logged in. 🔐",
            "bot"
        );


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showAuthError(
            "Cannot connect to backend."
        );

    } finally {

        setAuthLoading(false);
    }
}


/* =====================================================
   LOGOUT
   ===================================================== */

function logoutUser() {

    localStorage.removeItem(
        "cursio_token"
    );

    localStorage.removeItem(
        "cursio_username"
    );


    updateAuthUI();


    addMessage(
        "You have been logged out.",
        "bot"
    );
}


/* =====================================================
   UPDATE AUTH UI
   ===================================================== */

function updateAuthUI() {

    const token =
        localStorage.getItem(
            "cursio_token"
        );

    const username =
        localStorage.getItem(
            "cursio_username"
        );


    if (token) {

        loginButton.style.display =
            "none";

        registerButton.style.display =
            "none";

        logoutButton.style.display =
            "flex";


        userStatus.classList.add(
            "logged-in"
        );


        const statusText =
            userStatus.querySelector(
                ".status-text"
            );


        statusText.textContent =
            username
                ? "Logged in as " + username
                : "Logged in";


    } else {

        loginButton.style.display =
            "flex";

        registerButton.style.display =
            "flex";

        logoutButton.style.display =
            "none";


        userStatus.classList.remove(
            "logged-in"
        );


        const statusText =
            userStatus.querySelector(
                ".status-text"
            );


        statusText.textContent =
            "Not logged in";
    }
}


/* =====================================================
   SEND MESSAGE
   ===================================================== */

async function sendMessage() {

    const message =
        messageInput.value.trim();


    if (!message) {
        return;
    }


    const token =
        localStorage.getItem(
            "cursio_token"
        );


    if (!token) {

        openAuthModal("login");

        return;
    }


    addMessage(
        message,
        "user"
    );


    messageInput.value = "";

    messageInput.style.height =
        "auto";


    sendButton.disabled =
        true;

    messageInput.disabled =
        true;


    showTyping();


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({
                        message
                    })
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            removeTyping();


            clearSession();


            addMessage(
                "Your session has expired. Please login again.",
                "bot"
            );


            openAuthModal("login");

            return;
        }


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            const text =
                await response.text();

            data = {
                message: text
            };
        }


        removeTyping();


        if (!response.ok) {

            addMessage(
                "❌ " +
                (
                    data.message ||
                    "Something went wrong."
                ),
                "bot"
            );

            return;
        }


        if (data.response) {

            addMessage(
                data.response,
                "bot"
            );

        } else {

            addMessage(
                "Cursio returned an empty response.",
                "bot"
            );
        }


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        removeTyping();


        addMessage(
            "❌ Cannot connect to Cursio backend.",
            "bot"
        );

    } finally {

        sendButton.disabled =
            false;

        messageInput.disabled =
            false;

        messageInput.focus();
    }
}


/* =====================================================
   CLEAR SESSION
   ===================================================== */

function clearSession() {

    localStorage.removeItem(
        "cursio_token"
    );

    localStorage.removeItem(
        "cursio_username"
    );

    updateAuthUI();
}


/* =====================================================
   ADD MESSAGE
   ===================================================== */

function addMessage(
    message,
    sender
) {

    const messageDiv =
        document.createElement(
            "div"
        );


    messageDiv.classList.add(
        "message"
    );


    if (sender === "user") {

        messageDiv.classList.add(
            "user-message"
        );


        messageDiv.innerHTML = `

            <div class="message-content">

                <div class="message-header">

                    <span class="message-name">
                        You
                    </span>

                </div>

                <div class="bubble">
                    ${formatText(message)}
                </div>

            </div>

        `;

    } else {

        messageDiv.classList.add(
            "bot-message"
        );


        messageDiv.innerHTML = `

            <div class="avatar">
                C
            </div>

            <div class="message-content">

                <div class="message-header">

                    <span class="message-name">
                        Cursio
                    </span>

                    <span class="message-tag">
                        AI
                    </span>

                </div>

                <div class="bubble">
                    ${formatText(message)}
                </div>

            </div>

        `;
    }


    chatBox.appendChild(
        messageDiv
    );


    scrollToBottom();
}


/* =====================================================
   FORMAT TEXT SAFELY
   ===================================================== */

function formatText(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML.replace(
        /\n/g,
        "<br>"
    );
}


/* =====================================================
   TYPING
   ===================================================== */

function showTyping() {

    if (
        document.getElementById(
            "typingMessage"
        )
    ) {
        return;
    }


    const typingDiv =
        document.createElement(
            "div"
        );


    typingDiv.id =
        "typingMessage";


    typingDiv.classList.add(
        "message",
        "bot-message"
    );


    typingDiv.innerHTML = `

        <div class="avatar">
            C
        </div>

        <div class="message-content">

            <div class="message-header">

                <span class="message-name">
                    Cursio
                </span>

                <span class="message-tag">
                    AI
                </span>

            </div>

            <div class="bubble typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;


    chatBox.appendChild(
        typingDiv
    );


    scrollToBottom();
}


/* =====================================================
   REMOVE TYPING
   ===================================================== */

function removeTyping() {

    const typing =
        document.getElementById(
            "typingMessage"
        );


    if (typing) {

        typing.remove();
    }
}


/* =====================================================
   SCROLL
   ===================================================== */

function scrollToBottom() {

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


/* =====================================================
   NEW CHAT
   ===================================================== */

function newChat() {

    chatBox.innerHTML = `

        <div class="welcome">

            <div class="welcome-logo">
                C
            </div>

            <h2>
                New conversation
            </h2>

            <p>
                Start a new conversation with Cursio
            </p>

        </div>


        <div class="message bot-message">

            <div class="avatar">
                C
            </div>

            <div class="message-content">

                <div class="message-header">

                    <span class="message-name">
                        Cursio
                    </span>

                    <span class="message-tag">
                        AI
                    </span>

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


    scrollToBottom();

    messageInput.focus();
}


/* =====================================================
   ENTER KEY
   ===================================================== */

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


/* =====================================================
   AUTO RESIZE
   ===================================================== */

messageInput.addEventListener(
    "input",
    function () {

        this.style.height =
            "auto";

        this.style.height =
            Math.min(
                this.scrollHeight,
                150
            ) + "px";
    }
);


/* =====================================================
   BUTTON EVENTS
   ===================================================== */

sendButton.addEventListener(
    "click",
    sendMessage
);


loginButton.addEventListener(
    "click",
    () => openAuthModal("login")
);


registerButton.addEventListener(
    "click",
    () => openAuthModal("register")
);


logoutButton.addEventListener(
    "click",
    logoutUser
);


newChatButton.addEventListener(
    "click",
    newChat
);


/* =====================================================
   INITIALIZE
   ===================================================== */

updateAuthUI();

messageInput.focus();