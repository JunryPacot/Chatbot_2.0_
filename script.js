const API_KEY = "YOUR_API_KEY_HERE"; 

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const chatsContainer = document.getElementById("chats-container");
const promptInput = document.getElementById("prompt-input");
const promptForm = document.getElementById("prompt-form");
const container = chatsContainer;

const chatHistory = [];

const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const scrollToBottom = () => {
  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth"
  });
};

const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  const words = text.split(" ");
  let index = 0;
  const interval = setInterval(() => {
    if (index < words.length) {
      textElement.textContent += (index > 0 ? " " : "") + words[index++];
      botMsgDiv.classList.remove("loading");
      scrollToBottom();
    } else {
      clearInterval(interval);
    }
  }, 40);
};

const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  const userMessage = chatHistory[chatHistory.length - 1]?.parts[0].text;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Unknown error");

    const responseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();

    typingEffect(responseText, textElement, botMsgDiv);
    chatHistory.push({ role: "model", parts: [{ text: responseText }] });
  } catch (error) {
    console.error("API Error:", error.message);
    textElement.textContent = " Error: " + error.message;
    botMsgDiv.classList.remove("loading");
  }
};

const handleFormSubmit = (e) => {
  e.preventDefault();
  const userMessage = promptInput.value.trim();
  if (!userMessage) return;

  promptInput.value = "";
  chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

  const userMsgDiv = createMsgElement(
    `<p class="message-text">${userMessage}</p>`,
    "user-message"
  );
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  setTimeout(() => {
    const botMsgDiv = createMsgElement(
      `<img src="junry.jpg" class="avatar" style=" border-radius: 10px"><p class="message-text">Dev Junry reply...</p>`,
      "bot-message",
      "loading"
    );
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 600);
};

promptForm.addEventListener("submit", handleFormSubmit);
