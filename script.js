const socket = io("http://localhost:80");

//window.prompt("Enter your username: ");

socket.on("connect", () => {
    console.log("Connected to the server!");
});

function clearSeen() {
    const msgContainer = document.querySelector(".chatbox");
    const seenMsg = msgContainer.getElementsByClassName("Chat seen");

    Array.from(seenMsg).forEach(seenMsg => {
        msgContainer.removeChild(seenMsg);
    });
}

//we will get all the msgs except if the msg of our own coming to ourselfs
let isTabActivePrinted = false;
let isTabNotActivePrinted = false;

let seen = false;

let body = document.body;

socket.on("message", data => {
    displayMsg(data, "reciever");
    scrollToBottom();

    //unread msg

    socket.on("unread", () => {
        if (!isTabActivePrinted && document.hasFocus() && body.classList.contains("show-chat")) {
            console.log("The tab is active");

            isTabActivePrinted = true;
            isTabNotActivePrinted = false;
        } else if (!isTabNotActivePrinted && !document.hasFocus()) {
            console.log("This tab is not active");

            isTabNotActivePrinted = true;
            isTabActivePrinted = false;
        }
        
        setInterval(checkSeen, 0);
    });
});

function checkSeen() {
    if (!isTabActivePrinted && document.hasFocus() && body.classList.contains("show-chat")) {
        console.log("The tab is active");
        isTabActivePrinted = true;
        isTabNotActivePrinted = false;
        
        socket.emit("seen");
    } else if (!isTabNotActivePrinted && !document.hasFocus()) {
        console.log("This tab is not active");
        isTabNotActivePrinted = true;
        isTabActivePrinted = false;
    }
}

socket.on("seen", () => {
    if(!seen) {
        //if no sender message are sent then do nothing and return
        const chatbox = document.querySelector(".chatbox");
        const senderMsgs = chatbox.querySelectorAll(".Chat.sender");

        if (senderMsgs.length === 0) {
            return;
        };

        clearSeen();
        console.log("msg seen!");

        const msgContainer = document.querySelector(".chatbox");
    
        const newMsg = document.createElement("li");
        newMsg.className = "Chat seen";
        newMsg.innerHTML = "<p>Seen</p>";
        msgContainer.appendChild(newMsg);

        seen = true;
        scrollToBottom();
    }

});

    //auto scroll down 
    document.addEventListener("DOMContentLoaded", () => {
        const textContainer = document.querySelector(".chatbox");
        textContainer.scrollTop = textContainer.scrollHeight;
});


//user is typing text
const input = document.querySelector(".chat");
let typingTimer;
const typingDelay = 2000;

let typing = false;

input.addEventListener("input", () => {
    socket.emit("typing");
    
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        socket.emit("stopTyping");
    }, typingDelay);
});

socket.on("typing", () => {
    if(!typing) {
        displayTypingMessage();
        typing = true;
    }

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        socket.emit("stopTyping");
    }, typingDelay);

});

socket.on("stopTyping", () => {
    clearTypingMessage();
    typing = false;
});

function displayTypingMessage() {    
    const msgContainer = document.querySelector(".chatbox");
    const typingMessage = document.createElement("li");
    typingMessage.className = "Chat typing";
    typingMessage.innerHTML = '<div class="dot" style="--delay: 200ms"></div><div class="dot" style="--delay: 300ms"></div><div class="dot" style="--delay: 400ms"></div>';
    msgContainer.appendChild(typingMessage);
    scrollToBottom();
}

function clearTypingMessage(){
    const chat = document.querySelector(".chatbox");
    const typingMessages = chat.getElementsByClassName("typing");

    while (typingMessages.length > 0){
        chat.removeChild(typingMessages[0]);
    }
}

const sendMsg = () => {
    seen = false;
    socket.emit("stopTyping");
    clearTypingMessage();

    document.querySelector(".chat").focus();

    const msgInput = document.querySelector(".chat");
    const msg = msgInput.value;

    if (msg === "") {
        return;
    }

    // Clear typing messages before displaying the sent message

    displayMsg(msg, "sender");
    socket.emit("message", msg);
    msgInput.value = "";

    // Auto-scroll down
    scrollToBottom();

    //msg sent as unread
    socket.emit("unread")
};

function scrollToBottom(){
    const scroll = document.querySelector(".chatbox");
    scroll.scrollTop = scroll.scrollHeight;
}

function displayMsg(message, messageType){
    const msgContainer = document.querySelector(".chatbox");
    
    const newMsg = document.createElement("li");
    newMsg.className = `Chat ${messageType}`;
    newMsg.innerHTML = `<p>${message}</p>`;
    msgContainer.appendChild(newMsg);
    scrollToBottom();
};

//send text by clicking on enter

document.addEventListener("DOMContentLoaded", () => {
    const msgInput = document.querySelector(".chat");

    msgInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMsg();
        }
    });
});

//automatically toggle it 
const chatToggler = document.querySelector(".chat-toggler");
chatToggler.addEventListener("click", () => {
    document.body.classList.toggle("show-chat");
});

//message seen or not
/*
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        console.log("This tab in focus");
    }
});
*/


