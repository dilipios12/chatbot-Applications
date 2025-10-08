const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Socket } = require('socket.io');
const multer= require('multer');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const Together = require('together-ai');
const fs = require('fs'); // ✅ this allows await
const fsp = require('fs/promises');   // for async/await usage
const { v4: uuidv4 } = require('uuid');
const CONFIG_FILE = path.join(__dirname, 'config.json');

const FAQ_FILE = path.join(__dirname, "faqs.json");
const KNOWLEDGE_FILE = path.join(__dirname, "knowledge_base.json");
const app = express();



const http = require('http');
const PORT = 3000;
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'chat-secret', resave: false, saveUninitialized: true }));


const { Server } = require('socket.io');
const server = require('http').createServer(app);



const io = new Server(server, {
  cors: {
    origin: '*', // OR 'http://localhost:5173' etc.
    methods: ['GET', 'POST']
  }
});

require('dotenv').config(); // Load environment variables from .env
const logger = require('./logger'); // assuming you created one like shown before

logger.info('Loaded .env variables:', {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER ? '[SET]' : '[UNSET]',
  SMTP_PASS: process.env.SMTP_PASS ? '[SET]' : '[UNSET]',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  TOGETHER_API_KEY: process.env.TOGETHER_API_KEY ? '[SET]' : '[UNSET]',
});

const chatFilePath = path.join(__dirname, 'chat.json');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { console } = require('inspector');
const { create } = require('domain');
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const AUTH_USER = { username: "admin", password: "1234" };

// LOGIN PAGE
app.get('/', (req, res) => {
  if (req.session.loggedIn) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// LOGIN HANDLER
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === AUTH_USER.username && password === AUTH_USER.password) {
    req.session.loggedIn = true;
    return res.redirect('/dashboard');
  }
  res.send('Invalid credentials <a href="/">Go back</a>');
});

// DASHBOARD PAGE
app.get('/dashboard', (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) console.error('SMTP Verification Error:', error.message);
  else console.log('SMTP Server is ready');
});




// ________________________   API: GET SETTINGS ---------------------------------------

app.get('/api/settings', (req, res) => {
  const { id } = req.query;
  const filePath = path.join(__dirname, 'db.json');

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const widget = data.find(w => w.widgetId === id);

    if (!widget) {
      return res.status(404).json({ success: false, message: 'Widget not found' });
    }

    res.json(widget);
  } catch (err) {
    console.error('Error reading db.json:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




// ----------------------  API: UPDATE SETTINGS ----------------------------------
// Define the helper functions
const readJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON:', err);
    return [];
  }
};

const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON:', err);
  }
};

app.post('/api/update-settings', (req, res) => {
  const { widgetId, ...updates } = req.body;
  const filePath = path.join(__dirname, 'db.json');
  const widgets = readJSON(filePath);

  const index = widgets.findIndex(widget => widget.widgetId === widgetId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Widget not found' });
  }

  widgets[index] = { ...widgets[index], ...updates };
  writeJSON(filePath, widgets);

  res.json({ success: true, message: 'Widget updated successfully.' });
});


// API: UPDATE OVERVIEW (including imageUrl and showImage)
app.post('/api/update-overview', (req, res) => {
  const { widgetId, ...updates } = req.body;
  const filePath = path.join(__dirname, 'db.json');
  const widgets = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const index = widgets.findIndex(widget => widget.widgetId === widgetId);
  if (index === -1) return res.status(404).json({ success: false, message: 'Widget not found' });

  widgets[index] = { ...widgets[index], ...updates };
  writeJSON(filePath, widgets);
  res.json({ success: true, message: 'Overview updated successfully.' });
});



// API: EMBED WIDGET SCRIPT
async function getWidgetSettingsFromDB(widgetId) {
  const rawData = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
  const widgets = JSON.parse(rawData);

  return widgets.find(widget => widget.id === widgetId);
}

// Load widget settings from db.json for a specific widget ID
async function getWidgetSettingsFromDB(widgetId) {
  const rawData = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
  const widgets = JSON.parse(rawData);

  return widgets.find(widget => widget.id === widgetId);
}
// Get active users
function readChatFile() {
  if (!fs.existsSync(chatFilePath)) return {};
  const raw = fs.readFileSync(chatFilePath, 'utf-8');
  return JSON.parse(raw || '{}');
}

function saveChatFile(data) {
  fs.writeFileSync(chatFilePath, JSON.stringify(data, null, 2));
}

// ✅ Global maps
app.get('/api/chat-history/:userId', (req, res) => {
  const chatPath = path.join(__dirname, 'chat.json');
  const chatData = fs.existsSync(chatPath)
    ? JSON.parse(fs.readFileSync(chatPath, 'utf8'))
    : {};
  res.json(chatData[req.params.userId] || []);
});





function saveMessage(userId, sender, message, timestamp) {
  const chatPath = path.join(__dirname, 'chat.json');
  let chatData = {};

  if (fs.existsSync(chatPath)) {
    chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
  }

  if (!chatData[userId]) chatData[userId] = [];
  chatData[userId].push({ sender, message, timestamp });

  fs.writeFileSync(chatPath, JSON.stringify(chatData, null, 2));
}



const activeUsers = new Set();
const connectedUsers = {};


app.get('/api/active-users', (req, res) => {
  console.log("📊 Active users being sent:", Array.from(activeUsers));
  console.log("🧠 Connected users:", connectedUsers);
  res.json(Array.from(activeUsers));
});

// Chat history (optional)
app.get('/api/chat-history/:userId', (req, res) => {
  const userId = req.params.userId;
  const chatData = JSON.parse(fs.readFileSync('chat.json', 'utf8') || '{}');
  res.json(chatData[userId] || []);
});



function saveChatFile(data) {
  fs.writeFileSync('chat.json', JSON.stringify(data, null, 2));
}
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  let registeredUserId = null;

  socket.on('register', (userId, isNew) => {
    console.log(`🆕 Registering user: ${userId} with socket ${socket.id}`);
    registeredUserId = userId;
    connectedUsers[userId] = socket.id;
    activeUsers.add(userId);
  });

  socket.on('send-message', (data) => {
    console.log(`📨 Received message from ${data.userId}: ${data.message}`);
  });

  socket.on('admin-reply', ({ userId, message }) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const chatData = JSON.parse(fs.readFileSync('chat.json', 'utf8') || '{}');
    if (!chatData[userId]) chatData[userId] = [];
    chatData[userId].push({ sender: 'admin', message, timestamp });
    saveChatFile(chatData);

    const userSocketId = connectedUsers[userId];
    if (userSocketId) {
      io.to(userSocketId).emit('admin-message', { userId, sender: 'admin', message, timestamp });
    }
  });

  socket.on('disconnect-user', (userId) => {
    if (connectedUsers[userId] === socket.id) {
      delete connectedUsers[userId];
      activeUsers.delete(userId);
      console.log(`User ${userId} manually disconnected.`);
    }
  });

  socket.on('disconnect', () => {
    if (registeredUserId && connectedUsers[registeredUserId] === socket.id) {
      delete connectedUsers[registeredUserId];
      activeUsers.delete(registeredUserId);
      console.log(`User ${registeredUserId} disconnected.`);
    }
  });
});



// ✅ API to get chat history for a user
app.get('/api/chat/:userId', (req, res) => {
  const userId = req.params.userId;
  const chatData = readChatFile();

  if (chatData[userId]) {
    res.json(chatData[userId]); // return array of messages
  } else {
    res.json([]); // return empty array if no messages
  }
});

//--------------------------- get the All chat Ai Data ----------------------


// Serve bot replies from a JSON file
app.get('/api/bot-replies', (req, res) => {
  const replies = JSON.parse(fs.readFileSync('botReplies.json', 'utf8'));
  res.json(replies);
});



app.get('/api/faqs', async (req, res) => {
  try {
    console.log("📁 Looking for:", FAQ_FILE);
    const data = await fs.readFileSync(FAQ_FILE, 'utf8');
    const faqs = JSON.parse(data);
    res.json(faqs);
  } catch (err) {
    console.error("❌ Error loading faqs.json:", err);
    res.status(500).json({ error: 'Failed to load FAQs' });
  }
});

app.get('/api/faq-sources', (req, res) => {
  try {
    const sources = JSON.parse(fs.readFileSync('faqSources.json', 'utf8'));
    res.json(sources);
  } catch (err) {
    console.error("❌ Error loading faqSources.json:", err);
    res.status(500).json({ error: 'Failed to load sources' });
  }
});













const TOGETHER_API_KEY = '9b95f35ce1e2044a91852f23f0f6e554bfb128ced09848fe0447e7f0fc57a6d6'; // ← use env variable in production

async function askTogetherAI(prompt) {
  const body = {
    model: "meta-llama/Llama-3-8b-chat-hf", // or use another model like mistral
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 512
  };

  try {
    const response = await axios.post('https://api.together.xyz/v1/chat/completions', body, {
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiMessage = response.data.choices[0].message.content;
    return aiMessage;
  } catch (error) {
    console.error('❌ Together API Error:', error.response?.data || error.message);
    return "⚠️ Failed to get a response from AI.";
  }
}

// Ask Question API
// Ask question API
app.all('/api/ask-question', async (req, res) => {
  const message = req.method === 'POST' ? req.body.message : req.query.message;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const normalize = str => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const msg = normalize(message);

  try {
    const botReplies = JSON.parse(fs.readFileSync('botReplies.json', 'utf8'));
    const faqs = JSON.parse(fs.readFileSync('faqs.json', 'utf8'));
    const sources = JSON.parse(fs.readFileSync('faqSources.json', 'utf8'));

    for (let faq of faqs) {
      const q = normalize(faq.question);
      if (msg === q || msg.includes(q) || q.includes(msg)) {
        return res.json({ answer: faq.answer, source: "FAQ" });
      }
    }

    for (let src of sources) {
      const text = normalize(src.text || '');
      if (text.includes(msg)) {
        return res.json({
          answer: `📄 Found in uploaded ${src.type === 'pdf' ? 'PDF' : 'URL'}: "${src.filename || src.url}"`,
          source: src.type.toUpperCase()
        });
      }
    }

    for (let entry of botReplies) {
      if (entry.keywords.some(k => msg.includes(normalize(k)))) {
        return res.json({ answer: entry.response, source: "Bot" });
      }
    }

    const aiAnswer = await askTogetherAI(message);
    return res.json({ answer: aiAnswer, source: "TogetherAI" });

  } catch (err) {
    console.error("❌ Error in ask-question:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Load widget
app.get('/api/load-widget', async (req, res) => {
  const id = req.query.id;
  const allWidgets = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  const data = allWidgets.find(w => w.widgetId === id);
  if (!data || !data.show) return res.end();

  const [vPos, hPos] = data.position.split('-');
  const imageUrl = data.imageUrl || 'https://cdn-icons-png.flaticon.com/512/2462/2462719.png';
  const chatHeader = data.chatHeader || 'iosandweb';
  const welcome = data.welcome || '👋 Welcome! How can I assist you today?';
  const fontFamily = data.fontFamily || 'Arial';
  const fontSize = data.fontSize || '14px';
  const fontSizeOverview = data.fontSizeOverview || '20px';
  const color = data.color || '#007bff';
  const overviewColor = data.overviewColor || '#4b9df2';

  res.setHeader('Content-Type', 'application/javascript');
  res.send(`(function () {
    if (document.getElementById("custom-chat-launcher")) return;

    const script = document.createElement("script");
    script.src = "http://localhost:3000/socket.io/socket.io.js";
    script.onload = () => {
      const socket = io("http://localhost:3000");

      const styleVars = document.createElement('style');
      styleVars.innerHTML = \`
        :root {
          --chat-position: ${data.position};
          --chat-color: ${color};
          --chat-font-family: ${fontFamily};
          --chat-font-size: ${fontSize};
          --chat-font-size-overview: ${fontSizeOverview};
          --chat-overview-color: ${overviewColor};
        }
        .chat-icon {
          ${vPos}: 20px;
          ${hPos}: 39px;
          margin-left: 20px;
          background: var(--chat-color);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          z-index: 9999;
          font-family: var(--chat-font-family);
        }
      \`;
      document.head.appendChild(styleVars);

      let botReplies = [];
      let faqs = [];
      let sources = [];
      let askpdfqustions = [];

      function askQuestion(message) {
        return fetch(\`http://localhost:3000/api/ask-question?message=\${encodeURIComponent(message)}\`)
          .then(res => res.json())
          .catch(err => {
            console.error("❌ Error in askQuestion:", err);
            return { answer: "Sorry, no response", source: "Error" };
          });
      }

      // Load all required data including FAQ sources
      Promise.all([
        fetch('http://localhost:3000/api/bot-replies').then(res => res.json()),
        fetch('http://localhost:3000/api/faqs').then(res => res.json()),
        fetch('http://localhost:3000/api/faq-sources').then(res => res.json()),
        askQuestion(message)
      ])
      .then(([botData, faqData, sourceData, askpdfqustionss]) => {
        botReplies = botData;
        faqs = faqData;
        sources = sourceData;
        askpdfqustions = askpdfqustionss;

        console.log("📩 Initial AI Response:", askpdfqustions);
      })
      .catch(err => {
        console.error("❌ Data loading failed:", err);
        botReplies = [{ keywords: ['default'], response: "Sorry, I couldn't load replies." }];
        faqs = [];
        sources = [];
      });

      function normalize(str) {
        return str.toLowerCase().replace(/[^\\w\\s]/g, '').trim();
      }

      function getBotResponse(message) {
        const msg = normalize(message);

  for (let faq of faqs) {
    const q = normalize(faq.question);
    if (msg === q || msg.includes(q) || q.includes(msg)) {
      return faq.answer;
    }
  }

  for (let src of sources) {
    const text = normalize(src.text || '');
    if (text.includes(msg)) {
      return src.answer;
    }
  }

  for (let entry of botReplies) {
    if (entry.keywords.some(k => msg.includes(normalize(k)))) {
      return entry.response;
    }
  }

  // 🔥 Use the preloaded askpdfqustions response
  if (askpdfqustions && askpdfqustions.answer) {
    return askpdfqustions.answer;
  }

  const def = botReplies.find(e => e.keywords.includes('default'));
  return def ? def.response : "I'm not sure how to respond.";
}



  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "http://localhost:3000/chat-widget.css";
  document.head.appendChild(style);
  const iconWrapper = document.createElement("div");
  iconWrapper.id = "custom-chat-launcher";
  iconWrapper.style.position = "fixed";
  iconWrapper.style.${vPos} = "20px";
  iconWrapper.style.${hPos} = "20px";
  iconWrapper.style.zIndex = "9999";

  const tooltip = document.createElement("div");
  tooltip.className = "chat-tooltip";
  tooltip.innerText = "Chat with us!";

  const icon = document.createElement("div");
  icon.className = "chat-icon";
  icon.innerHTML = "<img src='${imageUrl}' />";

  const chatBox = document.createElement("div");
  chatBox.className = "chat-box";
  chatBox.style.display = "none";
  chatBox.innerHTML = \`
    <div class='chat-header'>
    <img src='${imageUrl}' style="height:30px;width:30px;border-radius:50%;margin-right:8px;" />
    ${chatHeader}
    <button id="close-btn" style="margin-left:auto;background:transparent;border:none;font-size:18px;cursor:pointer;color:white">✕</button>
  </div>

  <div id="hrFormWrapper" style="padding: 20px; overflow-y:auto;">
    <h4>Welcome! How can we help?</h4>
    <form id="hr-form">
      <label>Name<span style="color:red">*</span></label>
      <input type="text" name="name" required style="width:100%;padding:4px;margin-bottom:10px;height:38px" />
      <label>Email<span style="color:red">*</span></label>
      <input type="email" name="email" required style="width:100%;padding:4px;margin-bottom:10px;height:38px"" />
      <button type="submit" style="width:100%;padding:10px;background:#007bff;color:white;border:none;">💬 Chat with us</button>
      <button type="button" onclick="window.location.href='tel:+91-8795720084'" style="width:100%;padding:10px;margin-top:10px;background:white;color:#007bff;border:2px solid #007bff;">📞 Call Us</button>
    </form>
  </div>

  <div class='chat-messages' id='chat-msgs' style="display:none;"></div>
  <div class='chat-input' style="display:none;">
    <input type='text' id='chat-input' placeholder='Type a message...' onkeydown="if(event.key==='Enter') sendChatMsg()" />
    <button onclick='sendChatMsg()'>Send</button>
  </div>

  <div class="row mb-3" id="chat-controls" style="display:none;">
    <div class="col-12 d-flex justify-content-center">
      <u style="color: blue; cursor: pointer;" id="contact-human">Contact Human</u>&nbsp; 
      <u style="color: red; cursor: pointer;" id="end-chat">End Chat</u>
    </div>
  </div>

<br>
    \`;
// Function to end the chat (clears UI)

function endChat() {
  const chatMsgs = document.getElementById("chat-msgs");
  const input = document.getElementById("chat-input");
  if (chatMsgs) chatMsgs.innerHTML = ""; // Clear messages
  if (input) input.value = "";            // Clear input
  chatBox.style.display = 'none';         // Hide chat box
}

setTimeout(() => {
  const closeBtn = document.getElementById("close-btn");
  const endChatBtn = document.getElementById("end-chat");
  const contactHumanBtn = document.getElementById("contact-human");

 if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      chatBox.style.display = 'none';

      const chatMsgs = document.getElementById("chat-msgs");
      chatMsgs.innerHTML = ''; // clear all messages

      if (userId) {
        socket.emit('disconnect-user', userId); // notify server
        console.log("User disconnected:", userId);
        userId = null;
      }
    });
  }

  if (endChatBtn) {
    endChatBtn.addEventListener("click", async () => {
      // Immediately close chat box for better UX
      endChat();

    const userId = localStorage.getItem("custom_user_id");

const chatMsgs = Array.from(document.querySelectorAll("#chat-msgs .message")).map(msgEl => {
  let sender = "user"; // default

  if (msgEl.classList.contains("bot")) {
    sender = "bot";
  } else if (msgEl.classList.contains("admin")) {
    sender = "admin";
  }

  return {
    timestamp: new Date().toISOString(),
    sender,
    message: msgEl.innerText.trim()
  };
});

      // Send chat history email
      try {
        await fetch("http://localhost:3000/api/chat-ended", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, messages: chatMsgs })
        });
        console.log("End chat email sent.");
      } catch (error) {
        console.error("Error sending end chat email:", error);
      }
    });
  }
  if (contactHumanBtn) {
    contactHumanBtn.addEventListener("click", async () => {
      const userId = localStorage.getItem("custom_user_id") || crypto.randomUUID();
      localStorage.setItem("custom_user_id", userId);
      try {
        await fetch("http://localhost:3000/api/request-human", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        });
        alert("A human assistance request has been sent.");
      } catch (error) {
        console.error("Failed to request human:", error);
        alert("Failed to request human. Please try again.");
      }
    });
  }
}, 100);

// Icon click logic
icon.onclick = function () {
  const isHidden = chatBox.style.display === 'none' || chatBox.style.display === '';
  chatBox.style.display = isHidden ? 'flex' : 'none';

  const hrForm = document.getElementById("hrFormWrapper");
  const chatMsgs = document.getElementById("chat-msgs");
  const chatInput = document.querySelector(".chat-input");
  const chatControls = document.getElementById("chat-controls");

  if (isHidden) {
    userId = crypto.randomUUID();
    hasNotified = false;

    // Show form, hide chat and controls
    hrForm.style.display = 'block';
    chatMsgs.style.display = 'none';
    chatInput.style.display = 'none';
    chatControls.style.display = 'none';

    if (socket.connected) {
      socket.emit('register', userId, true);
    } else {
      socket.on('connect', () => {
        socket.emit('register', userId, true);
      });
    }
  } else {
    if (userId) {
      socket.emit('disconnect-user', userId);
      userId = null;
    }
    chatMsgs.innerHTML = '';
  }
};

// Handle form submission
document.addEventListener("submit", async function (e) {
  if (e.target && e.target.id === "hr-form") {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();

    if (!name || !email) return;

    try {
      const response = await fetch("http://localhost:3000/api/hr-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("✅ Email sent");

        // Toggle view to show chat
        document.getElementById("hrFormWrapper").style.display = "none";
        document.getElementById("chat-msgs").style.display = "block";
        document.querySelector(".chat-input").style.display = "flex";
        document.getElementById("chat-controls").style.display = "flex";
        // Show welcome message
        const welcomeMsg = document.createElement("div");
        welcomeMsg.className = "chat-msg bot-msg";
        welcomeMsg.innerText = '${welcome}'
        document.getElementById("chat-msgs").appendChild(welcomeMsg);
      } else {
        console.warn("⚠️ Failed to send email");
      }
    } catch (err) {
      console.error("⚠️ Error sending form:", err);
    }
  }
});
function sendChatMsg() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;

  const chatMsgs = document.getElementById("chat-msgs");
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const userDiv = document.createElement("div");
  userDiv.className = "chat-msg user-msg";
  userDiv.innerText = msg;
  chatMsgs.appendChild(userDiv);

  input.value = "";

  if (!userId) {
    console.warn("No userId exists. Cannot send message.");
    return;
  }

  socket.emit('send-message', { userId, message: msg });
  // Save user message
  fetch('http://localhost:3000/api/save-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sender: "user", message: msg, timestamp })
  })
  .then(() => {
    // 🔔 Notify only once per session
    if (!hasNotified) {
      hasNotified = true;
      return fetch('http://localhost:3000/api/notify-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: msg, timestamp })
      });
    }
    return Promise.resolve();
  })
  .then(() => {
    // Bot reply
    const reply = getBotResponse(msg);
    const botDiv = document.createElement("div");
    botDiv.className = "chat-msg bot-msg";
    botDiv.innerText = reply;
    chatMsgs.appendChild(botDiv);

    // Save bot reply
    return fetch('http://localhost:3000/api/save-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sender: "bot", message: reply, timestamp })
    });
  })
  .catch(err => console.error("Chat error:", err));
}


socket.on('admin-message', (data) => {
  console.log("✅ Received admin message:", data);

  const chatMsgs = document.getElementById("chat-msgs");
  if (!chatMsgs) {
    console.error("❌ chat-msgs element not found!");
    return;
  }
  const adminDiv = document.createElement("div");
  adminDiv.className = "chat-msg admin-msg";
  adminDiv.innerText = data.message; // ✅ FIXED: use data.message
  adminDiv.style.textAlign = "left";
  chatMsgs.appendChild(adminDiv);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
});


  window.sendChatMsg = sendChatMsg;
  window.endChat = endChat; // Register globally if needed
  iconWrapper.appendChild(tooltip);
  iconWrapper.appendChild(icon);
  document.body.appendChild(iconWrapper);
  document.body.appendChild(chatBox);

   // Dragging functionality
  const chatHeaderEl = chatBox.querySelector('.chat-header');
  let isDragging = false, offsetX = 0, offsetY = 0;

  chatHeaderEl.addEventListener('mousedown', function(e) {
    isDragging = true;
    const rect = chatBox.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.addEventListener('mousemove', dragChatBox);
    document.addEventListener('mouseup', stopDragging);
  });

  function dragChatBox(e) {
    if (!isDragging) return;
    chatBox.style.left = (e.clientX - offsetX) + "px";
    chatBox.style.top = (e.clientY - offsetY) + "px";
    chatBox.style.right = "auto";
    chatBox.style.bottom = "auto";
    chatBox.style.position = "fixed";
  }
   function stopDragging() {
    isDragging = false;
    document.removeEventListener('mousemove', dragChatBox);
    document.removeEventListener('mouseup', stopDragging);
  }
    };
document.head.appendChild(script); // ← append FIRST, then onload runs when ready

})();
  `);
});




app.post('/api/hr-form', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  // TODO: send email or save to DB
  console.log("Form received:", name, email);

  return res.status(200).json({ success: true, message: 'Form received' });
});


async function loadConfig() {
  try {
    const data = await fsp.readFile(CONFIG_FILE, 'utf8');

    if (!data.trim()) {
      console.log('config.json is empty, initializing with {}');
      await fsp.writeFile(CONFIG_FILE, '{}');
      return {};
    }

    const config = JSON.parse(data);
    console.log('✅ Loaded config');
    return config;
  } catch (error) {
    if (error.code === 'ENOENT' || error.message.includes('Unexpected end of JSON input')) {
      console.log('No valid config file found, creating new one');
      await fsp.writeFile(CONFIG_FILE, '{}');
      return {};
    }

    console.error('❌ Error loading config:', error.message);
    return {};
  }
}

async function sendEmailNotification(type, data) {
  const config = await loadConfig();

  const adminEmail = config.adminEmail || process.env.ADMIN_EMAIL;
  const port = process.env.PORT || 3000;
  let mailOptions;
  switch (type) {
    case 'human_request':
      mailOptions = {
        from: process.env.SMTP_USER,
        to: adminEmail,
        subject: `New Human Assistance Request from ${data.userId}`,
        text: `User ${data.userId} has requested human assistance.\n\nAccess the admin dashboard: http://localhost:3000/admin.html`,
        html: `<p>User <strong>${data.userId}</strong> has requested human assistance.</p><p><a href="http://localhost:3000/admin.html">Access the admin dashboard</a></p>`,
      };
      break;
    case 'new_message':
      mailOptions = {
        from: process.env.SMTP_USER,
        to: adminEmail,
        subject: `New User Joined Chat: ${data.userId}`,
        text: `A new user (${data.userId}) has joined the chat.\n\nAccess the admin dashboard:  http://localhost:${port}`,
        html: `<p>A new user <strong>${data.userId}</strong> has joined the chat.</p><p><a href=" http://localhost:${port}">Access the admin dashboard</a></p>`,
      };
      break;
    case 'chat_ended':
      const formattedHistory = data.messages.map(msg => `[${msg.timestamp}] ${msg.sender}: ${msg.message}`).join('\n');
      mailOptions = {
        from: process.env.SMTP_USER,
        to: adminEmail,
        subject: `Chat History for User ${data.userId}`,
        text: `Chat session ended for user ${data.userId}.\n\nChat History:\n${formattedHistory}\n\nAccess the admin dashboard:  http://localhost:${port}`,
        html: `<p>Chat session ended for user <strong>${data.userId}</strong>.</p><h3>Chat History</h3><pre>${formattedHistory}</pre><p><a href=" http://localhost:${port}">Access the admin dashboard</a></p>`,
      };
      console.log(`Chat ended for ${data.userId}, sending history:`, formattedHistory);
      break;
    default:
      console.error('Invalid email type:', type);
      return;
  }

  try {
    console.log(`Sending ${type} email for user ${data.userId} to ${adminEmail}`);
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${adminEmail} for ${type} (userId: ${data.userId})`);
  } catch (error) {
    console.error(`Error sending email for ${type}:`, error.message);
  }
}


app.post('/api/notify-message', async (req, res) => {
  const { userId, message, timestamp } = req.body;
  try {
    await sendEmailNotification('new_message', { userId, message, timestamp });
    res.status(200).json({ message: 'Notification email sent' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/api/chat-ended', async (req, res) => {
  const { userId, messages } = req.body;

  if (!userId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    await sendEmailNotification('chat_ended', { userId, messages });
    res.status(200).json({ message: "Chat end email sent successfully" });
  } catch (err) {
    console.error("Failed to send chat end email:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/request-human', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  try {
    await sendEmailNotification('human_request', { userId });
    res.status(200).json({ message: 'Human request email sent' });
  } catch (error) {
    console.error("Error sending human request email:", error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});






app.get('/api/chat-history/:userId', (req, res) => {
  const chatData = readChatFile(); // Function that reads chat.json
  const messages = chatData[req.params.userId] || [];
  res.json(messages);
});


app.post('/api/save-message', (req, res) => {
  const { userId, sender, message, timestamp } = req.body;
  if (!userId || !sender || !message || !timestamp) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const chatPath = path.join(__dirname, 'chat.json');
  let chatData = {};

  if (fs.existsSync(chatPath)) {
    chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
  }

  if (!chatData[userId]) chatData[userId] = [];

  chatData[userId].push({ sender, message, timestamp });

  fs.writeFileSync(chatPath, JSON.stringify(chatData, null, 2));
  res.json({ success: true });
});



// API to return all user IDs
app.get('/api/get-all-user-ids', (req, res) => {
  const chatPath = path.join(__dirname, 'chat.json');
  if (!fs.existsSync(chatPath)) return res.json([]);

  const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
  res.json(Object.keys(chatData));
});


app.get('/api/get-messages', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  const chatPath = path.join(__dirname, 'chat.json');

  if (!fs.existsSync(chatPath)) {
    return res.json({ messages: [] });
  }
  const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
  const userMessages = chatData[userId] || [];

  res.json({ messages: userMessages });
});





// ✅ AI POST Endpoint (kept outside the above route!)
// Load FAQs from JSON
async function loadFAQs() {
  try {
    const data = await fs.readFile(FAQ_FILE, 'utf8');
    return data.trim() ? JSON.parse(data) : [];
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(FAQ_FILE, '[]');
      return [];
    }
    console.error('Error reading FAQ file:', err.message);
    return [];
  }
}

// ✅ AI POST Endpoint (kept outside the above route!)
app.post("/api/ai-reply", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([message]);
    const reply = result.response.text();

    res.json({ success: true, reply });
  } catch (err) {
    console.error("Gemini AI error:", err.message);

    // Rate limit handling
    if (err.message.includes("429")) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again in a few moments.",
      });
    }

    res.status(500).json({ success: false, message: "Gemini AI failed" });
  }
});


//-------------------------------- FQ QUSTIONS ANSWERS ------------------------
// Save FAQs
async function saveFAQs(data) {
  try {
    await fsp.writeFile(FAQ_FILE, JSON.stringify(data, null, 2));
    console.log('FAQs saved.');
  } catch (err) {
    console.error('Error saving FAQs:', err.message);
  }
}

// Load FAQs
async function loadFAQs() {
  try {
    const data = await fsp.readFile(FAQ_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fsp.writeFile(FAQ_FILE, '[]');
      return [];
    }
    console.error('Error reading FAQ file:', err.message);
    return [];
  }
}

// Save Sources

// Load Sources
async function loadSources() {
  try {
    const data = await fsp.readFile(SOURCES_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fsp.writeFile(SOURCES_FILE, '[]');
      return [];
    }
    console.error('Error reading sources:', err.message);
    return [];
  }
}

// Save Knowledge Base
async function saveKnowledgeBase(knowledge) {
  try {
    await fsp.writeFile(KNOWLEDGE_FILE, JSON.stringify(knowledge, null, 2));
  } catch (err) {
    console.error('Error saving knowledge base:', err.message);
  }
}

// Load Knowledge Base
async function loadKnowledgeBase() {
  try {
    const data = await fsp.readFile(KNOWLEDGE_FILE, 'utf8');
    return data.trim() ? JSON.parse(data) : { text: "" };
  } catch (err) {
    await fsp.writeFile(KNOWLEDGE_FILE, JSON.stringify({ text: "" }));
    return { text: "" };
  }
}

// Update Knowledge Base
async function updateKnowledgeBase() {
  const faqs = await loadFAQs();
  const sources = await loadSources();
  const faqText = faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n\n");
  const sourceText = sources.map(s => s.text).join("\n\n");
  const combined = `${faqText}\n\n${sourceText}`.trim();
  await saveKnowledgeBase({ text: combined });
}














app.get('/faqs', async (req, res) => {
  try {
    const faqs = await loadFAQs();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load FAQs' });
  }
});

app.get('/faq-sources', async (req, res) => {
  const sources = await loadSources();
  res.json(sources);
});

app.post('/add-faq', async (req, res) => {
  const { id, question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ status: "error", message: "Question and answer are required" });
  }

  let faqs = await loadFAQs();
  let realId = id && id.trim() !== '' ? id : uuidv4();
  const index = faqs.findIndex(f => f.id === realId);

  if (index !== -1) {
    faqs[index] = { id: realId, question, answer }; // Update
  } else {
    faqs.push({ id: realId, question, answer }); // Add
  }

  await saveFAQs(faqs);
  await updateKnowledgeBase();
  io.emit("faq_updated");

  res.json({ status: "success", message: index !== -1 ? "FAQ updated" : "FAQ added" });
});

app.post('/delete-faq', async (req, res) => {
  const { id } = req.body;
  let faqs = await loadFAQs();
  const index = faqs.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ status: "error", message: "FAQ not found" });
  }

  faqs.splice(index, 1);
  await saveFAQs(faqs);
  await updateKnowledgeBase();
  io.emit("faq_deleted", { id });

  res.json({ status: "success", message: "FAQ deleted" });
});


// ----------------------EMAIL NOTIFICATIONS -----------------------------------------



async function saveConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

app.get('/admin-email', async (req, res) => {
  try {
    const config = await loadConfig();
    res.json({ email: config.adminEmail });
  } catch (error) {
    console.error('GET /admin-email error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

app.post('/update-admin-email', async (req, res) => {
  try {
    const { adminEmail } = req.body;
    console.log('Received adminEmail:', adminEmail);

    if (!adminEmail) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }
    const config = await loadConfig();
    config.adminEmail = adminEmail;
    await saveConfig(config);

    res.json({ status: 'success', message: 'Admin email updated' });
  } catch (error) {
    console.error('POST /update-admin-email error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});




// Create widget with dynamic widgetId
app.post('/api/create-widget', (req, res) => {
  const newWidget = req.body;
  const widgets = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Generate unique widgetId
  const widgetId = crypto.randomBytes(8).toString('hex'); // 16-character ID
  newWidget.widgetId = widgetId;

  widgets.push(newWidget);
  fs.writeFileSync(filePath, JSON.stringify(widgets, null, 2));
  res.json({ success: true, message: 'Widget created successfully', widgetId });
});
//-------------------multer ----------------------

const SOURCES_FILE = path.join(__dirname, 'faqSources.json');

// Multer config for PDF upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Load or initialize sources
const getSources = () => {
  try {
    return JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'));
  } catch {
    return [];
  }
};

async function saveSources(sources) {
  try {
    await fsp.writeFile(SOURCES_FILE, JSON.stringify(sources, null, 2));
    io.emit("source_updated"); // optional real-time event
    if (typeof updateKnowledgeBase === 'function') {
      await updateKnowledgeBase(); // optional hook
    }
  } catch (err) {
    console.error('❌ Error saving sources:', err.message);
  }
}

// ✅ Upload PDF
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const sources = getSources();
    sources.push({ type: 'pdf', filename: req.file.filename });
    await saveSources(sources);
    res.json({ message: '✅ PDF uploaded', filename: req.file.filename });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
});

// ✅ Add URL
app.post('/api/add-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const sources = getSources();
    sources.push({ type: 'url', url });
    await saveSources(sources);
    res.json({ message: '✅ URL added' });
  } catch (err) {
    console.error('❌ URL add error:', err.message);
    res.status(500).json({ error: 'Failed to add URL' });
  }
});

// ✅ Get all sources
app.get('/api/sources', (req, res) => {
  console.log('📡 /api/sources hit');
  res.json(getSources());
});



// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});





