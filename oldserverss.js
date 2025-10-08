const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Socket } = require('socket.io');
const multer = require('multer');
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
const { KeyObject } = require('crypto');
const { hasOwn } = require('together-ai/core.mjs');
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const AUTH_USER = { username: "admin", password: "1234" };

// LOGIN PAGE
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Demo.html'));
});

app.get('/admin', (req, res) => {
  if (req.session.loggedIn) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// LOGIN HANDLER
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === AUTH_USER.username && password === AUTH_USER.password) {
    req.session.loggedIn = true;
    return res.redirect('/dashboard#');
  }
  res.send('Invalid credentials <a href="/">Go back</a>');
});
// LOGOUT HANDLER
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Logout failed");
    }
    res.clearCookie('connect.sid'); // optional, but recommended
    res.redirect('/login.html');
  });
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

  // Emit to all sockets
  io.emit('settings-updated', { widgetId, updates });
  console.log()

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

  io.emit('overview-updated', { widgetId, updates });

  res.json({ success: true, message: 'Overview updated successfully.' });
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

// API: EMBED WIDGET SCRIPT
// async function getWidgetSettingsFromDB(widgetId) {
//   const rawData = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
//   const widgets = JSON.parse(rawData);

//   return widgets.find(widget => widget.id === widgetId);
// }

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
    console.log(aiAnswer)

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

// 🔄 Live update for widget settings
socket.on('settings-updated', ({ widgetId: updatedId, updates }) => {
  if (updatedId !== '${data.widgetId}') return;

  console.log("⚙️ settings-updated received:", updates);

  // Show/Hide launcher icon
  if ('show' in updates) {
    const launcher = document.getElementById("custom-chat-launcher");
    if (launcher) launcher.style.display = updates.show ? 'block' : 'none';
  }

  // Update color
  if ('color' in updates) {
    document.documentElement.style.setProperty('--chat-color', updates.color);
  }

  // Update font family
  if ('fontFamily' in updates) {
    document.documentElement.style.setProperty('--chat-font-family', updates.fontFamily);
  }

  // Update font size
  if ('fontSize' in updates) {
    document.documentElement.style.setProperty('--chat-font-size', updates.fontSize);
  }
  // Update font size for overview
  if ('fontSizeOverview' in updates) {
    document.documentElement.style.setProperty('--chat-font-size-overview', updates.fontSizeOverview);
  }

  // Update overview color
  if ('overviewColor' in updates) {
    document.documentElement.style.setProperty('--chat-overview-color', updates.overviewColor);
  }

  // ✅ Update avatar image (moved here from overview-updated)
  if ('imageUrl' in updates) {
    const avatar = document.querySelector('.chat-header img');
    if (avatar) avatar.src = updates.imageUrl;
  }
});


// 🔄 Live update for overview section (like avatar, header, position)
socket.on('overview-updated', ({ widgetId: updatedId, updates }) => {
  if (updatedId !== '${data.widgetId}') return;

  console.log("📢 overview-updated received:", updates);
  // Update header text
  if ('chatHeader' in updates) {
    const header = document.getElementById("chat-headers");
    if (header) {
      const span = header.querySelector("span");
      if (span) span.textContent = updates.chatHeader;
    }
  }

  // Show/hide avatar image
  if ('showImage' in updates) {
    const avatar = document.querySelector('.chat-header img');
    if (avatar) avatar.style.display = updates.showImage ? 'inline' : 'none';
  }

  // ✅ Update position dynamically
  if ('position' in updates) {
    const [newVPos, newHPos] = updates.position.split('-');
    const iconWrapper = document.getElementById("custom-chat-launcher");

    if (iconWrapper) {
      // Clear all previous position styles
      iconWrapper.style.top = "";
      iconWrapper.style.bottom = "";
      iconWrapper.style.left = "";
      iconWrapper.style.right = "";

      // Set new position
      iconWrapper.style[newVPos] = "20px";
      iconWrapper.style[newHPos] = "20px";
    }

    // Update CSS variable if used
    document.documentElement.style.setProperty('--chat-position', updates.position);
  }
});
    function timeAgo(timestamp) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    if (diffInSeconds < 5) return "Just now";
    if (diffInSeconds < 60) return \`\${diffInSeconds} seconds ago\`;
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return \`\${minutes} minutes ago\`;
    const hours = Math.floor(minutes / 60);
    return \`\${hours} hours ago\`;
  }

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
         .header-from {
  padding: 24px;
  background: linear-gradient(135deg, #fda085 0%, #f6d365 100%);
  color: #784438;
  position: relative;
  z-index: 4;
  border-radius: 10px;
  flex: 0 0 auto;
}
  .tidio-1ypjua1 {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 16px;
    line-height: 20px;
}
    .tidio-1cj798s {
    color: currentcolor;
    margin: 4px 0px 0px;
    padding: 0px;
    display: inline-block;
    position: relative;
    font-size: 32px;
    line-height: 40px;
    font-weight: 500;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    vertical-align: bottom;
}

.tidio-1cj798s .emoji {
    width: 31px;
    height: 31px;
}

.rounded-header {
  background: linear-gradient(135deg, #0273ee, rgb(86 133 184));
  padding: 25px 20px 0;
  position: relative;
  color: white;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  overflow: hidden;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.wave {
  position: relative;
  display: block;
  width: 100%;
  height: 50px;
  margin-top: -5px;
}


.emoji {
    width: 20px;
    margin: 0px 2px -5px;
    user-select: none;
}
      \`;
      document.head.appendChild(styleVars);
      let botReplies = [];
      let faqs = [];
      let sources = [];
      let askpdfqustions = [];
      function askQuestion(message) {
      console.log(message);
        return fetch(\`http://localhost:3000/api/ask-question?message=\${encodeURIComponent(message)}\`)
          .then(res => res.json())
          .catch(err => {
            console.error("❌ Error in askQuestion:", err);
            return { answer: "Sorry, no response", source: "Error" };
          });
      }
      // Load all required data including FAQ sources
 // Load static data (bot replies, faqs, sources)
Promise.all([
  fetch('http://localhost:3000/api/bot-replies').then(res => res.json()),
  fetch('http://localhost:3000/api/faqs').then(res => res.json()),
  fetch('http://localhost:3000/api/faq-sources').then(res => res.json())
])
.then(([botData, faqData, sourceData]) => {
  botReplies = botData;
  faqs = faqData;
  sources = sourceData;
  console.log("✅ Static data loaded");
})
.catch(err => {
  console.error("❌ Failed to load static data:", err);
  botReplies = [{ keywords: ['default'], response: "Sorry, I couldn't load replies." }];
});

// Normalize for matching
function normalize(str) {
  return str.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

// Try to match from faqs, sources, or bot replies (fallback if needed)
function getBotResponse(message, fallbackAnswer = '') {
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

  return fallbackAnswer || "I'm not sure how to respond.";
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
icon.innerHTML = '<img src="https://cdn-icons-png.flaticon.com/512/2462/2462719.png" width="40" height="30" style="display:block;" />';

  const chatBox = document.createElement("div");
   chatBox.className = "chat-box";
  chatBox.style.display = "none";

  chatBox.innerHTML = \`
<div class='chat-header' id="chat-headers">
  <img src='${imageUrl}' style="height:30px;width:30px;border-radius:50%;margin-right:8px;" />
  ${chatHeader}
  <button id="close-btn" style="margin-left:auto;background:transparent;border:none;font-size:18px;cursor:pointer;color:white">✕</button>
</div>


<div id="hrFormWrapper" style="dispaly:block; overflow-y:auto;">
<div class="rounded-header">
  Welcome! How can we help?
  <span id="close-humanfrom" style="float:right; cursor:pointer;">X</span>
  <svg class="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 372 15"><path d="M349.8 1.4C334.5.4 318.5 0 302 0h-2.5c-9.1 0-18.4.1-27.8.4-34.5 1-68.3 3-102.3 4.7-14 .5-28 1.2-41.5 1.6C84 7.7 41.6 5.3 0 2.2v8.4c41.6 3 84 5.3 128.2 4.1 13.5-.4 27.5-1.1 41.5-1.6 33.9-1.7 67.8-3.6 102.3-4.7 9.4-.3 18.7-.4 27.8-.4h2.5c16.5 0 32.4.4 47.8 1.4 8.4.3 15.6.7 22 1.2V2.2c-6.5-.5-13.8-.5-22.3-.8z" fill="#fff"></path></svg>  </svg>
</div>


<br/>
  <form id="hr-form">
    <label>Name<span style="color:red">*</span></label>
    <input type="text" name="name" required style="width:100%;padding:4px;margin-bottom:10px;height:38px" />
    <label>Email<span style="color:red">*</span></label>
    <input type="email" name="email" required style="width:100%;padding:4px;margin-bottom:10px;height:38px" />
         <label>Massges<span style="color:red">*</span></label>
    <textarea name="hrfillfrom" required style="width:100%;height:70px;margin-bottom:8px;border-radius:6px;border:1px solid #ccc;"></textarea>
  <button type="submit" style="width:100%;padding:10px;margin-top:10px;background:white;color:#007bff;border:2px solid #007bff;">
  Enquiry form
  </button>
    <button type="button" id="start-chat-now-inside" style="width:100%;padding:10px;background:#007bff;color:white;border:none;border:2px solid #007bff">
       Chat with us
    </button>
  </form>
</div>

<div class='chat-messages' id='chat-msgs' style="display:none;"></div>
<div class='chat-input' style="display:none;">
  <input type='text' id='chat-input' placeholder='Type a message...' onkeydown="if(event.key==='Enter') sendChatMsg()" />
  <button onclick='sendChatMsg()'>Send</button>
</div>

<div class="row mb-3" id="chat-controls">
  <div class="col-12 d-flex justify-content-center">
   <u style="color: blue; cursor: pointer;" id="contact-human">Contact Human</u>&nbsp; 
    <u style="color: red; cursor: pointer; id="end-chat">End Chat</u>
  </div>
  <br/>
</div>

<!-- Confirmation Popup -->
<div id="chat-confirmation" style="display:none;position:absolute;top:30%;left:4%;width:82%;background:white;border-radius:10px;padding:20px;box-shadow:0 0 10px rgba(0,0,0,0.3);z-index:999;text-align:center">
  <p>Are you sure you want to end the chat?</p>
  <button id="confirm-end-chat" style="margin-right:10px;background:red;color:white;padding:10px 15px;border:none;">End</button>
  <button id="cancel-end-chat" style="background:gray;color:white;padding:10px 18px;border:none;">Continue</button>
</div>
<!-- Feedback Form -->
<div id="chat-feedback" style="display:none;padding:20px;">
  <h4>We’d love your feedback!</h4>
  <hr/>
  <form id="feedback-form">
  <center>
  <label>Rating this chat</label>  <br/>
<div class="star-rating" id="starratings">
  <input type="radio" id="star5" name="rating" value="5" /><label for="star5">★</label>
  <input type="radio" id="star4" name="rating" value="4" /><label for="star4">★</label>
  <input type="radio" id="star3" name="rating" value="3" /><label for="star3">★</label>
  <input type="radio" id="star2" name="rating" value="2" /><label for="star2">★</label>
  <input type="radio" id="star1" name="rating" value="1" /><label for="star1">★</label>
</div></center>
       <label>Your Name<span style="color:red">*</span></label>
    <input type="name" name="name" id="feedbackename" required style="width:96%;padding:8px;margin-bottom:5px;height:26px; border-radius:6px;border:1px solid #ccc;" />
          <label>Your Email<span style="color:red">*</span></label>
    <input type="email" name="email" id="feedbackemail" required style="width:96%;padding:8px;margin-bottom:5px;height:26px;border-radius:6px;border: 1px solid #ccc;" />
    <br/>   
    <label>Your feedback:</label>
    <textarea name="feedback" required style="width:100%;height:70px;margin-bottom:8px;border-radius:6px;border:1px solid #ccc;"></textarea>
    <button type="submit" style="background:#007bff;color:white;padding:10px;border:none;width:100%;">Submit Feedback</button>
  </form>
<br>


    \`;

  setTimeout(() => {
    const input = document.getElementById("chat-input");
    const chatBox = document.querySelector(".chat-box");

    if (!input || !chatBox) {
      console.warn("⚠️ Required elements missing.");
      return;
    }
    // Create and append modal
    const modal = document.createElement("div");
    modal.id = "inactivity-modal";
    modal.style.cssText = \`
      position: absolute;
      top: 50%;
      left: 49%;
      width: 78%;
      background: white;
      border-radius: 10px;
      padding: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      z-index: 10000;
      text-align: center;
      display: none;
    \`;

    modal.innerHTML = \`
      <p>⏰ Are you still Connected</p>
      <button id="inactivity-yes" style="margin-right: 10px; padding: 10px 15px; background:rgb(228, 6, 6); color: white; border: none;">Yes</button>
      <button id="inactivity-no" style="padding: 10px 15px; background: rgb(5, 193, 250); color: white; border: none;">No</button>
   \`;

    chatBox.appendChild(modal);

    const yesBtn = modal.querySelector("#inactivity-yes");
    const noBtn = modal.querySelector("#inactivity-no");

    let inactivityTimer;

    function resetTypingTimer() {
      clearTimeout(inactivityTimer);

      inactivityTimer = setTimeout(() => {
        const isChatOpen = chatBox.style.display !== "none";
        const isInputEmpty = input.value.trim() === "";
        const isModalHidden = modal.style.display === "none" || modal.style.display === "";

        if (isChatOpen && isInputEmpty && isModalHidden) {
          modal.style.display = "block";
          chatBox.classList.add("dimmed");
          console.log("⏰ Inactivity detected, showing modal.");
        }
      }, 500000); // 30 seconds
    }

    input.addEventListener("input", resetTypingTimer);

    yesBtn.addEventListener("click", () => {
      modal.style.display = "none";
      chatBox.classList.remove("dimmed");
      resetTypingTimer();
    });

 noBtn.addEventListener("click", (e) => {
  modal.style.display = "none";
  chatBox.style.display = "none";
  
  const chatMsgs = document.getElementById("chat-msgs");
  if (chatMsgs) chatMsgs.innerHTML = "";

  // ✅ Correct usage of event object
  e.target.reset?.(); // Only call if it's a form

  // ✅ Reset user state
  localStorage.removeItem("custom_user_id");
  window.chatEnded = true;
});

    resetTypingTimer();
  }, 1000);

// Function to end the chat (clears UI)
function endChat() {
  const chatMsgs = document.getElementById("chat-msgs");
  const input = document.getElementById("chat-input");
  if (chatMsgs) chatMsgs.innerHTML = "";
  if (input) input.value = "";
  chatBox.style.display = "none";
}

setTimeout(() => {
  const closeBtn = document.getElementById("close-btn");
  const endChatBtn = document.getElementById("end-chat");
  const contactHumanBtn = document.getElementById("contact-human");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("chat-confirmation").style.display = "block";
    });
  }

  // Confirmation modal buttons
  document.getElementById("confirm-end-chat").addEventListener("click", () => {
    document.getElementById("chat-confirmation").style.display = "none";
    document.getElementById("hrFormWrapper").style.display = "none";
    document.getElementById("chat-msgs").style.display = "none";
    document.querySelector(".chat-input").style.display = "none";
    document.getElementById("chat-controls").style.display = "none";
    document.getElementById("chat-headers").style.display = "none";
    document.getElementById("chat-feedback").style.display = "block";
    document.getElementById("inactivity-modal").style.display = "none";
    
  });

  document.getElementById("cancel-end-chat").addEventListener("click", () => {
    document.getElementById("chat-confirmation").style.display = "none";
  });

  document.getElementById("close-humanfrom").addEventListener("click", () => {
      chatBox.style.display = "none";
  });
 
// When submitting feedback form
document.addEventListener("submit", async function (e) {
  if (e.target && e.target.id === "feedback-form") {
    e.preventDefault();

    const feedback = e.target.feedback.value.trim();
    const userId = localStorage.getItem("custom_user_id");
    const name = document.getElementById("feedbackename").value;
    const email = document.getElementById("feedbackemail").value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;

    if (!feedback || !email) return;
    try {
      await fetch("http://localhost:3000/api/chat-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, feedback, rating, email }),
      });

      // ✅ Tell server to disconnect user
      if (userId) {
        socket.emit("disconnect-user", userId);
      }
      // ✅ Clear chat messages
      const chatMsgs = document.getElementById("chat-msgs");
      if (chatMsgs) chatMsgs.innerHTML = "";
        e.target.reset(); // Reset all fields in the form
      // ✅ Reset user state
      localStorage.removeItem("custom_user_id");
      window.chatEnded = true;
      // ✅ Hide chat box
      if (typeof chatBox !== "undefined") chatBox.style.display = "none";
  alert("✅ Thank you! Your feedback successfully.");
      console.log("✅ Feedback submitted and user session ended");
    } catch (err) {
      console.error("❌ Error submitting feedback:", err);
    }
  }
});


  if (endChatBtn) {
    endChatBtn.addEventListener("click", async () => {
      endChat();
      const userId = localStorage.getItem("custom_user_id");
      const chatMsgs = Array.from(document.querySelectorAll("#chat-msgs .message")).map(msgEl => {
        let sender = "user";
        if (msgEl.classList.contains("bot")) sender = "bot";
        else if (msgEl.classList.contains("admin")) sender = "admin";
        return {
          timestamp: new Date().toISOString(),
          sender,
          message: msgEl.innerText.trim()
        };
      });
      try {
        await fetch("http://localhost:3000/api/chat-ended", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, messages: chatMsgs }),
        });
        console.log("✅ End chat email sent");
      } catch (error) {
        console.error("❌ Error sending chat history:", error);
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
}, 1000);

// Icon click logic



// Chat Icon Toggle Handler
icon.onclick = function () {
  const chatBox = document.querySelector(".chat-box");
  const isHidden = chatBox.style.display === 'none' || chatBox.style.display === '';
  chatBox.style.display = isHidden ? 'flex' : 'none';

  const hrForm = document.getElementById("hrFormWrapper");
  const chatMsgs = document.getElementById("chat-msgs");
  const chatInput = document.querySelector(".chat-input");
  const chatControls = document.getElementById("chat-controls");
  const chatHeader = document.getElementById("chat-headers");
  const chatFeedback = document.getElementById("chat-feedback");
  const inactivitymodal = document.getElementById("inactivity-modal");
  

  if (isHidden) {
    userId = crypto.randomUUID();
    localStorage.setItem("custom_user_id", userId);
    hasNotified = false;

    hrForm.style.display = 'block';
    chatMsgs.style.display = 'none';
    chatInput.style.display = 'none';
    chatControls.style.display = 'none';
    chatHeader.style.display = 'none';
    chatFeedback.style.display = 'none';
    inactivitymodal.style.display = 'none';
    

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

// Handle Form Submission


setTimeout(() => {
document.addEventListener("submit", async function (e) {
  if (e.target && e.target.id === "hr-form") {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const hrfillfrom = e.target.email.value.trim();
    if (!name || !email || !hrfillfrom) return;

    try {
      const response = await fetch("http://localhost:3000/api/hr-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email,hrfillfrom }),
      });

      const result = await response.json();
      if (result.success) {
        showChatInterface();
      }
    } catch (err) {
      console.error("⚠️ Error sending form:", err);
    }
  }
});
}, 500); // wait for DOM insert

setTimeout(() => {
  const chatStartBtn = document.getElementById("start-chat-now-inside");
  const chatBox = document.querySelector(".chat-box");

  if (chatStartBtn && chatBox) {
    chatStartBtn.addEventListener("click", () => {
      chatBox.style.display = "flex";
      showChatInterface(); // optional if you have this defined
    });
  }
}, 500); // wait for DOM insert


// Show Chat Interface Function
function showChatInterface() {
  const hrForm = document.getElementById("hrFormWrapper") || document.getElementById("hr-form");
  const chatMsgs = document.getElementById("chat-msgs");
  const chatInput = document.querySelector(".chat-input");
  const chatControls = document.getElementById("chat-controls");
  const chatHeader = document.getElementById("chat-headers");
  const chatFeedback = document.getElementById("chat-feedback");
  const headersfrom = document.getElementById("headers-from");
  
  if (hrForm) hrForm.style.display = "none";
  if (chatMsgs) chatMsgs.style.display = "block";
  if (chatInput) chatInput.style.display = "flex";
  if (chatControls) chatControls.style.display = "flex";
  if (chatHeader) chatHeader.style.display = "flex";
  if (chatFeedback) chatFeedback.style.display = "none";
  if (headersfrom) headersfrom.style.display = "none";
  userId = localStorage.getItem("custom_user_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("custom_user_id", userId);
  }

  if (typeof socket !== "undefined") {
    if (socket.connected) {
      socket.emit("register", userId, true);
    } else {
      socket.on("connect", () => {
        socket.emit("register", userId, true);
      });
    }
  }

  const timestamp = new Date();
  const welcomeMsg = document.createElement("div");
  welcomeMsg.className = "chat-msg bot-msg";
  welcomeMsg.innerHTML = \`
    <div>${welcome}</div>
    <div class="time-ago"></div>
  \`;
  chatMsgs.appendChild(welcomeMsg);
  welcomeMsg.querySelector(".time-ago").innerText = timeAgo(timestamp);
  setInterval(() => {
    welcomeMsg.querySelector(".time-ago").innerText = timeAgo(timestamp);
  }, 10000);
}


    // === Typing indicator before bot replies ===
function sendChatMsg() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;

  const chatMsgs = document.getElementById("chat-msgs");
  const userTimestamp = new Date();

  // User message
  const userDiv = document.createElement("div");
  userDiv.className = "chat-msg user-msg";
  userDiv.innerHTML = msg;
  chatMsgs.appendChild(userDiv);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  input.value = "";

  // Save user message
  fetch('http://localhost:3000/api/save-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sender: "user", message: msg, timestamp: userTimestamp })
  }).catch(err => console.error("❌ Failed to save user message:", err));

  // Show typing dots
  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-msg bot-msg typing";
  typingDiv.innerHTML = \`
  <div class="typing-dots">
    <span></span>
    <span></span>
    <span></span>
  </div>
\`
  chatMsgs.appendChild(typingDiv);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;

  // Ask bot and replace typing dots
  askQuestion(msg)
    .then(response => {
      const reply = response.answer || getBotResponse(msg);
      const botTimestamp = new Date();

      typingDiv.innerHTML = reply;
      typingDiv.classList.remove("typing");
      chatMsgs.scrollTop = chatMsgs.scrollHeight;

      return fetch('http://localhost:3000/api/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sender: "bot", message: reply, timestamp: botTimestamp })
      });
    })
    .catch(err => {
      console.error("❌ Failed to get bot response:", err);
      typingDiv.innerHTML = "⚠️ Sorry, something went wrong.";
    });
}

// === Admin message with typing simulation ===
socket.on('admin-message', (data) => {
  console.log("✅ Received admin message:", data);
  const chatMsgs = document.getElementById("chat-msgs");
  if (!chatMsgs) {
    console.error("❌ chat-msgs element not found!");
    return;
  }

  // Show typing dots first
  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-msg admin-msg typing";
  typingDiv.innerHTML = "<span class='typing-dots'>...</span>";
  chatMsgs.appendChild(typingDiv);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;

  // Simulate delay then replace with message
  setTimeout(() => {
    typingDiv.innerHTML = data.message;
    typingDiv.classList.remove("typing");
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }, 2000); // delay can be adjusted
});



  window.sendChatMsg = sendChatMsg;
  window.endChat = endChat; // Register globally if needed
  iconWrapper.appendChild(tooltip);
  iconWrapper.appendChild(icon);
  document.body.appendChild(iconWrapper);
  document.body.appendChild(chatBox);
   // Dragging functionality
  document.body.appendChild(chatBox);
// Dragging functionality
const chatHeaderEl = chatBox.querySelector('.chat-header');
let isDragging = false,
    offsetX = 0,
    offsetY = 0;
chatHeaderEl.addEventListener('mousedown', function (e) {
  isDragging = true;
  const rect = chatBox.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  document.addEventListener('mousemove', dragChatBox);
  document.addEventListener('mouseup', stopDragging);
});
function dragChatBox(e) {
  if (!isDragging) return;
  const boxWidth = chatBox.offsetWidth;
  const boxHeight = chatBox.offsetHeight;
  let newLeft = e.clientX - offsetX;
  let newTop = e.clientY - offsetY;
  // Clamp values to keep box within screen
  newLeft = Math.max(0, Math.min(window.innerWidth - boxWidth, newLeft));
  newTop = Math.max(0, Math.min(window.innerHeight - boxHeight, newTop));
  chatBox.style.position = "fixed";
  chatBox.style.left = newLeft + "px";
  chatBox.style.top = newTop + "px";
  chatBox.style.right = "auto";
  chatBox.style.bottom = "auto";
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





app.post('/api/chat-feedback', async (req, res) => {
  const { userId, name, feedback, rating, email } = req.body;

  if (!userId || !name || !feedback || !email) {
    return res.status(400).json({ success: false, message: "Missing userId, name, feedback or email" });
  }
console.log(email);
  const feedbackData = {
    userId,
    name,
    email,
    feedback,
    rating,
    timestamp: new Date().toISOString()
  };

  const filePath = path.join(__dirname, 'chat-feedback.json');

  try {
    // Load existing feedback data from file if exists
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      existingData = JSON.parse(fileContent || '[]');
    }
       // Add new feedback
    existingData.push(feedbackData);

    // Save updated feedback to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    // Send confirmation email
    const mailOptions = {
      from: process.env.SMTP_USER,   // Sender (admin)
      to: email,  
                       // User's email
      subject: 'Feedback Received - Chat Application',
      html: `
        <p>Thank you, <strong>${name}</strong>, for your feedback!</p>
        <p>Your feedback has been recorded successfully.</p>
        <p><a href="http://localhost:3000/admin.html">Visit Admin Panel</a></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Feedback saved and email sent:", name, email);

    res.json({ success: true, message: 'Feedback saved and email sent' });

  } catch (error) {
    console.error("❌ Error in feedback processing:", error);
    res.status(500).json({ success: false, message: "Server error while saving feedback" });
  }
});




app.post('/api/hr-form', async (req, res) => {
  const { name, email ,hrfillfrom} = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  console.log("Form received:", name, email,hrfillfrom);
  const mailOptions = {
    from: process.env.SMTP_USER,     // Admin email (sender)
    to: email,                       // User's submitted email
    subject: `New Human Assistance Request from `,
    text: `User has requested human assistance.\n\nAccess the admin dashboard: http://localhost:3000/admin.html`,
    html: `<p>User has requested human assistance.</p><p><a href="http://localhost:3000/admin.html">Access the admin dashboard</a></p>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to user:", email);
    res.status(200).json({ success: true, message: 'Form received and email sent to user' });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
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

