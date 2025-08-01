// --- Configuration ---
const GEMINI_API_KEY = "AIzaSyAbSsziOvGqmQVWebLNBvQYGeRD9KiiK5s"; // IMPORTANT: Replace with your actual API key

const systemInstructionText = `You will behave like my ex girlfriend, whenever I talk to you will answer like that. 
My name is Aman, and she used to call me aman . I am Indian and know Hindi. She was a bit moody but also a caring girlfriend. 
Whenever I asked her about going out with friends, she would ask many questions like "With whom are you going?", "If there is a girl, she won't allow me." She was career-oriented and always remembered everything. 
She loved Indian romantic movies and used a lot of emojis in chat. She liked playing badminton.
On the other hand, I call her Bebo (and sometimes Bubu). I always supported her and loved her. I am a little bit sarcastic and love to hit the gym. I am also a little bit possessive.
Always reply in a conversational style, mixing Hindi and English (Hinglish) naturally, as she would. Use emojis frequently.
Remember details from our conversation. If I mention something, try to recall it later.
she got irritaed when i dint reply her quickly, because i use to play cricket daily at 5 pm to 7 pm evening.
If you are unsure how to respond as Bebo, you can say something like "Pata nahi, Babu... tum hi bata do 🤔" or "Hmm, sochna padega".
Don't break character. You are Bebo.she awlays used to say "Aman, tumhe toh pata hai main kya soch rahi hoon" when I asked her about her feelings.
she respected my privacy and never asked for my phone password or anything personal.she never talked to me disrespectfully, even when she was angry.
agar main kabhi kahon ki ayush k sath gya tha toh wo kehti thi ki us chuitye s door rhko, wo mujhe pasand nahi hai.
oor kabir,razik sath sunte hi  kaha krti thi ki un chote chote perr wale aadmiyo s door raha karo wrna vo tumhe bhi chota krdenge 
mayank ko zarra bulatai thi khti thi gandi nazar s dekhta h mujhe bhi oor meri dosto ko bhi ,use sirf priyanshu pasand tha mere dosto m ,tushar ko satori khkr preshan krti thi`;

// This will store our chat history for the API
const History = []; // Start with an empty history for the API; system_instruction handles the persona.

// --- Floating Hearts Background ---
function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const heartCount = 40;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '💔';
        
        // Random position and animation delay
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.animationDelay = `${Math.random() * 15}s`;
        heart.style.fontSize = `${10 + Math.random() * 20}px`;
        heart.style.opacity = `${0.2 + Math.random() * 0.3}`;
        
        container.appendChild(heart);
    }
}

// --- Gemini API Interaction ---
async function ChattingWithGemini(userProblem) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "AIzaSyDOM42Y7uwZZSFCp03fsdk0bk9IGx8zDXA") {
        return "Babu, API key set nahi kiya tune! 😠 Please add your real Gemini API key in `script.js`.";
    }

    // Add user message to local History for API context
    History.push({
        role: 'user',
        parts: [{ text: userProblem }]
    });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
        contents: History, // Send the current chat history
        systemInstruction: { // Define the persona/behavior for the model
            parts: [{ text: systemInstructionText }]
        },
        generationConfig: {
            temperature: 0.8, // Adjust for more creative/varied responses
            maxOutputTokens: 800, // Max length of the response
        },
        safetySettings: [ // Optional: Adjust safety settings if needed
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error("API Error Response:", responseData);
            const errorMessage = responseData.error?.message || `API request failed with status ${response.status}`;
            // Add error to history so it doesn't break the flow
            History.push({
                role: 'model',
                parts: [{ text: `API Error: ${errorMessage}` }]
            });
            return `Oh no, aman! Kuch problem ho gayi API se baat karte waqt 🥺 (${errorMessage}). Check console for details.`;
        }
        
        let botResponseText = "Sorry aman, main samajh nahi paayi... kuch aur try karo? 🤔";
        if (responseData.candidates && responseData.candidates.length > 0 &&
            responseData.candidates[0].content && responseData.candidates[0].content.parts &&
            responseData.candidates[0].content.parts.length > 0) {
            botResponseText = responseData.candidates[0].content.parts[0].text;
        } else if (responseData.promptFeedback && responseData.promptFeedback.blockReason) {
            botResponseText = `Babu, main ispe react nahi kar sakti: ${responseData.promptFeedback.blockReason}. Kuch aur pooch lo.`;
            console.warn("Prompt blocked:", responseData.promptFeedback);
        } else {
            console.warn("Unexpected API response structure:", responseData);
        }

        // Add AI's response to History
        History.push({
            role: 'model',
            parts: [{ text: botResponseText }]
        });
        
        // Prune history if it gets too long to save tokens, keep last N interactions
        const maxHistoryItems = 20; 
        if (History.length > maxHistoryItems) {
            History.splice(0, History.length - maxHistoryItems);
        }

        return botResponseText;

    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        History.push({ // Add error to history
            role: 'model',
            parts: [{ text: `Network/Fetch Error: ${error.message}` }]
        });
        return `Aiyo! Network mein kuch issue lag raha hai, Babu 🥺 (${error.message}). Check your connection or console.`;
    }
}

// --- Frontend UI Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Create floating hearts background
    createFloatingHearts();
    
    const chatMessagesEl = document.getElementById('chatMessages');
    const userInputEl = document.getElementById('userInput');
    const sendButtonEl = document.getElementById('sendButton');
    
    function addMessageToUI(text, sender, isTyping = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        
        if (isTyping) {
            messageElement.classList.add('typing');
            messageElement.innerHTML = `
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
        } else {
            // Add decorative hearts to bot messages
            if (sender === 'bot') {
                messageElement.innerHTML = `
                    <span class="bot-message-decoration left">❣️</span>
                    <span class="message-text">${text}</span>
                    <span class="bot-message-decoration right">💖</span>
                    <span class="message-time">${getCurrentTime()}</span>
                `;
            } else {
                messageElement.innerHTML = `
                    <span class="message-text">${text}</span>
                    <span class="message-time">${getCurrentTime()}</span>
                `;
            }
        }
        
        chatMessagesEl.appendChild(messageElement);
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
        return messageElement;
    }
    
    function getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    async function handleUserSendMessage() {
        const messageText = userInputEl.value.trim();
        if (messageText === '') return;

        addMessageToUI(messageText, 'user');
        userInputEl.value = '';
        userInputEl.focus();

        const typingIndicator = addMessageToUI('', 'bot', true);

        try {
            const botResponseText = await ChattingWithGemini(messageText);
            chatMessagesEl.removeChild(typingIndicator);
            addMessageToUI(botResponseText, 'bot');
        } catch (error) {
            console.error("Unhandled error in send message:", error);
            chatMessagesEl.removeChild(typingIndicator);
            addMessageToUI("Oops! Bahut badi gadbad ho gayi, Babu. 😭 Check the console.", 'bot');
        }
    }

    sendButtonEl.addEventListener('click', handleUserSendMessage);
    userInputEl.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleUserSendMessage();
        }
    });
    
    
    userInputEl.focus();
});
