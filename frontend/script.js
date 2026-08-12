const API_URL = "http://localhost:8080/api/chat";
const AUTH_URL = "http://localhost:8080/auth";

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");


// =====================================================
// AUTH MODAL
// =====================================================

let authMode = "login";


function openAuthModal(mode) {

    authMode = mode;

    const modal =
        document.getElementById("authModal");

    const title =
        document.getElementById("authTitle");

    const subtitle =
        document.getElementById("authSubtitle");

    const submitButton =
        document.getElementById("authSubmitButton");

    const switchText =
        document.getElementById("authSwitchText");

    const switchButton =
        document.getElementById("authSwitchButton");

    const error =
        document.getElementById("authError");


    error.textContent = "";

    document.getElementById("authForm").reset();


    if (mode === "login") {

        title.textContent =
            "Login to Cursio";

        subtitle.textContent =
            "Welcome back!";

        submitButton.textContent =
            "Login";

        switchText.textContent =
            "Don't have an account?";

        switchButton.textContent =
            "Register";

    } else {

        title.textContent =
            "Create your Cursio account";

        subtitle.textContent =
            "Join Cursio today.";

        submitButton.textContent =
            "Register";

        switchText.textContent =
            "Already have an account?";

        switchButton.textContent =
            "Login";
    }


    modal.classList.add("show");

    document.getElementById("username").focus();
}


function closeAuthModal() {

    document
        .getElementById("authModal")
        .classList.remove("show");
}


function switchAuthMode() {

    if (authMode === "login") {

        openAuthModal("register");

    } else {

        openAuthModal("login");
    }
}


// Close modal when clicking outside

document
    .getElementById("authModal")
    .addEventListener(
        "click",
        function(event) {

            if (event.target === this) {

                closeAuthModal();
            }
        }
    );


// =====================================================
// LOGIN / REGISTER FORM
// =====================================================

document
    .getElementById("authForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;


            const error =
                document.getElementById(
                    "authError"
                );


            if (!username || !password) {

                error.textContent =
                    "Please enter username and password.";

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


// =====================================================
// REGISTER
// =====================================================

async function registerUser(
    username,
    password
) {

    const error =
        document.getElementById(
            "authError"
        );


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
                        username: username,
                        password: password
                    })
                }
            );


        const data =
            await response.text();


        if (!response.ok) {

            error.textContent =
                data ||
                "Registration failed.";

            return;
        }


        // Registration successful
        error.style.color =
            "#22c55e";

        error.textContent =
            "Registration successful! You can now login.";


        // Switch to login after 1 second
        setTimeout(
            function() {

                error.style.color = "";

                openAuthModal("login");

            },
            1000
        );


    } catch (err) {

        console.error(err);

        error.textContent =
            "Cannot connect to backend.";
    }
}


// =====================================================
// LOGIN
// =====================================================

async function loginUser(
    username,
    password
) {

    const error =
        document.getElementById(
            "authError"
        );


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
                        username: username,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            error.textContent =
                data.message ||
                "Invalid username or password.";

            return;
        }


        // Save JWT
        localStorage.setItem(
            "cursio_token",
            data.token
        );


        // Save username
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


    } catch (err) {

        console.error(err);

        error.textContent =
            "Cannot connect to backend.";
    }
}


// =====================================================
// LOGOUT
// =====================================================

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


// =====================================================
// UPDATE AUTH UI
// =====================================================

function updateAuthUI() {

    const token =
        localStorage.getItem(
            "cursio_token"
        );

    const username =
        localStorage.getItem(
            "cursio_username"
        );


    const loginButton =
        document.getElementById(
            "loginButton"
        );

    const registerButton =
        document.getElementById(
            "registerButton"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const userStatus =
        document.getElementById(
            "userStatus"
        );


    if (token) {

        loginButton.style.display =
            "none";

        registerButton.style.display =
            "none";

        logoutButton.style.display =
            "block";

        userStatus.textContent =
            "Logged in as " + username;

    } else {

        loginButton.style.display =
            "block";

        registerButton.style.display =
            "block";

        logoutButton.style.display =
            "none";

        userStatus.textContent =
            "Not logged in";
    }
}


// =====================================================
// SEND MESSAGE
// =====================================================

async function sendMessage() {

    const message =
        messageInput.value.trim();


    if (message === "") {
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
                        message: message
                    })
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            removeTyping();


            localStorage.removeItem(
                "cursio_token"
            );

            localStorage.removeItem(
                "cursio_username"
            );


            updateAuthUI();


            addMessage(
                "Your session has expired. Please login again.",
                "bot"
            );


            return;
        }


        const data =
            await response.json();


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

        console.error(error);

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


// =====================================================
// ADD MESSAGE
// =====================================================

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

        messageDiv.classList.add(
            "bot-message"
        );


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


    chatBox.appendChild(
        messageDiv
    );


    scrollToBottom();
}


// =====================================================
// FORMAT TEXT
// =====================================================

function formatText(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    let safeText =
        div.innerHTML;


    safeText =
        safeText.replace(
            /\n/g,
            "<br>"
        );


    return safeText;
}


// =====================================================
// TYPING
// =====================================================

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


    chatBox.appendChild(
        typingDiv
    );


    scrollToBottom();
}


// =====================================================
// REMOVE TYPING
// =====================================================

function removeTyping() {

    const typing =
        document.getElementById(
            "typingMessage"
        );


    if (typing) {

        typing.remove();
    }
}


// =====================================================
// SCROLL
// =====================================================

function scrollToBottom() {

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


// =====================================================
// NEW CHAT
// =====================================================

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


// =====================================================
// ENTER KEY
// =====================================================

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


// =====================================================
// AUTO RESIZE
// =====================================================

messageInput.addEventListener(
    "input",
    function() {

        this.style.height =
            "auto";

        this.style.height =
            Math.min(
                this.scrollHeight,
                150
            ) + "px";
    }
);


// =====================================================
// PAGE LOAD
// =====================================================

updateAuthUI();