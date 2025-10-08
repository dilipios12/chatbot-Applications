// const express = require('express');
// const path = require('path');
// const session = require('express-session');
// const bodyParser = require('body-parser');
// const { Socket } = require('socket.io');
// const multer = require('multer');
// const cors = require('cors');
// const axios = require('axios');
// const nodemailer = require('nodemailer');
// const Together = require('together-ai');
// const fs = require('fs'); // ✅ this allows await
// const fsp = require('fs/promises');   // for async/await usage
// const { v4: uuidv4 } = require('uuid');
// const CONFIG_FILE = path.join(__dirname, 'config.json');
// const sanitizeHtml = require('sanitize-html');

// const FAQ_FILE = path.join(__dirname, "faqs.json");
// const KNOWLEDGE_FILE = path.join(__dirname, "knowledge_base.json");
// const app = express();
// const pdfParse = require('pdf-parse');


// const http = require('http');
// const PORT = 3000;
// app.use(cors());
// // Allow all origins and methods
// app.use(cors({
//   origin: '*', // Allow any origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all methods
//   allowedHeaders: ['Content-Type', 'Authorization'], // Allow common headers
// }));

// app.use(express.static('public'));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(session({ secret: 'chat-secret', resave: false, saveUninitialized: true }));


// const { Server } = require('socket.io');
// const server = require('http').createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: '*', // OR 'http://localhost:5173' etc.
//     methods: ['GET', 'POST']
//   }
// });

// require('dotenv').config(); // Load environment variables from .env
// const logger = require('./logger'); // assuming you created one like shown before

// logger.info('Loaded .env variables:', {
//   SMTP_HOST: process.env.SMTP_HOST,
//   SMTP_PORT: process.env.SMTP_PORT,
//   SMTP_USER: process.env.SMTP_USER ? '[SET]' : '[UNSET]',
//   SMTP_PASS: process.env.SMTP_PASS ? '[SET]' : '[UNSET]',
//   ADMIN_EMAIL: process.env.ADMIN_EMAIL,
//   TOGETHER_API_KEY: process.env.TOGETHER_API_KEY ? '[SET]' : '[UNSET]',
// });

// const chatFilePath = path.join(__dirname, 'chat.json');
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { console } = require('inspector');
// const { create } = require('domain');
// const { KeyObject } = require('crypto');
// const { hasOwn } = require('together-ai/core.mjs');
// require("dotenv").config();

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// const AUTH_USER = { username: "admin", password: "" };

// app.get('/resister',(req,res)=>{
//     res.sendFile(path.join(__dirname, 'views', 'Register.html'));
// })

// // LOGIN PAGE
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'Demo.html'));
// });

// app.get('/admin', (req, res) => { 
//   if (req.session.loggedIn) return res.redirect('/dashboard');
//   res.sendFile(path.join(__dirname, 'views', 'login.html'));
// });


// app.get("/api/all-users", (req, res) => {
//   const users = loadUsers();
//   res.json(users);
// });

// // Helper: Load users
// const loadUsers = () => {
//   try {
//     const data = fs.readFileSync('user.json');
//     return JSON.parse(data);
//   } catch (err) {
//     return [];
//   }
// };
// // Helper: Save users
// const saveUsers = (users) => {
//   fs.writeFileSync('user.json', JSON.stringify(users, null, 2));
// };




// function formatDateTime(date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
//   const day = String(date.getDate()).padStart(2, '0');

//   let hours = date.getHours();
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   const ampm = hours >= 12 ? 'PM' : 'AM';

//   hours = hours % 12;
//   hours = hours ? hours : 12; // 0 => 12

//   const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
//   return `${year}-${month}-${day} ${formattedTime}`;
// }


// // Register API
// app.post('/api/register', (req, res) => {
//   const { username, password, email, propertyUrl } = req.body;
//   const errors = {};
//   const users = loadUsers();
//   const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
//   if (!usernameRegex.test(username)) {
//     errors.username = "Username must be 4-20 alphanumeric characters.";
//   }

//   if (!password || password.length < 4) {
//     errors.password = "Password must be at least 4 characters.";
//   }

//   if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
//     errors.username = "Username already exists.";
//   }

//   if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
//     errors.email = "Email already registered.";
//   }

//   if (!propertyUrl) {
//     errors.widget = "Property name and URL required for widget creation.";
//   }

//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({ errors });
//   }

// const createdAt = formatDateTime(new Date());
//  const role ="admin";
//    const status= "active";
//    const index = users.length; // assume users is an array of existing users
//    const userId = `${1001 + index}`; 
//   // Save user
//   users.push({ userId, username, email, password,role, status,createdAt});
//   saveUsers(users);
//   console.log("New User Registered:", { username, email });

//   // Create widget after user registers
//   const widgetId = generateWidgetId();
//   const widgetData = {
//     widgetId,
//     welcome: "Welcome to Iosandweb Technology",
//     color: "#007bff",
//     overviewColor: "#0a6fbd",
//     show: true,
//     position: "bottom-right",
//     fontSizeOverview: "",
//     fontSize: "",
//     fontFamily: "",
//     propertyUrl,
//     status: "active",
//     forwardEmail: "support@example.com",
//     chatHeader: "",
//     showImage: {},
//     imageUrl: null,
//     createdBy: username // <-- This links widget to user
//   };
//   saveWidgetToDb(widgetData);
//   console.log("Widget created for:", username);

//   return res.status(200).json({ message: "Registration & widget creation successful!", widgetData });
// });





// function loadJSON(filePath) {
//   if (fs.existsSync(filePath)) {
//     return JSON.parse(fs.readFileSync(filePath, 'utf8'));
//   }
//   return [];
// }

// function saveJSON(filePath, data) {
//   fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
// }




// //----------------DELETE THE ADMIN DATA--------------------------
// app.delete('/api/delete-user/:userId', (req, res) => {
//   const userId = req.params.userId;

//   const usersFile = path.join(__dirname, 'user.json');
//   const dbFile = path.join(__dirname, 'db.json');

//   // Load both files
//   let users = loadJSON(usersFile);
//   let widgets = loadJSON(dbFile);

//   // Find user by userId
//   const userToDelete = users.find(u => u.userId === userId);
//   if (!userToDelete) {
//     return res.status(404).json({ message: 'User not found' });
//   }

//   const username = userToDelete.username;
//   console.log("Deleting user and widgets for:", username);

//   // 1. Delete user from user.json
//   users = users.filter(u => u.userId !== userId);

//   // 2. Delete related widgets from db.json where createdBy matches username
//   widgets = widgets.filter(w => {
//     if (!w.createdBy) return true;
//     return w.createdBy.toLowerCase() !== username.toLowerCase();
//   });

//   // Save updated data back to files
//   saveJSON(usersFile, users);
//   saveJSON(dbFile, widgets);

//   res.status(200).json({ message: `User '${username}' deleted successfully.` });
// });






// //---------------------- UPDATE API -----------------------------//
// app.put('/api/update/admin/:userId', (req, res) => {
//   const { userId } = req.params;
//   const { username, password, email, status } = req.body;

//   const usersFile = path.join(__dirname, 'user.json');
//   const dbFile = path.join(__dirname, 'db.json');

//   let users = loadJSON(usersFile);
//   let widgets = loadJSON(dbFile);

//   const userIndex = users.findIndex(u => u.userId === userId);
//   if (userIndex === -1) {
//     return res.status(404).json({ error: "User not found" });
//   }

//   const oldUsername = users[userIndex].username;

//   // Update user details
//   if (username) users[userIndex].username = username;
//   if (password) users[userIndex].password = password;
//   if (email) users[userIndex].email = email;
//   if (status) users[userIndex].status = status;

//   saveJSON(usersFile, users);

//   // Update widget(s) where createdBy matches oldUsername
//   widgets = widgets.map(widget => {
//     if (
//       widget.createdBy &&
//       widget.createdBy.toLowerCase() === oldUsername.toLowerCase()
//     ) {
//       return {
//         ...widget,
//         createdBy: username,
//         status: status || widget.status  // update status if provided
//       };
//     }
//     return widget;
//   });

//   saveJSON(dbFile, widgets);

//   return res.json({ message: "User updated successfully" });
// });









// app.get('/api/my-widget', (req, res) => {
//   const username = req.session.username;
//   if (!username) return res.status(401).json({ message: 'Unauthorized' });

//   const filePath = path.join(__dirname, 'db.json');
//   const db = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//   const myWidgets = db.filter(w => w.createdBy === username && w.status === 'active');

//   res.json(myWidgets);
// });

// // Helper: Save users
// const saveUsersprofile = (users) => {
//   fs.writeFileSync('admin-new-property.json', JSON.stringify(users, null, 2));
// };


// //------------------- login the paqge---------------------------------
// app.post('/api/login', (req, res) => {
//   const { username, password } = req.body;
//   const users = loadUsers();

//   const user = users.find(u => u.username === username && u.password === password);
//   if (!user) return res.status(401).json({ message: "Invalid credentials." });

//   const dbPath = path.join(__dirname, 'db.json');
//   let widgets = [];
//   if (fs.existsSync(dbPath)) {
//     widgets = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
//   }

//   // Debug logs
//   console.log("Searching for widget for username:", username);
//  const userWidget = widgets.find(
//   w => w.createdBy.toLowerCase() === username.toLowerCase() 
// );

//   console.log("Found widget:", userWidget);

//   req.session.loggedIn = true;
//   req.session.username = username;

//   const widgetId = userWidget ? userWidget.widgetId : null;
//   const propertyUrl = userWidget ? userWidget.propertyUrl : null;

//   res.status(200).json({
//     success: true,
//     username,
//     widgetId,
//     propertyUrl // send widgetId (could be null if not found)
//   });
// });



// //--------------------------------------LOGOUT HANDLER--------------------------------
// app.post('/logout', (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.error("Logout error:", err);
//       return res.status(500).send("Logout failed");
//     }
//     res.clearCookie('connect.sid'); // optional, but recommended
//     res.redirect('/login.html');
//   });
// });














// // DASHBOARD PAGE
// app.get('/dashboard', (req, res) => {
//   if (!req.session.loggedIn) return res.redirect('/');
//   res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
// });

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT),
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// transporter.verify((error) => {
//   if (error) console.error('SMTP Verification Error:', error.message);
//   else console.log('SMTP Server is ready');
// });









// app.get('/api/all-widgets', (req, res) => {
//   const filePath = path.join(__dirname, 'db.json');
//   try {
//     const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to read widgets.' });
//   }
// });


// // Generate dynamic widget ID
// const generateWidgetId = () => crypto.randomUUID();

// // Save new widget to db.json
// const saveWidgetToDb = (widgetData) => {
//   const filePath = path.join(__dirname, 'db.json');
//   let db = [];
//   try {
//     if (fs.existsSync(filePath)) {
//       db = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//     }
//   } catch (err) {
//     console.error('Error reading db.json:', err.message);
//   }
//   db.push(widgetData);
//   fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
// };


// app.get('/api/widgets-by-user', (req, res) => {
//   const username = req.query.username;
//   const filePath = path.join(__dirname, 'db.json');
//   try {
//     const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//     const userWidgets = data.filter(w => w.createdBy === username);
//     res.json(userWidgets);
//   } catch (err) {
//     console.error('Error reading db.json:', err.message);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });
// //---------------------------------------------------------------------------
// app.get('/api/track-data', (req, res) => {
//   const trackFilePath = path.join(__dirname, 'track.json');
//   if (!fs.existsSync(trackFilePath)) {
//     return res.json([]);
//   }
//   try {
//     const data = fs.readFileSync(trackFilePath, 'utf8');
//     const json = JSON.parse(data);
//     res.json(Array.isArray(json) ? json : []);
//   } catch (err) {
//     console.error('Error reading track.json:', err.message);
//     res.status(500).json({ error: 'Failed to read track data' });
//   }
// });


// // ________________________   API: GET SETTINGS ---------------------------------------

// // GET: Return widget by ID
// app.get('/api/settings', (req, res) => {
//   const { id } = req.query;
//   const filePath = path.join(__dirname, 'db.json');
//   try {
//     const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//     const widget = data.find(w => w.widgetId === id);

//     if (!widget) {
//       return res.status(404).json({ success: false, message: 'Widget not found' });
//     }

//     res.json(widget);
//   } catch (err) {
//     console.error('Error reading db.json:', err.message);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });






// // GET: Return latest active widget ID
// // ----------------------  API: UPDATE SETTINGS ----------------------------------
// // Define the helper functions
// const readJSON = (filePath) => {
//   try {
//     const data = fs.readFileSync(filePath, 'utf-8');
//     return JSON.parse(data);
//   } catch (err) {
//     console.error('Error reading JSON:', err);
//     return [];
//   }
// };

// const writeJSON = (filePath, data) => {
//   try {
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
//   } catch (err) {
//     console.error('Error writing JSON:', err);
//   }
// };



// const getLatestActiveWidgetId = () => {
//   const filePath = path.join(__dirname, 'db.json');
//   const widgets = readJSON(filePath);
//   const activeWidgets = widgets.filter(w => w.status === 'active');
//   if (activeWidgets.length === 0) return null;
//   return activeWidgets[activeWidgets.length - 1].widgetId;
// };


// // app.get('/api/latest-widget', (req, res) => {
// //   const filePath = path.join(__dirname, 'db.json');
// //   try {
// //     const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
// //     if (data.length === 0) {
// //       return res.status(404).json({ message: "No widgets found." });
// //     }
// //     const latestWidget = data[data.length - 1]; // get last entry
// //     res.json({ widgetId: latestWidget.widgetId });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error reading widgets." });
// //   }
// // });



// //POST: Update settings only for the latest active widget
// app.post('/api/update-settings', (req, res) => {
//   const filePath = path.join(__dirname, 'db.json');
//   const widgets = readJSON(filePath);
//   const activeWidgets = widgets.filter(w => w.status === 'active');

//   if (activeWidgets.length === 0) {
//     return res.status(404).json({ success: false, message: 'No active widgets found' });
//   }

//   const latestActiveWidgetId = activeWidgets[activeWidgets.length - 1].widgetId;
//   const index = widgets.findIndex(w => w.widgetId === latestActiveWidgetId);
//   if (index === -1) {
//     return res.status(404).json({ success: false, message: 'Active widget not found' });
//   }

//   const { ...updates } = req.body;
//   widgets[index] = { ...widgets[index], ...updates };
//   writeJSON(filePath, widgets);

//   io.emit('settings-updated', { widgetId: latestActiveWidgetId, updates });

//   res.json({ success: true, message: 'Settings updated successfully.' });
// });









// // ✅ POST: Update overview only for the latest active widget
// app.post('/api/update-overview', (req, res) => {
//   const filePath = path.join(__dirname, 'db.json');
//   const widgets = readJSON(filePath);
//   const activeWidgets = widgets.filter(w => w.status === 'active');

//   if (activeWidgets.length === 0) {
//     return res.status(404).json({ success: false, message: 'No active widgets found' });
//   }

//   const latestActiveWidgetId = activeWidgets[activeWidgets.length - 1].widgetId;
//   const index = widgets.findIndex(w => w.widgetId === latestActiveWidgetId);
//   if (index === -1) {
//     return res.status(404).json({ success: false, message: 'Active widget not found' });
//   }

//   const { ...updates } = req.body;
//   widgets[index] = { ...widgets[index], ...updates };
//   writeJSON(filePath, widgets);

//   io.emit('overview-updated', { widgetId: latestActiveWidgetId, updates });

//   res.json({ success: true, message: 'Overview updated successfully.' });
// });



// function saveChatFile(data) {
//   fs.writeFileSync('chat.json', JSON.stringify(data, null, 2));
// }

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);
//   let registeredUserId = null;

//   socket.on('register', (userId, isNew) => {
//     console.log(`🆕 Registering user: ${userId} with socket ${socket.id}`);
//     registeredUserId = userId;
//     connectedUsers[userId] = socket.id;
//     activeUsers.add(userId);
//   });
//   socket.on('send-message', (data) => {
//     console.log(`📨 Received message from ${data.userId}: ${data.message}`);
//   });

//   socket.on('admin-reply', ({ userId, message }) => {
//     const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     const chatData = JSON.parse(fs.readFileSync('chat.json', 'utf8') || '{}');
//     if (!chatData[userId]) chatData[userId] = [];
//     chatData[userId].push({ sender: 'admin', message, timestamp });
//     saveChatFile(chatData);
//     const userSocketId = connectedUsers[userId];
//     if (userSocketId) {
//       io.to(userSocketId).emit('admin-message', { userId, sender: 'admin', message, timestamp });
//     }
//   });

//   socket.on('disconnect-user', (userId) => {
//     if (connectedUsers[userId] === socket.id) {
//       delete connectedUsers[userId];
//       activeUsers.delete(userId);
//       console.log(`User ${userId} manually disconnected.`);
//     }
//   });

//   socket.on('disconnect', () => {
//     if (registeredUserId && connectedUsers[registeredUserId] === socket.id) {
//       delete connectedUsers[registeredUserId];
//       activeUsers.delete(registeredUserId);
//       console.log(`User ${registeredUserId} disconnected.`);
//     }
//   });
// });

// // API: EMBED WIDGET SCRIPT
// // async function getWidgetSettingsFromDB(widgetId) {
// //   const rawData = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
// //   const widgets = JSON.parse(rawData);

// //   return widgets.find(widget => widget.id === widgetId);
// // }

// // Load widget settings from db.json for a specific widget ID


// async function getWidgetSettingsFromDB(widgetId) {
//   const rawData = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
//   const widgets = JSON.parse(rawData);

//   return widgets.find(widget => widget.id === widgetId);
// }
// // Get active users
// function readChatFile() {
//   if (!fs.existsSync(chatFilePath)) return {};
//   const raw = fs.readFileSync(chatFilePath, 'utf-8');
//   return JSON.parse(raw || '{}');
// }

// function saveChatFile(data) {
//   fs.writeFileSync(chatFilePath, JSON.stringify(data, null, 2));
// }

// // ✅ Global maps
// app.get('/api/chat-history/:userId', (req, res) => {
//   const chatPath = path.join(__dirname, 'chat.json');
//   const chatData = fs.existsSync(chatPath)
//     ? JSON.parse(fs.readFileSync(chatPath, 'utf8'))
//     : {};
//   res.json(chatData[req.params.userId] || []);
// });






// function saveMessage(userId, sender, message, timestamp) {
//   const chatPath = path.join(__dirname, 'chat.json');
//   let chatData = {};

//   if (fs.existsSync(chatPath)) {
//     chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
//   }

//   if (!chatData[userId]) chatData[userId] = [];
//   chatData[userId].push({ sender, message, timestamp });

//   fs.writeFileSync(chatPath, JSON.stringify(chatData, null, 2));
// }



// const activeUsers = new Set();
// const connectedUsers = {};

// app.get('/api/active-users', (req, res) => {
//   console.log("📊 Active users being sent:", Array.from(activeUsers));
//   console.log("🧠 Connected users:", connectedUsers);
//   res.json(Array.from(activeUsers));
// });

// // Chat history (optional)
// app.get('/api/chat-history/:userId', (req, res) => {
//   const userId = req.params.userId;
//   const chatData = JSON.parse(fs.readFileSync('chat.json', 'utf8') || '{}');
//   res.json(chatData[userId] || []);
// });





// // ✅ API to get chat history for a user
// app.get('/api/chat/:userId', (req, res) => {
//   const userId = req.params.userId;
//   const chatData = readChatFile();

//   if (chatData[userId]) {
//     res.json(chatData[userId]); // return array of messages
//   } else {
//     res.json([]); // return empty array if no messages
//   }
// });

// //--------------------------- get the All chat Ai Data ----------------------


// // Serve bot replies from a JSON file
// app.get('/api/bot-replies', (req, res) => {
//   const replies = JSON.parse(fs.readFileSync('botReplies.json', 'utf8'));
//   res.json(replies);
// });
// app.get('/api/faqs', async (req, res) => {
//   try {
//     console.log("📁 Looking for:", FAQ_FILE);
//     const data = await fs.readFileSync(FAQ_FILE, 'utf8');
//     const faqs = JSON.parse(data);
//     res.json(faqs);
//   } catch (err) {
//     console.error("❌ Error loading faqs.json:", err);
//     res.status(500).json({ error: 'Failed to load FAQs' });
//   }
// });

// app.get('/api/faq-sources', (req, res) => {
//   try {
//     const sources = JSON.parse(fs.readFileSync('faqSources.json', 'utf8'));
//     res.json(sources);
//   } catch (err) {
//     console.error("❌ Error loading faqSources.json:", err);
//     res.status(500).json({ error: 'Failed to load sources' });
//   }
// });


// const SOURCES_FILE = path.join(__dirname, 'faqSources.json');



// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => {
//     const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') cb(null, true);
//     else cb(new Error('Only PDF files are allowed!'));
//   }
// });





// // Load or initialize sources
// const getSources = () => {
//   try {
//     return JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'));
//   } catch {
//     return [];
//   }
// };

// async function saveSources(sources) {
//   try {
//     await fsp.writeFile(SOURCES_FILE, JSON.stringify(sources, null, 2));
//     io.emit("source_updated"); // optional real-time event
//     if (typeof updateKnowledgeBase === 'function') {
//       await updateKnowledgeBase(); // optional hook
//     }
//   } catch (err) {
//     console.error('❌ Error saving sources:', err.message);
//   }
// }

// // ✅ Add URL

// app.post('/api/add-url', async (req, res) => {
//   const { url } = req.body;
//   if (!url) return res.status(400).json({ error: 'URL required' });

//   try {
//     // 1. Fetch page HTML
//     const response = await axios.get(url);

//     // 2. Extract and sanitize visible text
//     let rawText = sanitizeHtml(response.data, {
//       allowedTags: [],
//       allowedAttributes: {}
//     });

//     rawText = rawText.replace(/\s+/g, ' ').trim();

//     // 3. Save source with text
//     const sources = getSources();
//     sources.push({
//       type: 'url',
//       url,
//       text: rawText
//     });

//     await saveSources(sources);
//     res.json({ message: '✅ URL added with content', url });
//   } catch (err) {
//     console.error('❌ URL add error:', err.message);
//     res.status(500).json({ error: 'Failed to fetch or save URL content' });
//   }
// });

// // ✅ Upload PDF API
// app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
//   try {
//     const dataBuffer = fs.readFileSync(req.file.path);
//     const pdfData = await pdfParse(dataBuffer);
//     const sources = getSources();

//     sources.push({
//       type: 'pdf',
//       filename: req.file.filename,
//       text: pdfData.text.replace(/\s+/g, ' ').trim()
//     });

//     await saveSources(sources);
//     res.json({ message: '✅ PDF uploaded', filename: req.file.filename });
//   } catch (err) {
//     console.error('❌ Upload error:', err.message);
//     res.status(500).json({ error: 'Failed to upload PDF' });
//   }
// });

// // ✅ Static file serving
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const TOGETHER_API_KEY = '9b95f35ce1e2044a91852f23f0f6e554bfb128ced09848fe0447e7f0fc57a6d6';
// // ✅ Call Together AI
// async function askTogetherAI(userInput) {
//   try {
//     const response = await axios.post(
//       "https://api.together.xyz/v1/chat/completions",
//       {
//         model: "meta-llama/Llama-3-70b-chat-hf",
//         messages: [
//           {
//             role: "system",
//             content: `
// You are a smart assistant that provides clear, helpful, and human-like answers in English.
// Avoid repeating the question. Speak like a helpful expert, not a chatbot.
// Be concise, but explain enough so the user understands without needing to ask again.
// For technical or factual queries, answer directly. For vague questions, politely ask for clarification.
// Avoid unnecessary greetings or sign-offs.
//             `.trim()
//           },
//           {
//             role: "user",
//             content: userInput
//           }
//         ],
//         temperature: 0.3,
//         top_p: 0.9,
//         max_tokens: 200
//       },
//       {
//         headers: {
//           "Authorization": `Bearer ${TOGETHER_API_KEY}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     const aiReply = response.data?.choices?.[0]?.message?.content?.trim();

//     if (!aiReply || aiReply.length < 5) {
//       return "❗ Sorry, the answer was not clear. Please try again.";
//     }

//     return aiReply;

//   } catch (err) {
//     console.error("❌ Error from Together AI:", err?.response?.data || err.message);
//     return "❗ Something went wrong. Please try again later.";
//   }
// }

// // ✅ Utility: Normalize input
// const normalize = str =>
//   str.toLowerCase()
//     .replace(/[^a-z0-9\s]/g, '')
//     .replace(/\s+/g, ' ')
//     .trim();

// // ✅ Ask Question API
// app.all('/api/ask-question', async (req, res) => {
//   const message = req.method === 'POST' ? req.body.message : req.query.message;
//   if (!message) return res.status(400).json({ error: 'Message is required' });

//   const msg = normalize(message);
//   const msgWords = msg.split(' ');

// // Check for short or unclear messages
//   if (msgWords.length < 2) {
//     return res.json({
//       answer: "❗ Your question is too short. Please ask something more specific.",
//       source: "⚠️ Validation"
//     });
//   }

//   try {
//     const botReplies = JSON.parse(fs.readFileSync('botReplies.json', 'utf8'));
//     const faqs = JSON.parse(fs.readFileSync('faqs.json', 'utf8'));
//     const sources = getSources(); // you should define this elsewhere

//     // ✅ 1. Match from PDF/URL sources
//     for (let src of sources) {
//       const rawText = src.text || '';
//       const lines = rawText.split(/[\n.]/).map(line => line.trim()).filter(line => line.length > 20);

//       for (let line of lines) {
//         const normLine = normalize(line);
//         const lineWords = normLine.split(' ');
//         const matchedWords = msgWords.filter(w => lineWords.includes(w));
//         const matchRatio = matchedWords.length / msgWords.length;

//         if (matchRatio >= 0.3 || normLine.includes(msg)) {
//           const shortAnswer = line.length > 180 ? line.slice(0, 180) + "..." : line;
//           console.log("✅ Matched via PDF/URL");
//           return res.json({
//             answer: shortAnswer,
//             source: src.url ? `🔗 URL: ${src.url}` : `📄 PDF: ${src.filename}`
//           });
//         }
//       }
//     }

//     // ✅ 2. Match from FAQs
//     for (let faq of faqs) {
//       const q = normalize(faq.question);
//       if (msg === q || msg.includes(q) || q.includes(msg)) {
//         console.log("✅ Matched via FAQ");
//         return res.json({ answer: faq.answer, source: "📘 FAQ" });
//       }
//     }

//     // ✅ 3. Match from BotReplies
//     for (let entry of botReplies) {
//       if (entry.keywords.some(k => msg.includes(normalize(k)))) {
//         console.log("✅ Matched via BotReplies");
//         return res.json({ answer: entry.response, source: "🤖 Bot" });
//       }
//     }

//     // ✅ 4. Loose match in PDFs
//     for (let src of sources) {
//       const text = (src.text || '').toLowerCase();
//       if (text.includes(msg)) {
//         console.log("✅ Loose match via PDF content");
//         return res.json({
//           answer: "Your question matches content in the uploaded PDF. Please ask more specifically.",
//           source: src.url ? `🔗 URL: ${src.url}` : `📄 PDF: ${src.filename}`
//         });
//       }
//     }

//      const aiAnswer = await askTogetherAI(message);

//     if (!aiAnswer || aiAnswer.length < 10 || aiAnswer.toLowerCase().includes("i'm not sure")) {
//       return res.json({
//         answer:
//           "I'm your virtual assistant, here to help with tech support, general info, health tips, and daily guidance. Please ask something related to those areas.",
//         source: '🧠 TogetherAI (default)'
//       });
//     }

//     return res.json({ answer: aiAnswer.trim(), source: '🧠 TogetherAI' });

//   } catch (e) {
//     console.error('❌ Error in /api/ask-question:', e);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Load widget

// app.get('/api/load-widget', async (req, res) => {
//   const id = req.query.id;
//   const allWidgets = JSON.parse(fs.readFileSync('db.json', 'utf8'));
//   const data = allWidgets.find(w => w.widgetId === id);
//   if (!data || !data.show) return res.end();
//   const [vPos, hPos] = data.position.split('-');
//   const imageUrl = data.imageUrl || 'https://img.freepik.com/free-vector/young-man-with-glasses-illustration_1308-174706.jpg';
//   const chatHeader = data.chatHeader || 'iosandweb';
//   const welcome = data.welcome || '👋 Welcome! How can I assist you today?';
//   const fontFamily = data.fontFamily || 'Arial';
//   const fontSize = data.fontSize || '14px';
//   const fontSizeOverview = data.fontSizeOverview || '20px';
//   const color = data.color || '#007bff';
//   const overviewColor = data.overviewColor || '#4b9df2';


//   res.setHeader('Content-Type', 'application/javascript');
//   res.send`(function () {
//     if (document.getElementById("custom-chat-launcher")) return;
//     const script = document.createElement("script");
//     script.src = "http://localhost:3000/socket.io/socket.io.js";
//     script.onload = () => {
//       const socket = io("http://localhost:3000");

// // 🔄 Live update for widget settings
// socket.on('settings-updated', ({ widgetId: updatedId, updates }) => {
//   if (updatedId !== '${data.widgetId}') return;

//   console.log("⚙️ settings-updated received:", updates);

//   // Show/Hide launcher icon
//   if ('show' in updates) {
//     const launcher = document.getElementById("custom-chat-launcher");
//     if (launcher) launcher.style.display = updates.show ? 'block' : 'none';
//   }

//   // Update color
//   if ('color' in updates) {
//     document.documentElement.style.setProperty('--chat-color', updates.color);
//   }

//   // Update font family
//   if ('fontFamily' in updates) {
//     document.documentElement.style.setProperty('--chat-font-family', updates.fontFamily);
//   }

//   // Update font size
//   if ('fontSize' in updates) {
//     document.documentElement.style.setProperty('--chat-font-size', updates.fontSize);
//   }
//   // Update font size for overview
//   if ('fontSizeOverview' in updates) {
//     document.documentElement.style.setProperty('--chat-font-size-overview', updates.fontSizeOverview);
//   }

//   // Update overview color
//   if ('overviewColor' in updates) {
//     document.documentElement.style.setProperty('--chat-overview-color', updates.overviewColor);
//   }

//   // ✅ Update avatar image (moved here from overview-updated)
//   if ('imageUrl' in updates) {
//     const avatar = document.querySelector('.chat-header img');
//     if (avatar) avatar.src = updates.imageUrl;
//   }
// });


// // 🔄 Live update for overview section (like avatar, header, position)
// socket.on('overview-updated', ({ widgetId: updatedId, updates }) => {
//   if (updatedId !== '${data.widgetId}') return;

//   console.log("📢 overview-updated received:", updates);
//   // Update header text
//   if ('chatHeader' in updates) {
//     const header = document.getElementById("chat-headers");
//     if (header) {
//       const span = header.querySelector("span");
//       if (span) span.textContent = updates.chatHeader;
//     }
//   }

//   // Show/hide avatar image
//   if ('showImage' in updates) {
//     const avatar = document.querySelector('.chat-header img');
//     if (avatar) avatar.style.display = updates.showImage ? 'inline' : 'none';
//   }

//   // ✅ Update position dynamically
//   if ('position' in updates) {
//     const [newVPos, newHPos] = updates.position.split('-');
//     const iconWrapper = document.getElementById("custom-chat-launcher");

//     if (iconWrapper) {
//       // Clear all previous position styles
//       iconWrapper.style.top = "";
//       iconWrapper.style.bottom = "";
//       iconWrapper.style.left = "";
//       iconWrapper.style.right = "";

//       // Set new position
//       iconWrapper.style[newVPos] = "20px";
//       iconWrapper.style[newHPos] = "20px";
//     }

//     // Update CSS variable if used
//     document.documentElement.style.setProperty('--chat-position', updates.position);
//   }
// });
//     function timeAgo(timestamp) {
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - timestamp) / 1000);
//     if (diffInSeconds < 5) return "Just now";
//     if (diffInSeconds < 60) return \`\${diffInSeconds} seconds ago\`;
//     const minutes = Math.floor(diffInSeconds / 60);
//     if (minutes < 60) return \`\${minutes} minutes ago\`;
//     const hours = Math.floor(minutes / 60);
//     return \`\${hours} hours ago\`;
//   }

//       const styleVars = document.createElement('style');
//       styleVars.innerHTML = \`
//         :root {
//           --chat-position: ${data.position};
//           --chat-color: ${color};
//           --chat-font-family: ${fontFamily};
//           --chat-font-size: ${fontSize};
//           --chat-font-size-overview: ${fontSizeOverview};
//           --chat-overview-color: ${overviewColor};
//         }
//         .chat-icon {
//           ${vPos}: 20px;
//           ${hPos}: 39px;
//           margin-left: 20px;
//           background: var(--chat-color);
//           border-radius: 50%;
//           width: 60px;
//           height: 60px;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           cursor: pointer;
//           z-index: 9999;
//           font-family: var(--chat-font-family);
//         }
//     .powered {
//     font-size: 13px;
//     margin-top: 100px;
//     text-align: center;
//     font-size: 13px;
//     color: rgb(3, 3, 3);
//     font-weight: 700;
// }


//    .powered a {
//     text-decoration: none;
//     color: #000;
//      }

//      .powereds{
//      font-size: 13px;
//     text-align: center;
//     font-size: 13px;
//     color: #007bff;
//     margin-left: 8px;
//     font-weight: 700;
//      }
//        .powereds a {
//         text-decoration: none;
//        color: #007bff;
//      }
//       \`;
//       document.head.appendChild(styleVars);
//       let botReplies = [];
//     let userId = localStorage.getItem("custom_user_id");
//     let hasNotified = false;
//       let faqs = [];
//       let sources = [];
//       let askpdfqustions = [];
//       function askQuestion(message) {
//       console.log(message);
//         return fetch(\`http://localhost:3000/api/ask-question?message=\${encodeURIComponent(message)}\`)
//           .then(res => res.json())
//           .catch(err => {
//             console.error("❌ Error in askQuestion:", err);
//             return { answer: "Sorry, no response", source: "Error" };
//           });
//       }
//       // Load all required data including FAQ sources
//  // Load static data (bot replies, faqs, sources)
// Promise.all([
//   fetch('http://localhost:3000/api/bot-replies').then(res => res.json()),
//   fetch('http://localhost:3000/api/faqs').then(res => res.json()),
//   fetch('http://localhost:3000/api/faq-sources').then(res => res.json())
// ])
// .then(([botData, faqData, sourceData]) => {
//   botReplies = botData;
//   faqs = faqData;
//   sources = sourceData;
//   console.log("✅ Static data loaded");
// })
// .catch(err => {
//   console.error("❌ Failed to load static data:", err);
//   botReplies = [{ keywords: ['default'], response: "Sorry, I couldn't load replies." }];
// });

// // Normalize for matching
// function normalize(str) {
//   return str.toLowerCase().replace(/[^\w\s]/g, '').trim();
// }

// // Try to match from faqs, sources, or bot replies (fallback if needed)
// function getBotResponse(message, fallbackAnswer = '') {
//   const msg = normalize(message);

//   for (let faq of faqs) {
//     const q = normalize(faq.question);
//     if (msg === q || msg.includes(q) || q.includes(msg)) {
//       return faq.answer;
//     }
//   }

//   for (let src of sources) {
//     const text = normalize(src.text || '');
//     if (text.includes(msg)) {
//       return src.answer;
//     }
//   }

//   for (let entry of botReplies) {
//     if (entry.keywords.some(k => msg.includes(normalize(k)))) {
//       return entry.response;
//     }
//   }

//   return fallbackAnswer || "I'm not sure how to respond.";
// }
//   const style = document.createElement("link");
//   style.rel = "stylesheet";
//   style.href = "http://localhost:3000/chat-widget.css";
//   document.head.appendChild(style);
//   const iconWrapper = document.createElement("div");
//   iconWrapper.id = "custom-chat-launcher";
//   iconWrapper.style.position = "fixed";
//   iconWrapper.style.${vPos} = "20px";
//   iconWrapper.style.${hPos} = "20px";
//   iconWrapper.style.zIndex = "9999";
//   const tooltip = document.createElement("div");
//   tooltip.className = "chat-tooltip";
//   tooltip.innerText = "Chat with us!";
//   const icon = document.createElement("div");
//   icon.className = "chat-icon";
// icon.innerHTML = '<img src="https://cdn-icons-png.flaticon.com/512/2462/2462719.png" width="40" height="30" style="display:block;" />';
//   const chatBox = document.createElement("div");
//    chatBox.className = "chat-box";
//   chatBox.style.display = "none";
//   chatBox.innerHTML = \`
// <div class='chat-header' id="chat-headers">
// <div style="display:none;">
//           <img src="https://cdn-icons-png.freepik.com/512/10486/10486534.png" style="height:30px; width:30px; cursor:pointer;" />
//         </div>
// <div id="icon-close-chat">
//           <img src="https://cdn-icons-png.freepik.com/512/10486/10486534.png" style="height:30px; width:30px; cursor:pointer;" />
//         </div>
//   &nbsp;
//  <img src='${imageUrl}' style="height:30px;width:30px;border-radius:50%;margin-right:8px;" />
//   ${chatHeader}
//   <button id="close-btn" style="margin-left:auto;background:transparent;border:none;font-size:18px;cursor:pointer;color:white">✕</button>
// </div>

// <div id="hrFormWrapper" style="dispaly:block;">
// <div class="chat-card">
// <img src="https://iosandweb.net/assests/images/IAW-logo-white.png" alt="Logo" style="height:50px;width:150px;margin-top:15px">
//   <div id="close-humanfrom">✕</div>
//   <div style="height:10px"></div>
//   <h2>Hi there <img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/12.1.1/72x72/1f44b.png"alt="Logo"style="height:30px;width:30px;>
  
//    Welcome to our website. Ask us anything 🎉
//   </h2>

//   <form id="hr-form">
//   <button type="button" id="start-chat-now-inside">
//   <div class="chat-text">
//     <strong>Chat with us</strong>
//     <div class="chat-note">We typically reply within a few minutes.</div>
//   </div>
//   <span class="chat-arrow">➤</span>
// </button>
//   </form>
// </div>
//   <p class="powered">
//   © Powered By -
//   <a href="https://iosandweb.net/" target="_blank" rel="noopener noreferrer">
//     IosAndWeb Technologies - AI.Dev ©
//   </a>
// </p>

// </div>
// <div class='chat-messages' id='chat-msgs' style="display:none;"></div>
// <div class='chat-input' style="display:none;">
//   <input type='text' id='chat-input' placeholder='Type a message...' onkeydown="if(event.key==='Enter') sendChatMsg()" />
//   <button onclick='sendChatMsg()'>Send</button>
// </div>
// <div class="row mb-3" id="chat-controls" style="display: block;">
//   <div class="col-8 justify-content-center" style="text-align: center;">
//    <u style="color: blue; cursor: pointer;" id="contact-human">Contact Human</u>&nbsp; 
//   <u style="color: red; cursor: pointer;" id="end-chat">End Chat</u>

// <p class="powereds">
//   © Powered By -
//   <a href="https://iosandweb.net/" target="_blank" rel="noopener noreferrer">
//     IosAndWeb Technologies - AI.Dev ©
//   </a>
// </p>
//   </div>
//    <br/>

// </div>

// <!-- Confirmation Popup -->
// <div id="chat-confirmation" style="display:none;position:absolute;top:30%;left:4%;width:82%;background:white;border-radius:10px;padding:20px;box-shadow:0 0 10px rgba(0,0,0,0.3);z-index:999;text-align:center">
//   <p>Are you sure you want to end the chat?</p>
//   <button id="confirm-end-chat" style="margin-right:10px;background:red;color:white;padding:10px 15px;border:none;">End</button>
//   <button id="cancel-end-chat" style="background:gray;color:white;padding:10px 18px;border:none;">Continue</button>
// </div>
// <!-- Feedback Form -->
// <div id="chat-feedback" style="display:none;padding:20px;">
//   <form id="feedback-form">
//   <center>

//        <div id="icon-close-feedback">
//           <img src="https://cdn-icons-png.freepik.com/512/10486/10486534.png" style="height:30px; width:30px; margin-right:300px; cursor:pointer;" />
//         </div>
//   <label>Rating this chat</label>  <br/>
// <div class="star-rating" id="starratings">
//   <input type="radio" id="star5" name="rating" value="5" /><label for="star5">★</label>
//   <input type="radio" id="star4" name="rating" value="4" /><label for="star4">★</label>
//   <input type="radio" id="star3" name="rating" value="3" /><label for="star3">★</label>
//   <input type="radio" id="star2" name="rating" value="2" /><label for="star2">★</label>
//   <input type="radio" id="star1" name="rating" value="1" /><label for="star1">★</label>
// </div></center>
//        <label>Your Name<span style="color:red">*</span></label>
//     <input type="name" name="name" id="feedbackename" required style="width:96%;padding:8px;margin-bottom:5px;height:26px; border-radius:6px;border:1px solid #ccc;" />
//           <label>Your Email<span style="color:red">*</span></label>
//     <input type="email" name="email" id="feedbackemail" required style="width:96%;padding:8px;margin-bottom:5px;height:26px;border-radius:6px;border: 1px solid #ccc;" />
//     <br/>   
//     <label>Your feedback:</label>
//     <textarea name="feedback" required style="width:100%;height:70px;margin-bottom:8px;border-radius:6px;border:1px solid #ccc;"></textarea>
//     <button type="submit" style="background:#007bff;color:white;padding:10px;border:none;width:100%;">Submit Feedback</button>
//   </form>
// <br>
//     \`;
// // === Clear user ID and welcome flag on page reload ===
// // === Clear user ID, welcome flag, and chat state on page reload ===
// window.addEventListener("load", () => {
//   localStorage.removeItem("custom_user_id");
//   localStorage.removeItem("welcomeShown");
//   localStorage.removeItem("chatBoxOpen");
// });

//   setTimeout(() => {
//     const input = document.getElementById("chat-input");
//     const chatBox = document.querySelector(".chat-box");

//     if (!input || !chatBox) {
//       console.warn("⚠️ Required elements missing.");
//       return;
//     }
//     // Create and append modal
//     const modal = document.createElement("div");
//     modal.id = "inactivity-modal";
//     modal.style.cssText = \`
//       position: absolute;
//       top: 50%;
//       left: 49%;
//       width: 78%;
//       background: white;
//       border-radius: 10px;
//       padding: 10px;
//       box-shadow: 0 0 10px rgba(0,0,0,0.3);
//       z-index: 10000;
//       text-align: center;
//       display: none;
//     \`;

//     modal.innerHTML = \`
//       <p>⏰ Are you still Connected</p>
//       <button id="inactivity-yes" style="margin-right: 10px; padding: 10px 15px; background:rgb(228, 6, 6); color: white; border: none;">Yes</button>
//       <button id="inactivity-no" style="padding: 10px 15px; background: rgb(5, 193, 250); color: white; border: none;">No</button>
//    \`;

//     chatBox.appendChild(modal);

//     const yesBtn = modal.querySelector("#inactivity-yes");
//     const noBtn = modal.querySelector("#inactivity-no");

//     let inactivityTimer;

//     function resetTypingTimer() {
//       clearTimeout(inactivityTimer);

//       inactivityTimer = setTimeout(() => {
//         const isChatOpen = chatBox.style.display !== "none";
//         const isInputEmpty = input.value.trim() === "";
//         const isModalHidden = modal.style.display === "none" || modal.style.display === "";

//         if (isChatOpen && isInputEmpty && isModalHidden) {
//           modal.style.display = "block";
//           chatBox.classList.add("dimmed");
//           console.log("⏰ Inactivity detected, showing modal.");
//         }
//       }, 500000); // 30 seconds
//     }

//     input.addEventListener("input", resetTypingTimer);
//     yesBtn.addEventListener("click", () => {
//       modal.style.display = "none";
//       chatBox.classList.remove("dimmed");
//       resetTypingTimer();
//     });
//  noBtn.addEventListener("click", (e) => {
//   modal.style.display = "none";
//   chatBox.style.display = "none";
//   const chatMsgs = document.getElementById("chat-msgs");
//   if (chatMsgs) chatMsgs.innerHTML = "";
//   // ✅ Correct usage of event object
//   e.target.reset?.(); // Only call if it's a form
//   // ✅ Reset user state
//   localStorage.removeItem("custom_user_id");
//   window.chatEnded = true;
// });
//     resetTypingTimer();
//   }, 1000);




// // Function to end the chat (clears UI)
// function endChat() {
//   const chatMsgs = document.getElementById("chat-msgs");
//   const input = document.getElementById("chat-input");
//   if (chatMsgs) chatMsgs.innerHTML = "";
//   if (input) input.value = "";
//   chatBox.style.display = "none";
// }

// setTimeout(() => {
//   const closeBtn = document.getElementById("close-btn");
//   const endChatBtn = document.getElementById("end-chat");
//   const contactHumanBtn = document.getElementById("contact-human");

//   if (closeBtn) {
//     closeBtn.addEventListener("click", () => {
//       document.getElementById("chat-confirmation").style.display = "block";
//     });
//   }

//   // Confirmation modal buttons
//   document.getElementById("confirm-end-chat").addEventListener("click", () => {
//     document.getElementById("chat-confirmation").style.display = "none";
//     document.getElementById("hrFormWrapper").style.display = "none";
//     document.getElementById("chat-msgs").style.display = "none";
//     document.querySelector(".chat-input").style.display = "none";
//     document.getElementById("chat-controls").style.display = "none";
//     document.getElementById("chat-headers").style.display = "none";
//     document.getElementById("chat-feedback").style.display = "block";
//     document.getElementById("inactivity-modal").style.display = "none";
    
//   });
//   document.getElementById("cancel-end-chat").addEventListener("click", () => {
//     document.getElementById("chat-confirmation").style.display = "none";
//   });
//   document.getElementById("close-humanfrom").addEventListener("click", () => {
//       chatBox.style.display = "none";
//   });



// // When submitting feedback form
// document.addEventListener("submit", async function (e) {
//   if (e.target && e.target.id === "feedback-form") {
//     e.preventDefault();
//     const feedback = e.target.feedback.value.trim();
//     const userId = localStorage.getItem("custom_user_id");
//     const name = document.getElementById("feedbackename").value;
//     const email = document.getElementById("feedbackemail").value;
//     const rating = document.querySelector('input[name="rating"]:checked')?.value;
//   if (!feedback || !email || !rating) {
//     return alert("Please fill in all the required fields.");
//   }
//     try {
//       await fetch("http://localhost:3000/api/chat-feedback", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, name, feedback, rating, email }),
//       });
//       if (userId) socket.emit("disconnect-user", userId);
//       document.getElementById("chat-msgs").innerHTML = "";
//       e.target.reset();
//       localStorage.removeItem("custom_user_id");
//       localStorage.removeItem("welcomeShown");
//       document.querySelector(".chat-box").style.display = "none";
//       alert("✅ Thank you! Your feedback successfully.");
//     } catch (err) {
//       console.error("❌ Error submitting feedback:", err);
//     }
//   }
// },1000);

//   if (endChatBtn) {
//     endChatBtn.addEventListener("click", async () => {
//       endChat();
//       const userId = localStorage.getItem("custom_user_id");
//       const chatMsgs = Array.from(document.querySelectorAll("#chat-msgs .message")).map(msgEl => {
//         let sender = "user";
//         if (msgEl.classList.contains("bot")) sender = "bot";
//         else if (msgEl.classList.contains("admin")) sender = "admin";
//         return {
//           timestamp: new Date().toISOString(),
//           sender,
//           message: msgEl.innerText.trim()
//         };
//       });
//       try {
//         await fetch("http://localhost:3000/api/chat-ended", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userId, messages: chatMsgs }),
//         });
//            e.target.reset();
//           localStorage.removeItem("custom_user_id");
//          localStorage.removeItem("welcomeShown");
//         console.log("✅ End chat email sent");
//       } catch (error) {
//         console.error("❌ Error sending chat history:", error);
//       }
//     });
//   }  
// const chatMsgs = document.getElementById("chat-msgs");
// if (contactHumanBtn) {
//   contactHumanBtn.addEventListener("click", async () => {
//     const userId = localStorage.getItem("custom_user_id");
//     // Show typing animation
//     const typingDiv = document.createElement("div");
//     typingDiv.className = "chat-msg bot-msg typing";
//     typingDiv.innerHTML = \`
//       <div class="typing-dots">
//         <span></span><span></span><span></span>
//       </div>
//     \`;
//     chatMsgs.appendChild(typingDiv);
//     chatMsgs.scrollTop = chatMsgs.scrollHeight;

//     try {
//       const res = await fetch("http://localhost:3000/api/request-human", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId })
//       });

//       const result = await res.json();
//       typingDiv.classList.remove("typing");
//       typingDiv.innerHTML = result.message || "✅ A human assistant has been notified.";
//       chatMsgs.scrollTop = chatMsgs.scrollHeight;
//     } catch (error) {
//       console.error("❌ Failed to request human:", error);
//       typingDiv.classList.remove("typing");
//       typingDiv.innerHTML = "⚠️ Failed to request human. Please try again.";
//       chatMsgs.scrollTop = chatMsgs.scrollHeight;
//     }
//   });
// }

// }, 1000);



// // === Close feedback box ===
// setTimeout(() => {
//   const iconCloseChat = document.getElementById("icon-close-feedback");
//   const chatBox = document.querySelector(".chat-box");

//   if (iconCloseChat && chatBox) {
//     iconCloseChat.onclick = function () {
//       chatBox.style.display = "none";
//       localStorage.setItem("chatBoxOpen", "false");
//     };
//   }
// }, 200);





// // === Close Chat Button ===
// setTimeout(() => {
//   const iconCloseChat = document.getElementById("icon-close-chat");
//   const chatBox = document.querySelector(".chat-box");

//   if (iconCloseChat && chatBox) {
//     iconCloseChat.onclick = function () {
//       chatBox.style.display = "none";
//       localStorage.setItem("chatBoxOpen", "false");
//     };
//   }
// }, 1000);

// // === Restore chat state on load ===
// setTimeout(() => {
//   const chatBox = document.querySelector(".chat-box");
//   if (localStorage.getItem("chatBoxOpen") === "true" && chatBox) {
//     chatBox.style.display = "flex";
//     showChatInterface();
//   }
// }, 100);

// // === Restore on browser navigation ===
// window.addEventListener("popstate", () => {
//   const chatBox = document.querySelector(".chat-box");
//   const uid = localStorage.getItem("custom_user_id");
//   if (uid && chatBox) {
//     chatBox.style.display = "flex";
//     showChatInterface();
//   }
// });

// // === Chat Toggle Icon Handler ===
// icon.onclick = function () {
//   const chatBox = document.querySelector(".chat-box");
//   const isHidden = chatBox.style.display === 'none' || chatBox.style.display === '';
//   localStorage.setItem("chatBoxOpen", isHidden ? "true" : "false");
//   chatBox.style.display = isHidden ? 'flex' : 'none';

//   const hrForm = document.getElementById("hrFormWrapper");
//   const chatMsgs = document.getElementById("chat-msgs");
//   const chatInput = document.querySelector(".chat-input");
//   const chatControls = document.getElementById("chat-controls");
//   const chatHeader = document.getElementById("chat-headers");
//   const chatFeedback = document.getElementById("chat-feedback");
//   const inactivitymodal = document.getElementById("inactivity-modal");

//   if (isHidden) {
//     const hrFormSubmitted = localStorage.getItem("hrFormSubmitted") === "true";

//     if (hrFormSubmitted) {
//       showChatInterface();
//     } else {
//       if (hrForm) hrForm.style.display = 'block';
//       if (chatMsgs) chatMsgs.style.display = 'none';
//       if (chatInput) chatInput.style.display = 'none';
//       if (chatControls) chatControls.style.display = 'none';
//       if (chatHeader) chatHeader.style.display = 'none';
//       if (chatFeedback) chatFeedback.style.display = 'none';
//       if (inactivitymodal) inactivitymodal.style.display = 'none';
//     }

//     if (typeof socket !== "undefined") {
//       if (socket.connected) {
//         socket.emit("register", userId, true);
//       } else {
//         socket.on("connect", () => {
//           socket.emit("register", userId, true);
//         });
//       }
//     }
//   } else {
//     // 🔄 When reopening chat, restore chat interface
//     showChatInterface();
//   }
// };


// // === HR Form Submit Handler ===
// setTimeout(() => {
//   document.addEventListener("submit", async function (e) {
//     if (e.target && e.target.id === "hr-form") {
//       e.preventDefault();
//       const name = e.target.name.value.trim();
//       const email = e.target.email.value.trim();
//       const hrfillfrom = email;

//       if (!name || !email) return;

//       try {
//         const response = await fetch("http://localhost:3000/api/hr-form", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ name, email, hrfillfrom }),
//         });

//         const result = await response.json();
//         if (result.success) {
//           localStorage.setItem("hrFormSubmitted", "true");
//           showChatInterface();
//         }
//       } catch (err) {
//         console.error("⚠️ Error sending form:", err);
//       }
//     }
//   });
// }, 500);

// // === Show Chat on Start Button Click ===
// setTimeout(() => {
//   const chatStartBtn = document.getElementById("start-chat-now-inside");
//   const chatBox = document.querySelector(".chat-box");

//   if (chatStartBtn && chatBox) {
//     chatStartBtn.addEventListener("click", () => {
//       chatBox.style.display = "flex";
//       showChatInterface();
//     });
//   }
// }, 500);

// // === Show Chat Interface ===
// function showChatInterface() {
//   const hrForm = document.getElementById("hrFormWrapper") || document.getElementById("hr-form");
//   const chatMsgs = document.getElementById("chat-msgs");
//   const chatInput = document.querySelector(".chat-input");
//   const chatControls = document.getElementById("chat-controls");
//   const chatHeader = document.getElementById("chat-headers");
//   const chatFeedback = document.getElementById("chat-feedback");
//   const headersfrom = document.getElementById("headers-from");
//   if (hrForm) hrForm.style.display = "none";
//   if (chatMsgs) chatMsgs.style.display = "block";
//   if (chatInput) chatInput.style.display = "flex";
//   if (chatControls) chatControls.style.display = "flex";
//   if (chatHeader) chatHeader.style.display = "flex";
//   if (chatFeedback) chatFeedback.style.display = "none";
//   if (headersfrom) headersfrom.style.display = "none";

//   userId = localStorage.getItem("custom_user_id") || crypto.randomUUID();
//   localStorage.setItem("custom_user_id", userId);
//   if (typeof socket !== "undefined") {
//     if (socket.connected) {
//       socket.emit("register", userId, true);
//     } else {
//       socket.on("connect", () => {
//         socket.emit("register", userId, true);
//       });
//     }
//   }

//   // Show welcome message only once per session
//   if (!localStorage.getItem("welcomeShown")) {
//     const timestamp = new Date();
//     const welcomeMsg = document.createElement("div");
//     welcomeMsg.className = "chat-msg bot-msg";
//     welcomeMsg.innerHTML = \`
//       <div>${welcome}</div>
//       <div class="time-ago"></div>
//     \`;
//     chatMsgs.appendChild(welcomeMsg);
//     welcomeMsg.querySelector(".time-ago").innerText = timeAgo(timestamp);
//     setInterval(() => {
//       welcomeMsg.querySelector(".time-ago").innerText = timeAgo(timestamp);
//     }, 10000);

//     localStorage.setItem("welcomeShown", "true");
//   }
// }

// // === Send Chat Message ===
// function sendChatMsg() {
//   const input = document.getElementById("chat-input");
//   const msg = input.value.trim();
//   if (!msg) return;

//   const chatMsgs = document.getElementById("chat-msgs");
//   const userTimestamp = new Date();

//   const userDiv = document.createElement("div");
//   userDiv.className = "chat-msg user-msg";
//   userDiv.innerHTML = msg;
//   chatMsgs.appendChild(userDiv);
//   chatMsgs.scrollTop = chatMsgs.scrollHeight;
//   input.value = "";

//   fetch('http://localhost:3000/api/save-message', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ userId, sender: "user", message: msg, timestamp: userTimestamp })
//   }).catch(err => console.error("❌ Failed to save user message:", err));

//   const typingDiv = document.createElement("div");
//   typingDiv.className = "chat-msg bot-msg typing";
//   typingDiv.innerHTML = \`
//     <div class="typing-dots">
//       <span></span><span></span><span></span>
//     </div>
//   \`;
//   chatMsgs.appendChild(typingDiv);
//   chatMsgs.scrollTop = chatMsgs.scrollHeight;

//   askQuestion(msg)
//     .then(response => {
//       const reply = response.answer || getBotResponse(msg);
//       const botTimestamp = new Date();

//       typingDiv.innerHTML = reply;
//       typingDiv.classList.remove("typing");
//       chatMsgs.scrollTop = chatMsgs.scrollHeight;
//       return fetch('http://localhost:3000/api/save-message', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId, sender: "bot", message: reply, timestamp: botTimestamp })
//       });
//     })
//     .catch(err => {
//       console.error("❌ Failed to get bot response:", err);
//       typingDiv.innerHTML = "⚠️ Sorry, something went wrong.";
//     });
// }


// // === Admin Typing Simulation ===
// socket.on('admin-message', (data) => {
//   const chatMsgs = document.getElementById("chat-msgs");
//   if (!chatMsgs) return;
//   const typingDiv = document.createElement("div");
//   typingDiv.className = "chat-msg admin-msg typing";
//   typingDiv.innerHTML = "<span class='typing-dots'>...</span>";
//   chatMsgs.appendChild(typingDiv);
//   chatMsgs.scrollTop = chatMsgs.scrollHeight;

//   setTimeout(() => {
//     typingDiv.innerHTML = data.message;
//     typingDiv.classList.remove("typing");
//     chatMsgs.scrollTop = chatMsgs.scrollHeight;
//   }, 2000);
// });

// // === Admin message with typing simulation ===
// socket.on('admin-message', (data) => {
//   console.log("✅ Received admin message:", data);
//   const chatMsgs = document.getElementById("chat-msgs");
//   if (!chatMsgs) {
//     console.error("❌ chat-msgs element not found!");
//     return;
//   }
//   // Show typing dots first
//   const typingDiv = document.createElement("div");
//   typingDiv.className = "chat-msg admin-msg typing";
//   typingDiv.innerHTML = "<span class='typing-dots'>...</span>";
//   chatMsgs.appendChild(typingDiv);
//   chatMsgs.scrollTop = chatMsgs.scrollHeight;

//   // Simulate delay then replace with message
//   setTimeout(() => {
//     typingDiv.innerHTML = data.message;
//     typingDiv.classList.remove("typing");
//     chatMsgs.scrollTop = chatMsgs.scrollHeight;
//   }, 2000); // delay can be adjusted
// });
//   window.sendChatMsg = sendChatMsg;
//   window.endChat = endChat; // Register globally if needed
//   iconWrapper.appendChild(tooltip);
//   iconWrapper.appendChild(icon);
//   document.body.appendChild(iconWrapper);
//   document.body.appendChild(chatBox);
// // Dragging functionality
// const chatHeaderEl = chatBox.querySelector('.chat-header');
// let isDragging = false,
//     offsetX = 0,
//     offsetY = 0;
// chatHeaderEl.addEventListener('mousedown', function (e) {
//   isDragging = true;
//   const rect = chatBox.getBoundingClientRect();
//   offsetX = e.clientX - rect.left;
//   offsetY = e.clientY - rect.top;
//   document.addEventListener('mousemove', dragChatBox);
//   document.addEventListener('mouseup', stopDragging);
// });
// function dragChatBox(e) {
//   if (!isDragging) return;
//   const boxWidth = chatBox.offsetWidth;
//   const boxHeight = chatBox.offsetHeight;
//   let newLeft = e.clientX - offsetX;
//   let newTop = e.clientY - offsetY;
//   // Clamp values to keep box within screen
//   newLeft = Math.max(0, Math.min(window.innerWidth - boxWidth, newLeft));
//   newTop = Math.max(0, Math.min(window.innerHeight - boxHeight, newTop));
//   chatBox.style.position = "fixed";
//   chatBox.style.left = newLeft + "px";
//   chatBox.style.top = newTop + "px";
//   chatBox.style.right = "auto";
//   chatBox.style.bottom = "auto";
// }
// function stopDragging() {
//   isDragging = false;
//   document.removeEventListener('mousemove', dragChatBox);
//   document.removeEventListener('mouseup', stopDragging);
// }
//     };
// document.head.appendChild(script); // ← append FIRST, then onload runs when ready
//     })();`;
// });




// app.post('/api/chat-feedback', async (req, res) => {
//   const { userId, name, feedback, rating, email } = req.body;

//   if (!userId || !name || !feedback || !email || !rating) {
//     return res.status(400).json({ success: false, message: "Missing userId, name, feedback or email" });
//   }
// console.log(email);
//   const feedbackData = {
//     userId,
//     name,
//     email,
//     feedback,
//     rating,
//     timestamp: new Date().toISOString()
//   };

//   const filePath = path.join(__dirname, 'chat-feedback.json');

//   try {
//     // Load existing feedback data from file if exists
//     let existingData = [];
//     if (fs.existsSync(filePath)) {
//       const fileContent = fs.readFileSync(filePath, 'utf-8');
//       existingData = JSON.parse(fileContent || '[]');
//     }
//        // Add new feedback
//     existingData.push(feedbackData);

//     // Save updated feedback to file
//     fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

//     // Send confirmation email
//     const mailOptions = {
//       from: process.env.SMTP_USER,   // Sender (admin)
//       to: email,  
//                        // User's email
//       subject: 'Feedback Received - Chat Application',
//       html: `
//         <p>Thank you, <strong>${name}</strong>, for your feedback!</p>
//         <p>Your feedback has been recorded successfully.</p>
//         <p><a href="http://localhost:3000/admin.html">Visit Admin Panel</a></p>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("✅ Feedback saved and email sent:", name, email);

//     res.json({ success: true, message: 'Feedback saved and email sent' });

//   } catch (error) {
//     console.error("❌ Error in feedback processing:", error);
//     res.status(500).json({ success: false, message: "Server error while saving feedback" });
//   }
// });




// app.post('/api/hr-form', async (req, res) => {
//   const { name, email ,hrfillfrom} = req.body;

//   if (!name || !email) {
//     return res.status(400).json({ success: false, message: 'Missing fields' });
//   }

//   console.log("Form received:", name, email,hrfillfrom);
//   const mailOptions = {
//     from: process.env.SMTP_USER,     // Admin email (sender)
//     to: email,                       // User's submitted email
//     subject: `New Human Assistance Request from `,
//     text: `User has requested human assistance.\n\nAccess the admin dashboard: http://localhost:3000/admin.html`,
//     html: `<p>User has requested human assistance.</p><p><a href="http://localhost:3000/admin.html">Access the admin dashboard</a></p>`,
//   };
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent to user:", email);
//     res.status(200).json({ success: true, message: 'Form received and email sent to user' });
//   } catch (error) {
//     console.error("❌ Email error:", error);
//     res.status(500).json({ success: false, message: 'Failed to send email' });
//   }
// });







// async function loadConfig() {
//   try {
//     const data = await fsp.readFile(CONFIG_FILE, 'utf8');

//     if (!data.trim()) {
//       console.log('config.json is empty, initializing with {}');
//       await fsp.writeFile(CONFIG_FILE, '{}');
//       return {};
//     }
//     const config = JSON.parse(data);
//     console.log('✅ Loaded config');
//     return config;
//   } catch (error) {
//     if (error.code === 'ENOENT' || error.message.includes('Unexpected end of JSON input')) {
//       console.log('No valid config file found, creating new one');
//       await fsp.writeFile(CONFIG_FILE, '{}');
//       return {};
//     }

//     console.error('❌ Error loading config:', error.message);
//     return {};
//   }
// }

// async function sendEmailNotification(type, data) {
//   const config = await loadConfig();

//   const adminEmail = config.adminEmail || process.env.ADMIN_EMAIL;
//   const port = process.env.PORT || 3000;
//   let mailOptions;
//   switch (type) {
//     case 'human_request':
//       mailOptions = {
//         from: process.env.SMTP_USER,
//         to: adminEmail,
//         subject: `New Human Assistance Request from ${data.userId}`,
//         text: `User ${data.userId} has requested human assistance.\n\nAccess the admin dashboard: http://localhost:3000/admin.html`,
//         html: `<p>User <strong>${data.userId}</strong> has requested human assistance.</p><p><a href="http://localhost:3000/admin.html">Access the admin dashboard</a></p>`,
//       };
//       break;
//     case 'new_message':
//       mailOptions = {
//         from: process.env.SMTP_USER,
//         to: adminEmail,
//         subject: `New User Joined Chat: ${data.userId}`,
//         text: `A new user (${data.userId}) has joined the chat.\n\nAccess the admin dashboard:  http://localhost:${port}`,
//         html: `<p>A new user <strong>${data.userId}</strong> has joined the chat.</p><p><a href=" http://localhost:${port}">Access the admin dashboard</a></p>`,
//       };
//       break;
//     case 'chat_ended':
//       const formattedHistory = data.messages.map(msg => `[${msg.timestamp}] ${msg.sender}: ${msg.message}`).join('\n');
//       mailOptions = {
//         from: process.env.SMTP_USER,
//         to: adminEmail,
//         subject: `Chat History for User ${data.userId}`,
//         text: `Chat session ended for user ${data.userId}.\n\nChat History:\n${formattedHistory}\n\nAccess the admin dashboard:  http://localhost:${port}`,
//         html: `<p>Chat session ended for user <strong>${data.userId}</strong>.</p><h3>Chat History</h3><pre>${formattedHistory}</pre><p><a href=" http://localhost:${port}">Access the admin dashboard</a></p>`,
//       };
//       console.log(`Chat ended for ${data.userId}, sending history:`, formattedHistory);
//       break;
//     default:
//       console.error('Invalid email type:', type);
//       return;
//   }

//   try {
//     console.log(`Sending ${type} email for user ${data.userId} to ${adminEmail}`);
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${adminEmail} for ${type} (userId: ${data.userId})`);
//   } catch (error) {
//     console.error(`Error sending email for ${type}:`, error.message);
//   }
// }


// app.post('/api/notify-message', async (req, res) => {
//   const { userId, message, timestamp } = req.body;
//   try {
//     await sendEmailNotification('new_message', { userId, message, timestamp });
//     res.status(200).json({ message: 'Notification email sent' });
//   } catch (err) {
//     console.error('Email error:', err);
//     res.status(500).json({ error: 'Failed to send email' });
//   }
// });

// app.post('/api/chat-ended', async (req, res) => {
//   const { userId, messages } = req.body;

//   if (!userId || !messages || !Array.isArray(messages)) {
//     return res.status(400).json({ error: "Invalid request data" });
//   }

//   try {
//     await sendEmailNotification('chat_ended', { userId, messages });
//     res.status(200).json({ message: "Chat end email sent successfully" });
//   } catch (err) {
//     console.error("Failed to send chat end email:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });





// app.post('/api/request-human', async (req, res) => {
//   const { userId } = req.body;

//   if (!userId) {
//     return res.status(400).json({ error: 'Missing userId' });
//   }
//   try {
//     await sendEmailNotification('human_request', { userId });
//     res.status(200).json({ message: 'Human request email sent' });
//   } catch (error) {
//     console.error("Error sending human request email:", error);
//     res.status(500).json({ error: 'Failed to send email' });
//   }
// });






// app.get('/api/chat-history/:userId', (req, res) => {
//   const chatData = readChatFile(); // Function that reads chat.json
//   const messages = chatData[req.params.userId] || [];
//   res.json(messages);
// });


// app.post('/api/save-message', (req, res) => {
//   const { userId, sender, message, timestamp } = req.body;
//   if (!userId || !sender || !message || !timestamp) {
//     return res.status(400).json({ error: 'Missing fields' });
//   }

//   const chatPath = path.join(__dirname, 'chat.json');
//   let chatData = {};

//   if (fs.existsSync(chatPath)) {
//     chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
//   }

//   if (!chatData[userId]) chatData[userId] = [];

//   chatData[userId].push({ sender, message, timestamp });

//   fs.writeFileSync(chatPath, JSON.stringify(chatData, null, 2));
//   res.json({ success: true });
// });



// // API to return all user IDs
// app.get('/api/get-all-user-ids', (req, res) => {
//   const chatPath = path.join(__dirname, 'chat.json');
//   if (!fs.existsSync(chatPath)) return res.json([]);

//   const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));

//   const sortedUserIds = Object.entries(chatData)
//     .map(([userId, messages]) => {
//       const latestTimestamp = messages.length
//         ? new Date(messages[messages.length - 1].timestamp)
//         : new Date(0); // default if no messages
//       return { userId, latestTimestamp };
//     })
//     .sort((a, b) => b.latestTimestamp - a.latestTimestamp)
//     .map(entry => entry.userId);

//   res.json(sortedUserIds);
// });

// app.get('/api/get-messages', (req, res) => {
//   const { userId } = req.query;
//   if (!userId) {
//     return res.status(400).json({ error: 'Missing userId' });
//   }
//   const chatPath = path.join(__dirname, 'chat.json');

//   if (!fs.existsSync(chatPath)) {
//     return res.json({ messages: [] });
//   }
//   const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
//   const userMessages = chatData[userId] || [];

//   res.json({ messages: userMessages });
// });


// // ✅ AI POST Endpoint (kept outside the above route!)
// // Load FAQs from JSON
// async function loadFAQs() {
//   try {
//     const data = await fs.readFile(FAQ_FILE, 'utf8');
//     return data.trim() ? JSON.parse(data) : [];
//   } catch (err) {
//     if (err.code === 'ENOENT') {
//       await fs.writeFile(FAQ_FILE, '[]');
//       return [];
//     }
//     console.error('Error reading FAQ file:', err.message);
//     return [];
//   }
// }

// // ✅ AI POST Endpoint (kept outside the above route!)
// app.post("/api/ai-reply", async (req, res) => {
//   const { message } = req.body;

//   if (!message) {
//     return res.status(400).json({ success: false, message: "Message is required" });
//   }
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent([message]);
//     const reply = result.response.text();

//     res.json({ success: true, reply });
//   } catch (err) {
//     console.error("Gemini AI error:", err.message);

//     // Rate limit handling
//     if (err.message.includes("429")) {
//       return res.status(429).json({
//         success: false,
//         message: "Too many requests. Please try again in a few moments.",
//       });
//     }

//     res.status(500).json({ success: false, message: "Gemini AI failed" });
//   }
// });


// //-------------------------------- FQ QUSTIONS ANSWERS ------------------------
// // Save FAQs
// async function saveFAQs(data) {
//   try {
//     await fsp.writeFile(FAQ_FILE, JSON.stringify(data, null, 2));
//     console.log('FAQs saved.');
//   } catch (err) {
//     console.error('Error saving FAQs:', err.message);
//   }
// }

// // Load FAQs
// async function loadFAQs() {
//   try {
//     const data = await fsp.readFile(FAQ_FILE, 'utf8');
//     return JSON.parse(data || '[]');
//   } catch (err) {
//     if (err.code === 'ENOENT') {
//       await fsp.writeFile(FAQ_FILE, '[]');
//       return [];
//     }
//     console.error('Error reading FAQ file:', err.message);
//     return [];
//   }
// }

// // Save Sources

// // Load Sources
// async function loadSources() {
//   try {
//     const data = await fsp.readFile(SOURCES_FILE, 'utf8');
//     return JSON.parse(data || '[]');
//   } catch (err) {
//     if (err.code === 'ENOENT') {
//       await fsp.writeFile(SOURCES_FILE, '[]');
//       return [];
//     }
//     console.error('Error reading sources:', err.message);
//     return [];
//   }
// }

// // Save Knowledge Base
// async function saveKnowledgeBase(knowledge) {
//   try {
//     await fsp.writeFile(KNOWLEDGE_FILE, JSON.stringify(knowledge, null, 2));
//   } catch (err) {
//     console.error('Error saving knowledge base:', err.message);
//   }
// }

// async function updateKnowledgeBase() {
//   const faqs = await loadFAQs();
//   const sources = await loadSources();
//   const faqText = faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n\n");
//   const sourceText = sources.map(s => s.text).join("\n\n");
//   const combined = `${faqText}\n\n${sourceText}`.trim();
//   await saveKnowledgeBase({ text: combined });
// }


// app.get('/faqs', async (req, res) => {
//   try {
//     const faqs = await loadFAQs();
//     res.json(faqs);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to load FAQs' });
//   }
// });

// app.get('/faq-sources', async (req, res) => {
//   const sources = await loadSources();
//   res.json(sources);
// });


// app.post('/add-faq', async (req, res) => {
//   const { id, question, answer } = req.body;

//   if (!question || !answer) {
//     return res.status(400).json({ status: "error", message: "Question and answer are required" });
//   }

//   let faqs = await loadFAQs();
//   let realId = id && id.trim() !== '' ? id : uuidv4();
//   const index = faqs.findIndex(f => f.id === realId);

//   if (index !== -1) {
//     faqs[index] = { id: realId, question, answer }; // Update
//   } else {
//     faqs.push({ id: realId, question, answer }); // Add
//   }

//   await saveFAQs(faqs);
//   await updateKnowledgeBase();
//   io.emit("faq_updated");

//   res.json({ status: "success", message: index !== -1 ? "FAQ updated" : "FAQ added" });
// });





// app.post('/delete-faq', async (req, res) => {
//   const { id } = req.body;
//   let faqs = await loadFAQs();
//   const index = faqs.findIndex(f => f.id === id);
//   if (index === -1) {
//     return res.status(404).json({ status: "error", message: "FAQ not found" });
//   }
//   faqs.splice(index, 1);
//   await saveFAQs(faqs);
//   await updateKnowledgeBase();
//   io.emit("faq_deleted", { id });
//   res.json({ status: "success", message: "FAQ deleted" });
// });

// // ----------------------EMAIL NOTIFICATIONS -----------------------------------------

// async function saveConfig(config) {
//   await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
// }
// app.get('/admin-email', async (req, res) => {
//   try {
//     const config = await loadConfig();
//     res.json({ email: config.adminEmail });
//   } catch (error) {
//     console.error('GET /admin-email error:', error);
//     res.status(500).json({ status: 'error', message: 'Server error' });
//   }
// });
// app.post('/update-admin-email', async (req, res) => {
//   try {
//     const { adminEmail } = req.body;
//     console.log('Received adminEmail:', adminEmail);
//     if (!adminEmail) {
//       return res.status(400).json({ status: 'error', message: 'Email is required' });
//     }
//     const config = await loadConfig();
//     config.adminEmail = adminEmail;
//     await saveConfig(config);
//     res.json({ status: 'success', message: 'Admin email updated' });
//   } catch (error) {
//     console.error('POST /update-admin-email error:', error);
//     res.status(500).json({ status: 'error', message: 'Server error' });
//   }
// });

// // Create widget with dynamic widgetId
// app.post('/api/create-widget', (req, res) => {
//   const newWidget = req.body;
//   const widgets = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//   // Generate unique widgetId
//   const widgetId = crypto.randomBytes(8).toString('hex'); // 16-character ID
//   newWidget.widgetId = widgetId;
//   widgets.push(newWidget);
//   fs.writeFileSync(filePath, JSON.stringify(widgets, null, 2));
//   res.json({ success: true, message: 'Widget created successfully', widgetId });
// });
// //-------------------multer ----------------------

// // ✅ Get all sources
// app.get('/api/sources', (req, res) => {
//   console.log('📡 /api/sources hit');
//   res.json(getSources());
// });
// server.listen(PORT, () => {
//   console.log(`✅ Server running at http://localhost:${PORT}`);
// });

const express = require('express');
const path = require('path');
const session = require('express-session');
const sanitizeHtml = require('sanitize-html');
const bodyParser = require('body-parser');
const { Socket } = require('socket.io');
const pdfParse = require('pdf-parse');

const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const Together = require('together-ai');
const fs = require('fs'); // ? this allows await
const fsp = require('fs/promises');   // for async/await usage
const { v4: uuidv4 } = require('uuid');
const CONFIG_FILE = path.join(process.cwd(), 'config.json');



const FAQ_FILE = path.join(__dirname, "faqs.json");
const KNOWLEDGE_FILE = path.join(__dirname, "knowledge_base.json");
const app = express();



const http = require('http');
const PORT = 3000;
app.use(cors());

// Allow all origins and methods
app.use(cors({
  origin: '*', // Allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow common headers
}));


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
const { register } = require('module');
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const AUTH_USER = { username: "admin", password: "1234" };

// LOGIN PAGE
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views','Demo.html'));
});

app.get('/admin', (req, res) => {
  if (req.session.loggedIn) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});


app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'Register.html'));
})

// Helper: Load users
const loadUsers = () => {
  try {
    const data = fs.readFileSync('user.json');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};


// get All users
app.get("/api/all-users", (req, res) => {
  const users = loadUsers();
  res.json(users);
});

// Helper: Save users
const saveUsers = (users) => {
  fs.writeFileSync('user.json', JSON.stringify(users, null, 2));
};


// Register API
app.post('/api/register', (req, res) => {
  const { username, password, email, propertyUrl, role } = req.body; // role can be "admin" or "superadmin"
  const errors = {};
  const users = loadUsers();
  const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;

  if (!usernameRegex.test(username)) {
    errors.username = "Username must be 4-20 alphanumeric characters.";
  }
  if (!password || password.length < 4) {
    errors.password = "Password must be at least 4 characters.";
  }
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    errors.username = "Username already exists.";
  }
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    errors.email = "Email already registered.";
  }
  if (!propertyUrl) {
    errors.widget = "Property name and URL required for widget creation.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const createdAt = formatDateTime(new Date());
  const status = "active";

let currentId = 1000; // starting number

const userId = () => {
  currentId += 1;
  return currentId.toString();
}


  users.push({ userId, username, email, password, role: role || "admin", status, createdAt });
  saveUsers(users);

  console.log("New User Registered:", { userId, username, email });

  // Create widget
  const widgetId = generateWidgetId();
  saveWidgetToDb({
    widgetId,
    welcome: "Welcome to Iosandweb Technology",
    color: "#007bff",
    overviewColor: "#0a6fbd",
    show: true,
    position: "bottom-right",
    propertyUrl,
    status: "active",
    forwardEmail: "support@example.com",
    createdBy: username
  });

  res.status(200).json({ 
    message: "Registration successful", 
    userId, 
    username, 
    role: role || "admin" 
  });
});




function loadJSON(filePath) {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return [];
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
//----------------DELETE THE ADMIN DATA--------------------------
app.delete('/api/delete-user/:userId', (req, res) => {
  const userId = req.params.userId;

  const usersFile = path.join(__dirname, 'user.json');
  const dbFile = path.join(__dirname, 'db.json');

  // Load both files
  let users = loadJSON(usersFile);
  let widgets = loadJSON(dbFile);

  // Find user by userId
  const userToDelete = users.find(u => u.userId === userId);
  if (!userToDelete) {
    return res.status(404).json({ message: 'User not found' });
  }

  const username = userToDelete.username;
  console.log("Deleting user and widgets for:", username);

  // 1. Delete user from user.json
  users = users.filter(u => u.userId !== userId);

  // 2. Delete related widgets from db.json where createdBy matches username
  widgets = widgets.filter(w => {
    if (!w.createdBy) return true;
    return w.createdBy.toLowerCase() !== username.toLowerCase();
  });

  // Save updated data back to files
  saveJSON(usersFile, users);
  saveJSON(dbFile, widgets);

  res.status(200).json({ message: `User '${username}' deleted successfully.` });
});






//---------------------- UPDATE API -----------------------------//
app.put('/api/update/admin/:userId', (req, res) => {
  const { userId } = req.params;
  const { username, password, email, status } = req.body;

  const usersFile = path.join(__dirname, 'user.json');
  const dbFile = path.join(__dirname, 'db.json');

  let users = loadJSON(usersFile);
  let widgets = loadJSON(dbFile);

  const userIndex = users.findIndex(u => u.userId === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const oldUsername = users[userIndex].username;

  // Update user details
  if (username) users[userIndex].username = username;
  if (password) users[userIndex].password = password;
  if (email) users[userIndex].email = email;
  if (status) users[userIndex].status = status;

  saveJSON(usersFile, users);

  // Update widget(s) where createdBy matches oldUsername
  widgets = widgets.map(widget => {
    if (
      widget.createdBy &&
      widget.createdBy.toLowerCase() === oldUsername.toLowerCase()
    ) {
      return {
        ...widget,
        createdBy: username,
        status: status || widget.status  // update status if provided
      };
    }
    return widget;
  });

  saveJSON(dbFile, widgets);

  return res.json({ message: "User updated successfully" });
});

app.get('/api/my-widget', (req, res) => {
  const username = req.session.username;
  if (!username) return res.status(401).json({ message: 'Unauthorized' });

  const filePath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const myWidgets = db.filter(w => w.createdBy === username && w.status === 'active');

  res.json(myWidgets);
});

// Helper: Save users
const saveUsersprofile = (users) => {
  fs.writeFileSync('admin-new-property.json', JSON.stringify(users, null, 2));
};


//----------------------------


app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials." });

  const dbPath = path.join(__dirname, 'db.json');
  let widgets = [];
  if (fs.existsSync(dbPath)) {
    widgets = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }

  // Debug logs
  console.log("Searching for widget for username:", username);
 const userWidget = widgets.find(
  w => w.createdBy.toLowerCase() === username.toLowerCase() 
);

  console.log("Found widget:", userWidget);

  req.session.loggedIn = true;
  req.session.username = username;

  const widgetId = userWidget ? userWidget.widgetId : null;
  const propertyUrl = userWidget ? userWidget.propertyUrl : null;

  res.status(200).json({
    success: true,
    username,
    widgetId,
    propertyUrl // send widgetId (could be null if not found)
  });
});


// LOGOUT HANDLER
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Logout failed");
    }
    res.clearCookie('connect.sid'); // optional, but recommended
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
  });
});




// Generate dynamic widget ID
const generateWidgetId = () => crypto.randomUUID();

// Save new widget to db.json
const saveWidgetToDb = (widgetData) => {
  const filePath = path.join(__dirname, 'db.json');
  let db = [];
  try {
    if (fs.existsSync(filePath)) {
      db = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading db.json:', err.message);
  }
  db.push(widgetData);
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
};


app.get('/api/widgets-by-user', (req, res) => {
  const username = req.query.username;
  const filePath = path.join(__dirname, 'db.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const userWidgets = data.filter(w => w.createdBy === username);
    res.json(userWidgets);
  } catch (err) {
    console.error('Error reading db.json:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
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



function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 => 12

  const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  return `${year}-${month}-${day} ${formattedTime}`;
}



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
});;




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
    console.log(`?? Registering user: ${userId} with socket ${socket.id}`);
    registeredUserId = userId;
    connectedUsers[userId] = socket.id;
    activeUsers.add(userId);
  });
  socket.on('send-message', (data) => {
    console.log(`?? Received message from ${data.userId}: ${data.message}`);
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

// ? Global maps
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
  console.log("?? Active users being sent:", Array.from(activeUsers));
  console.log("?? Connected users:", connectedUsers);
  res.json(Array.from(activeUsers));
});

// Chat history (optional)
app.get('/api/chat-history/:userId', (req, res) => {
  const userId = req.params.userId;
  const chatData = JSON.parse(fs.readFileSync('chat.json', 'utf8') || '{}');
  res.json(chatData[userId] || []);
});





// ? API to get chat history for a user
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
    console.log("?? Looking for:", FAQ_FILE);
    const data = await fs.readFileSync(FAQ_FILE, 'utf8');
    const faqs = JSON.parse(data);
    res.json(faqs);
  } catch (err) {
    console.error("? Error loading faqs.json:", err);
    res.status(500).json({ error: 'Failed to load FAQs' });
  }
});








// === File paths ===
const SOURCES_FILE = path.join(__dirname, 'faqSources.json');

// === Load sources ===
function getSources() {
  try {
    return JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

// === Serve static uploaded PDFs ===
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === File upload setup ===
////   CHANGE THE FILE NAME
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => {
//     const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
//   }
// });
////-----------------NOTE CHNAGE THE FILE NAME
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep original file name
  }
});



const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed!'));
  }
});

// === API: Get all sources ===

app.get('/api/faq-sources', (req, res) => {
  try {
    const sources = getSources();
    res.json(sources);
  } catch (err) {
    console.error("❌ Error loading sources:", err);
    res.status(500).json({ error: 'Failed to load sources' });
  }
});

//---------------------
async function saveSources(sources) {
  try {
    await fsp.writeFile(SOURCES_FILE, JSON.stringify(sources, null, 2));
    io.emit("source_updated"); // optional real-time event
    if (typeof updateKnowledgeBase === 'function') {
      await updateKnowledgeBase(); // optional hook
    }
  } catch (err) {
    console.error('? Error saving sources:', err.message);
  }
}

// ? Add URL

function generateId() {
  return Date.now() + '-' + Math.floor(Math.random() * 1000000);
}

// === API: Add URL ===
app.post('/api/add-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const response = await axios.get(url);

    // Sanitize HTML and extract visible text
    let rawText = sanitizeHtml(response.data, {
      allowedTags: [],
      allowedAttributes: {}
    });
    rawText = rawText.replace(/\s+/g, ' ').trim();

    const sources = getSources();
    sources.push({
      id: generateId(), // ✅ New ID for each entry
      type: 'url',
      url,
      text: rawText
    });

    saveSources(sources);
    res.json({ message: '✅ URL added and text extracted', url });
  } catch (err) {
    console.error('❌ URL add error:', err.message);
    res.status(500).json({ error: 'Failed to fetch or process URL content' });
  }
});

// === API: Upload PDF ===
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text?.replace(/\s+/g, ' ').trim() || '';

    const sources = getSources();
    const newId = generateId(); // ✅ New ID for each PDF
    sources.push({
      id: newId,
      type: 'pdf',
      filename: req.file.filename,
      text: extractedText
    });

    saveSources(sources);
    res.json({
      message: '✅ PDF uploaded successfully',
      filename: req.file.filename,
      id: newId
    });
  } catch (err) {
    console.error('❌ PDF upload error:', err.message);
    res.status(500).json({ error: 'Failed to upload or process PDF' });
  }
});


app.delete('/api/delete/:id', (req, res) => {
  const { id } = req.params;
  let sources = getSources();

  // Find the item
  const itemToDelete = sources.find(item => String(item.id) === String(id));
  if (!itemToDelete) {
    return res.status(404).json({ error: 'ID not found' });
  }

  // Figure out file path
  let filePath;
  if (itemToDelete.filePath) {
    // If full path stored
    filePath = path.resolve(itemToDelete.filePath);
  } else if (itemToDelete.fileName) {
    // If only name stored
    filePath = path.join(__dirname, 'uploads', itemToDelete.fileName);
  }

  // Delete file if exists
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑 Deleted file from uploads: ${filePath}`);
    } catch (err) {
      console.error(`❌ Failed to delete file: ${filePath}`, err);
    }
  } else {
    console.warn(`⚠ File not found for deletion: ${filePath}`);
  }

  // Remove from DB
  sources = sources.filter(item => String(item.id) !== String(id));
  saveSources(sources);

  res.json({ message: `✅ Item with ID ${id} deleted` });
});


app.put('/api/update/:id', upload.single('pdf'), async (req, res) => {
  const { id } = req.params;
  let sources = getSources();
  const index = sources.findIndex(item => String(item.id) === String(id));

  if (index === -1) {
    return res.status(404).json({ error: 'ID not found' });
  }

  // If updating PDF
  if (req.file) {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text?.replace(/\s+/g, ' ').trim() || '';

    sources[index].filename = req.file.filename;
    sources[index].text = extractedText;
  }

  // If updating URL
  if (req.body.url) {
    const response = await axios.get(req.body.url);
    let rawText = sanitizeHtml(response.data, { allowedTags: [], allowedAttributes: {} });
    rawText = rawText.replace(/\s+/g, ' ').trim();
    sources[index].url = req.body.url;
    sources[index].text = rawText;
  }
  saveSources(sources);
  res.json({ message: `✅ Item with ID ${id} updated` });
});


// ? Static file serving
// app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
//   try {
//     const dataBuffer = fs.readFileSync(req.file.path);
//     const pdfData = await pdfParse(dataBuffer);
//     const sources = getSources();
//     const newSource = {
//       type: 'pdf',
//       filename: req.file.filename,
//       text: pdfData.text.replace(/\s+/g, ' ').trim()
//     };
//     console.log("Saving PDF Source:", newSource);
//     sources.push(newSource);
//     saveSources(sources);
//     res.json({ message: 'PDF uploaded', filename: req.file.filename });
//   } catch (err) {
//     console.error('Upload error:', err.message);
//     res.status(500).json({ error: 'Failed to upload PDF' });
//   }
// });


// ? TogetherAI Helper Function

// async function askTogetherAI(prompt) {
//   try {
//     const response = await axios.post('https://api.together.xyz/v1/chat/completions', {
//       model: "meta-llama/Llama-3-8b-chat-hf",
//       messages: [{
//         role: "user",
//         content: `Answer in one sentence (8–20 words), plain language only. No greeting.\n\nQuestion: "${prompt}"`
//       }],
//       max_tokens: 80,
//       temperature: 0.3
//     }, {
//       headers: {
//         'Authorization': `Bearer ${TOGETHER_API_KEY}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     return response.data.choices?.[0]?.message?.content?.trim();
//   } catch (error) {
//     console.error('? TogetherAI Error:', error.response?.data || error.message);
//     return null;
//   }
// }








const TOGETHER_API_KEY = '9b95f35ce1e2044a91852f23f0f6e554bfb128ced09848fe0447e7f0fc57a6d6';

const together = new Together({ apiKey: TOGETHER_API_KEY });
const aiResponseCache = new Map();
let lastApiCall = 0;
const RATE_LIMIT_MS = 1000;

async function loadKnowledgeBase() {
  const sources = getSources();
  return { text: sources.map(s => s.text).join("\n\n") };
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ===== AI Response =====
async function getAIResponse(message, userId = "default", isDetailed = false) {
  try {
    const cleanMessage = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });
    const cacheKey = `${userId}:${cleanMessage}:${isDetailed}`;

    if (aiResponseCache.has(cacheKey)) {
      return aiResponseCache.get(cacheKey);
    }

    const knowledge = await loadKnowledgeBase();
    const context = knowledge.text || "";

    const now = Date.now();
    if (now - lastApiCall < RATE_LIMIT_MS) {
      await sleep(RATE_LIMIT_MS - (now - lastApiCall));
    }
    lastApiCall = now;

    const contents = [
      {
        role: "system",
        content: `You are an assistant for an iOS and web services company. Provide accurate, concise, and professional answers using the following knowledge base:\n\n${context}`
      },
      { role: "user", content: cleanMessage }
    ];

    const response = await together.chat.completions.create({
      messages: contents,
      model: "deepseek-ai/DeepSeek-V3",
      max_tokens: isDetailed ? 500 : 100,
      temperature: 0.7
    });

    const aiResponse = response.choices[0]?.message?.content?.trim() || "";

    aiResponseCache.set(cacheKey, aiResponse);
    if (aiResponseCache.size > 100) {
      aiResponseCache.delete(aiResponseCache.keys().next().value);
    }

    return aiResponse;
  } catch (error) {
    console.error("Error calling Together AI:", error.message);
    return "Sorry, I encountered an error. Please try again or contact support.";
  }
}



// ===== API: Ask Question =====
app.all("/api/ask-question", async (req, res) => {
  const message = req.method === "POST" ? req.body.message : req.query.message;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const normalize = str => str.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const msg = normalize(message);
  const msgWords = msg.split(/\s+/);

  try {
    const botReplies = JSON.parse(fs.readFileSync("botReplies.json", "utf8"));
    const faqs = JSON.parse(fs.readFileSync("faqs.json", "utf8"));
    const sources = getSources();

    // 1. Strict match in PDFs/URLs
    for (const src of sources) {
      const lines = (src.text || "")
        .split(/[\n.]/)
        .map(line => line.trim())
        .filter(line => line.length > 20);

      for (const line of lines) {
        const normLine = normalize(line);
        const lineWords = normLine.split(/\s+/);
        const matchedWords = msgWords.filter(w => lineWords.includes(w));
        const matchRatio = matchedWords.length / msgWords.length;

        if (matchRatio >= 0.5 || normLine.includes(msg)) {
          const shortAnswer = line.length > 180 ? line.slice(0, 180) + "..." : line;
          return res.json({
            answer: shortAnswer,
            source: src.url ? `🌐 URL: ${src.url}` : `📄 PDF: ${src.filename}`
          });
        }
      }
    }

    // 2. Match from FAQs
    for (const faq of faqs) {
      const q = normalize(faq.question);
      if (msg === q || msg.includes(q) || q.includes(msg)) {
        return res.json({ answer: faq.answer, source: "📌 FAQ" });
      }
    }

    // 3. Match from BotReplies
    for (const entry of botReplies) {
      if (entry.keywords.some(k => msg.includes(normalize(k)))) {
        return res.json({ answer: entry.response, source: "🤖 Bot" });
      }
    }

    // 4. Loose match in PDFs
    for (const src of sources) {
      const text = (src.text || "").toLowerCase();
      if (text.includes(msg)) {
        return res.json({
          answer: "Your question matches content in a source. Please rephrase or be more specific.",
          source: src.url ? `🌐 URL: ${src.url}` : `📄 PDF: ${src.filename}`
        });
      }
    }

    // 5. Final fallback — TogetherAI
    const aiAnswer = await getAIResponse(message);
    if (!aiAnswer || aiAnswer.length < 10 || aiAnswer.toLowerCase().includes("i'm not sure")) {
      return res.json({
        answer: "I'm your assistant for tech support, health tips, general info, and guidance. Please ask within those topics.",
        source: "🤖 TogetherAI (default fallback)"
      });
    }
    return res.json({ answer: aiAnswer, source: "🤖 TogetherAI" });
  } catch (err) {
    console.error("❌ Error in /api/ask-question:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




// Load widget

app.get('/api/load-widget', async (req, res) => {
  const id = req.query.id;
  const allWidgets = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  const data = allWidgets.find(w => w.widgetId === id);
  if (!data || !data.show) return res.end();  const [vPos, hPos] = data.position.split('-');
  const imageUrl = data.imageUrl || 'https://img.freepik.com/free-vector/young-man-with-glasses-illustration_1308-174706.jpg';
  const chatHeader = data.chatHeader || 'iosandweb';
  const welcome = data.welcome || '?? Welcome! How can I assist you today?';
  const fontFamily = data.fontFamily || 'Arial';
  const fontSize = data.fontSize || '14px';
  const fontSizeOverview = data.fontSizeOverview || '20px';
  const color = data.color || '#007bff';
  const overviewColor = data.overviewColor || '#4b9df2';


   const widgetId = req.query.id || 'unknown';
  const referer = req.headers.referer || 'N/A';
  const origin = req.headers.origin || 'N/A';
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

   const logEntry = {
    widgetId,
    referer,
    origin,
    ip,
    timestamp: new Date().toISOString()
  };

  const trackFilePath = path.join(__dirname, 'track.json');
  let trackData = [];

  // Read and parse track.json
  if (fs.existsSync(trackFilePath)) {
    try {
      const raw = fs.readFileSync(trackFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      trackData = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('? Error parsing track.json:', err.message);
      trackData = [];
    }
  }

  // ? Check if this widgetId + referer + origin + ip is already tracked
  const alreadyLogged = trackData.some(entry =>
    entry.widgetId === widgetId &&
    entry.referer === referer &&
    entry.origin === origin &&
    entry.ip === ip
  );

  // ? Only log if it's not already saved
  if (!alreadyLogged) {
    trackData.push(logEntry);
    fs.writeFileSync(trackFilePath, JSON.stringify(trackData, null, 2));
  }

  res.setHeader('Content-Type', 'application/javascript');
  res.send(`(function () {
    if (document.getElementById("custom-chat-launcher")) return;

    const script = document.createElement("script");
    script.src = "http://localhost:3000/socket.io/socket.io.js";
    script.onload = () => {
      const socket = io("http://localhost:3000/");

// ?? Live update for widget settings
socket.on('settings-updated', ({ widgetId: updatedId, updates }) => {
  if (updatedId !== '${data.widgetId}') return;

  console.log("?? settings-updated received:", updates);

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

  // ? Update avatar image (moved here from overview-updated)
  if ('imageUrl' in updates) {
    const avatar = document.querySelector('.chat-header img');
    if (avatar) avatar.src = updates.imageUrl;
  }
});


// ?? Live update for overview section (like avatar, header, position)
socket.on('overview-updated', ({ widgetId: updatedId, updates }) => {
  if (updatedId !== '${data.widgetId}') return;

  console.log("?? overview-updated received:", updates);
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

  // ? Update position dynamically
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
  if (diffInSeconds < 60) return diffInSeconds + " seconds ago";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return minutes + " minutes ago";
  const hours = Math.floor(minutes / 60);
  return hours + " hours ago";
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

 .chat-card {
    border-radius: 10px;
    background: linear-gradient(135deg,rgb(48, 131, 240),rgb(143, 195, 243));
    padding: 16px;
    font-family: 'Segoe UI', sans-serif;
    color: #3c2a2a;
    height:230px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  #close-humanfrom {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 30px;
    font-weight: bold;
    color: #00000099;
    cursor: pointer;
  }

  .chat-card h2 {
    margin: 5px 0;
    font-size: 30px;
    font-weight: 600;
    color: white;
  }

  .chat-card p {
    margin: 0 0 15px;
    font-size: 15px;
    color:white;
  }

#start-chat-now-inside {
  width: 320px;
  margin-top: 5px;
  margin-left: -22px;
  padding: 25px 26px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  cursor: pointer;
  text-align: left;
}


.chat-arrow {
  font-size: 20px;
  color: #000;
  margin-left: 10px;
}
.chat-card img{
height:30px;
width:30px;
}

  #start-chat-now-inside span {
    color: #000;
    font-size: 18px;
  }

  #start-chat-now-inside:hover {
    background-color:rgb(255, 255, 255);
  }

  .chat-note {
    font-size: 11px;
    margin-top: 5px;
    color: #555;
  }

 .powered {
    font-size: 13px;
    margin-top: 100px;
    text-align: center;
    font-size: 13px;
    color: #007bff;
    font-weight: 700;
}
   .powered a {
    text-decoration: none;
    color: #007bff;
     }

   .powereds{
     font-size: 13px;
    text-align: center;
    font-size: 13px;
    color: #007bff;
    margin-left: 8px;
    font-weight: 700;
     }
       .powereds a {
        text-decoration: none;
       color: #007bff;
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
            console.error("? Error in askQuestion:", err);
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
  console.log("Static data loaded");
})
.catch(err => {
  console.error("? Failed to load static data:", err);
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

   icon.innerHTML = '<img src="https://cdn-icons-png.flaticon.com/512/2462/2462719.png" width="30" height="30" style="display:block;" />';
  const chatBox = document.createElement("div");
   chatBox.className = "chat-box";
  chatBox.style.display = "none";

  chatBox.innerHTML = \`
<div class='chat-header' id="chat-headers">
<div style="display:none;">
          <img src="https://cdn-icons-png.freepik.com/512/10486/10486534.png" style="height:30px; width:30px; cursor:pointer;" />
        </div>
<div id="icon-close-chat">
          <img src="https://cdn-icons-png.freepik.com/512/10486/10486534.png" style="height:30px; width:30px; cursor:pointer;" />
        </div>  &nbsp;
  <img src='${imageUrl}' style="height:30px;width:30px;border-radius:50%;margin-right:8px;" />
  ${chatHeader}
  <button id="close-btn" style="margin-left:auto;background:transparent;border:none;font-size:18px;cursor:pointer;color:white">X</button>
</div>

<div id="hrFormWrapper" style="dispaly:block;">
<div class="chat-card">
<img src="https://iosandweb.com/static/media/IAW-logo-white.6b112d39bfa39ab63a4a.png" alt="Logo" style="height:50px;width:150px;margin-top:15px">
  <div id="close-humanfrom">&#10006;</div>
  <div style="height:14px"></div>
    <h2>Hi there &#9995;</h2>
  <p>Welcome to our website Ask us anything &#10024;</p>
  <form id="hr-form">
  <button type="button" id="start-chat-now-inside">
  <div class="chat-text">
    <strong>Chat with us</strong>
    <div class="chat-note">We typically reply within a few minutes.</div>
  </div>
  <span class="chat-arrow">
   &#10148;
</span>
</button>
   </form>
</div>
   <p class="powered">
  &#169; Powered By -
  <a href="https://iosandweb.net/" target="_blank" rel="noopener noreferrer">
    IosAndWeb Technologies - AI.Dev &#169;
  </a>
</p>
</div>
<div class='chat-messages' id='chat-msgs' style="display:none;"></div>
<div class='chat-input' style="display:none;">
  <input type='text' id='chat-input' placeholder='Type a message...' onkeydown="if(event.key==='Enter') sendChatMsg()" />
  <button onclick='sendChatMsg()'>Send</button>
</div>
<div class="row mb-3" id="chat-controls">

 <div class="col-8 d-flex" style="text-align: center;">
   <u style="color: blue; cursor: pointer;" id="contact-human">Contact Human</u>&nbsp; 
  <u style="color: red; cursor: pointer;" id="end-chat">End Chat</u>

 <p class="powereds">
  &#169; Powered By -
  <a href="https://iosandweb.net/" target="_blank" rel="noopener noreferrer">
    IosAndWeb Technologies - AI.Dev &#169;
  </a>
</p>
  </div>
     <br/>
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
   <form id="feedback-form">
  <center>

   <div id="icon-close-feedback">
          <img src="https://cdn-icons-png.freepik.com/512/8689/8689950.png" style="height:30px; width:30px; margin-right:300px; cursor:pointer;" />
        </div>
  <label>Rating this chat</label> <br/>
<div class="star-rating" id="starratings">
  <input type="radio" id="star5" name="rating" value="5" /><label for="star5">&#9733;</label>
  <input type="radio" id="star4" name="rating" value="4" /><label for="star4">&#9733;</label>
  <input type="radio" id="star3" name="rating" value="3" /><label for="star3">&#9733;</label>
  <input type="radio" id="star2" name="rating" value="2" /><label for="star2">&#9733;</label>
  <input type="radio" id="star1" name="rating" value="1" /><label for="star1">&#9733;</label>
</div></center>
        <label>Your Name<span style="color:red">*</span></label>
    <input type="name" name="name" id="feedbackename" required style="width:96%;padding:8px;margin-bottom:5px;height:20px; border-radius:6px;border:1px solid #ccc;" />
          <label>Your Email<span style="color:red">*</span></label>
    <input type="email" name="email" id="feedbackemail" required style="width:96%;padding:8px;margin-bottom:5px;height:20px;border-radius:6px;border: 1px solid #ccc;" />
    <br/>   
    <label>Your feedback:</label>
    <textarea name="feedback" required style="width:100%;height:60px;margin-bottom:8px;border-radius:6px;border:1px solid #ccc;"></textarea>
    <button type="submit" style="background:#007bff;color:white;padding:15px;border:none;width:100%;border-radius:10px">Submit Feedback</button>  </form>
<br>
    \`;

  setTimeout(() => {
    const input = document.getElementById("chat-input");
    const chatBox = document.querySelector(".chat-box");

    if (!input || !chatBox) {
      console.warn("?? Required elements missing.");
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
      <p>Are you still Connected</p>
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
          console.log("? Inactivity detected, showing modal.");
        }
      }, 500000); // 5 mints
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

  // ? Correct usage of event object
  e.target.reset?.(); // Only call if it's a form

  // ? Reset user state
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
  if (!feedback || !email || !rating) {
    return alert("Please fill in all the required fields.");
  }
    try {
      await fetch("http://localhost:3000/api/chat-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, feedback, rating, email }),
      });
      if (userId) socket.emit("disconnect-user", userId);
      document.getElementById("chat-msgs").innerHTML = "";
      e.target.reset();
      localStorage.removeItem("custom_user_id");
      localStorage.removeItem("welcomeShown");
      document.querySelector(".chat-box").style.display = "none";
      alert("Thank you! Your feedback successfully.");
    } catch (err) {
      console.error("? Error submitting feedback:", err);
    }
  }
},1000);

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
           e.target.reset();
          localStorage.removeItem("custom_user_id");
         localStorage.removeItem("welcomeShown");
        console.log("? End chat email sent");
      } catch (error) {
        console.error("? Error sending chat history:", error);
      }
    });
  }


const chatMsgs = document.getElementById("chat-msgs");
if (contactHumanBtn) {
  contactHumanBtn.addEventListener("click", async () => {
    const userId = localStorage.getItem("custom_user_id") || crypto.randomUUID().generateUUID();
    localStorage.setItem("custom_user_id", userId);

    // Show typing animation
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-msg bot-msg typing";
    typingDiv.innerHTML = \`
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    \`;
    chatMsgs.appendChild(typingDiv);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    try {
      const res = await fetch("http://localhost:3000/api/request-human", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      const result = await res.json();
      typingDiv.classList.remove("typing");
      typingDiv.innerHTML = result.message || "? A human assistant has been notified.";
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    } catch (error) {
      console.error("Failed to request human:", error);
      typingDiv.classList.remove("typing");
      typingDiv.innerHTML = "?? Failed to request human. Please try again.";
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }
  });
}

}, 1000);

// Icon click logic





// === Close feedback box ===
setTimeout(() => {
  const iconCloseChat = document.getElementById("icon-close-feedback");
  const chatBox = document.querySelector(".chat-box");

  if (iconCloseChat && chatBox) {
    iconCloseChat.onclick = function () {
      chatBox.style.display = "none";
      localStorage.setItem("chatBoxOpen", "false");
    };
  }
}, 500);

// === Close Chat Button ===
setTimeout(() => {
  const iconCloseChat = document.getElementById("icon-close-chat");
  const chatBox = document.querySelector(".chat-box");

  if (iconCloseChat && chatBox) {
    iconCloseChat.onclick = function () {
      chatBox.style.display = "none";
      localStorage.setItem("chatBoxOpen", "false");
    };
  }
}, 500);

// === Restore chat state on load ===
setTimeout(() => {
  const chatBox = document.querySelector(".chat-box");
  if (localStorage.getItem("chatBoxOpen") === "true" && chatBox) {
    chatBox.style.display = "flex";
    showChatInterface();
  }
}, 100);

// === Restore on browser navigation ===
window.addEventListener("popstate", () => {
  const chatBox = document.querySelector(".chat-box");
  const uid = localStorage.getItem("custom_user_id");
  if (uid && chatBox) {
    chatBox.style.display = "flex";
    showChatInterface();
  }
});




function generateUUID() {
  // Generate UUID
  const uuid = 'xxxxxx-xxxx-4xxx-yxxx-xxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 10 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(10);
  });

  // Get current date and time
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  const timestamp = \`\${yyyy}\${mm}:\${dd}_\${hh}:\${min}:\${ss}\`;
      return \`\${uuid}_\${timestamp}\`;
}

let userId = localStorage.getItem("custom_user_id");
console.log("Generated User ID:", userId);





window.addEventListener("beforeunload", () => {
  localStorage.removeItem("custom_user_id");
  localStorage.removeItem("welcomeShown");
  localStorage.removeItem("chatBoxOpen");
});



// Chat Icon Toggle Handler
icon.onclick = function () {
  const chatBox = document.querySelector(".chat-box");
  const isHidden = chatBox.style.display === 'none' || chatBox.style.display === '';
  localStorage.setItem("chatBoxOpen", isHidden ? "true" : "false");
  chatBox.style.display = isHidden ? 'flex' : 'none';

  const hrForm = document.getElementById("hrFormWrapper");
  const chatMsgs = document.getElementById("chat-msgs");
  const chatInput = document.querySelector(".chat-input");
  const chatControls = document.getElementById("chat-controls");
  const chatHeader = document.getElementById("chat-headers");
  const chatFeedback = document.getElementById("chat-feedback");
  const inactivitymodal = document.getElementById("inactivity-modal");

  if (isHidden) {
    const hrFormSubmitted = localStorage.getItem("hrFormSubmitted") === "true";

    if (hrFormSubmitted) {
      showChatInterface();
    } else {
      if (hrForm) hrForm.style.display = 'block';
      if (chatMsgs) chatMsgs.style.display = 'none';
      if (chatInput) chatInput.style.display = 'none';
      if (chatControls) chatControls.style.display = 'none';
      if (chatHeader) chatHeader.style.display = 'none';
      if (chatFeedback) chatFeedback.style.display = 'none';
      if (inactivitymodal) inactivitymodal.style.display = 'none';
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
  } else {
    // ?? When reopening chat, restore chat interface
    showChatInterface();
  }
};
// Handle Form Submission


// === HR Form Submit Handler ===
setTimeout(() => {
  document.addEventListener("submit", async function (e) {
    if (e.target && e.target.id === "hr-form") {
      e.preventDefault();
      const name = e.target.name.value.trim();
      const email = e.target.email.value.trim();
      const hrfillfrom = email;

      if (!name || !email) return;

      try {
        const response = await fetch("http://localhost:3000/api/hr-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, hrfillfrom }),
        });

        const result = await response.json();
        if (result.success) {
          localStorage.setItem("hrFormSubmitted", "true");
          showChatInterface();
        }
      } catch (err) {
        console.error("?? Error sending form:", err);
      }
    }
  });
}, 500);

// === Show Chat on Start Button Click ===
setTimeout(() => {
  const chatStartBtn = document.getElementById("start-chat-now-inside");
  const chatBox = document.querySelector(".chat-box");

  if (chatStartBtn && chatBox) {
    chatStartBtn.addEventListener("click", () => {
      chatBox.style.display = "flex";
      showChatInterface();
    });
  }
}, 500);

// === Show Chat Interface ===
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
if (!userId) {
  userId = (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : generateUUID();
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

 // Show welcome message only once per session
  if (!localStorage.getItem("welcomeShown")) {
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

    localStorage.setItem("welcomeShown", "true");
  }
}

    // === Typing indicator before bot replies ===
function sendChatMsg() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;

  const chatMsgs = document.getElementById("chat-msgs");
  const userTimestamp = new Date();

  // User message container
  const userDiv = document.createElement("div");
  userDiv.className = "chat-msg user-msg";

  // Create message text div and set textContent safely
  const userMsgDiv = document.createElement("div");
  userMsgDiv.textContent = msg;  // safer than innerHTML

  // Create time-ago div
  const userTimeAgoDiv = document.createElement("div");
  userTimeAgoDiv.className = "time-ago";
  userTimeAgoDiv.innerText = timeAgo(userTimestamp);

  userDiv.appendChild(userMsgDiv);
  userDiv.appendChild(userTimeAgoDiv);
  chatMsgs.appendChild(userDiv);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;

  setInterval(() => {
    userTimeAgoDiv.innerText = timeAgo(userTimestamp);
  }, 10000);

  input.value = "";

  // Save user message
  fetch('http://localhost:3000/api/save-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sender: "user", message: msg, timestamp: userTimestamp })
  }).catch(err => console.error("❌ Failed to save user message:", err));

  // Typing indicator
  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-msg bot-msg typing";

  const typingTimeDiv = document.createElement("div");
  typingTimeDiv.className = "time-ago";
  const typingTimestamp = new Date();
  typingTimeDiv.innerText = timeAgo(typingTimestamp);

  const typingDotsDiv = document.createElement("div");
  typingDotsDiv.className = "typing-dots";
  typingDotsDiv.innerHTML = '<span></span><span></span><span></span>';

  typingDiv.appendChild(typingTimeDiv);
  typingDiv.appendChild(typingDotsDiv);
  chatMsgs.appendChild(typingDiv);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;

  setInterval(() => {
    typingTimeDiv.innerText = timeAgo(typingTimestamp);
  }, 10000);

  // Ask bot and replace typing dots with reply safely
  askQuestion(msg)
    .then(response => {
      const reply = response.answer || getBotResponse(msg);
      const botTimestamp = new Date();

      typingDiv.innerHTML = ""; // Clear typing indicator content

      const botMsgDiv = document.createElement("div");
      botMsgDiv.textContent = reply;  // safer textContent instead of innerHTML

      const botTimeAgoDiv = document.createElement("div");
      botTimeAgoDiv.className = "time-ago";
      botTimeAgoDiv.innerText = timeAgo(botTimestamp);

      typingDiv.appendChild(botMsgDiv);
      typingDiv.appendChild(botTimeAgoDiv);

      typingDiv.classList.remove("typing");
      chatMsgs.scrollTop = chatMsgs.scrollHeight;

      setInterval(() => {
        botTimeAgoDiv.innerText = timeAgo(botTimestamp);
      }, 10000);

      // Save bot reply
      return fetch('http://localhost:3000/api/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sender: "bot", message: reply, timestamp: botTimestamp })
      });
    })
    .catch(err => {
      console.error("❌ Failed to get bot response:", err);
      typingDiv.innerHTML = "";
      const errorDiv = document.createElement("div");
      errorDiv.textContent = "❌ Sorry, something went wrong.";
      typingDiv.appendChild(errorDiv);
    });
}





// === Admin message with typing simulation ===
socket.on('admin-message', (data) => {
  console.log("? Received admin message:", data);
  const chatMsgs = document.getElementById("chat-msgs");
  if (!chatMsgs) {
    console.error("? chat-msgs element not found!");
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
document.head.appendChild(script); // ? append FIRST, then onload runs when ready
    })();`);
});



app.get('/api/track-data', (req, res) => {
  const trackFilePath = path.join(__dirname, 'track.json');
  if (!fs.existsSync(trackFilePath)) {
    return res.json([]);
  }

  try {
    const data = fs.readFileSync(trackFilePath, 'utf8');
    const json = JSON.parse(data);
    res.json(Array.isArray(json) ? json : []);
  } catch (err) {
    console.error('Error reading track.json:', err.message);
    res.status(500).json({ error: 'Failed to read track data' });
  }
});




app.post('/api/chat-feedback', async (req, res) => {
  const { userId, name, feedback, rating, email } = req.body;

  if (!userId || !name || !feedback || !email || !rating ) {
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
        <p><a href="http://localhost:3000/admin">Visit Admin Panel</a></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("? Feedback saved and email sent:", name, email);

    res.json({ success: true, message: 'Feedback saved and email sent' });

  } catch (error) {
    console.error("? Error in feedback processing:", error);
    res.status(500).json({ success: false, message: "Server error while saving feedback" });
  }
});




app.post('/api/hr-form', async (req, res) => {
  const { name, email,hrfillfrom  } = req.body;

  if (!name || !email || !hrfillfrom ) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  console.log("Form received:", name,email,hrfillfrom );
  const mailOptions = {
    from: process.env.SMTP_USER,     // Admin email (sender)
    to: email,                       // User's submitted email
    subject: `New Human Assistance Request from `,
    text: `User has requested human assistance.\n\nAccess the admin dashboard: http://localhost:3000/admin`,
    html: `<p>User has requested human assistance.</p><p><a href="http://localhost:3000/admin">Access the admin dashboard</a></p>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("? Email sent to user:", email);
    res.status(200).json({ success: true, message: 'Form received and email sent to user' });
  } catch (error) {
    console.error("? Email error:", error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});


async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    if (!data.trim()) {
      console.log('⚠ config.json is empty, initializing with {}');
      await fs.writeFile(CONFIG_FILE, '{}', 'utf8');
      return {};
    }
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('⚠ config.json not found, creating new one');
      await fs.writeFile(CONFIG_FILE, '{}', 'utf8');
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
        text: `User ${data.userId} has requested human assistance.\n\nAccess the admin dashboard: http://localhost:3000/admin`,
        html: `<p>User <strong>${data.userId}</strong> has requested human assistance.</p><p><a href="http://localhost:3000/admin">Access the admin dashboard</a></p>`,
      };
      break;
    case 'new_message':
      mailOptions = {
        from: process.env.SMTP_USER,
        to: adminEmail,
        subject: `New User Joined Chat: ${data.userId}`,
        text: `A new user (${data.userId}) has joined the chat.\n\nAccess the admin dashboard:  http://localhost:3000/admin`,
        html: `<p>A new user <strong>${data.userId}</strong> has joined the chat.</p><p><a href=" http://localhost:3000/admin">Access the admin dashboard</a></p>`,
      };
      break;
    case 'chat_ended':
      const formattedHistory = data.messages.map(msg => `[${msg.timestamp}] ${msg.sender}: ${msg.message}`).join('\n');
      mailOptions = {
        from: process.env.SMTP_USER,
        to: adminEmail,
        subject: `Chat History for User ${data.userId}`,
        text: `Chat session ended for user ${data.userId}.\n\nChat History:\n${formattedHistory}\n\nAccess the admin dashboard:  http://localhost:3000/admin`,
        html: `<p>Chat session ended for user <strong>${data.userId}</strong>.</p><h3>Chat History</h3><pre>${formattedHistory}</pre><p><a href=" http://localhost:3000/admin">Access the admin dashboard</a></p>`,
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
// app.post('/api/get-all-user-ids', (req, res) => {
//   const { userId, role } = req.body; // pass from logged-in session

//   const chatPath = path.join(__dirname, 'chat.json');
//   if (!fs.existsSync(chatPath)) return res.json([]);

//   const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));

//   let sortedUserIds = Object.entries(chatData)
//     .map(([uid, messages]) => {
//       const latestTimestamp = messages.length
//         ? new Date(messages[messages.length - 1].timestamp)
//         : new Date(0);
//       return { userId: uid, latestTimestamp };
//     })
//     .sort((a, b) => b.latestTimestamp - a.latestTimestamp)
//     .map(entry => entry.userId);

//   if (role !== 'superadmin') {
//     // Only return the current user's ID
//     sortedUserIds = sortedUserIds.filter(id => id === userId);
//   }

//   res.json(sortedUserIds);
// });

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





// ? AI POST Endpoint (kept outside the above route!)
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

// ? AI POST Endpoint (kept outside the above route!)
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
// Load config
// Load config file

async function loadConfig() {
  try {
    const data = await fsp.readFile(CONFIG_FILE, 'utf8');
    if (!data.trim()) {
      console.log('⚠ config.json is empty, initializing with {}');
      await fsp.writeFile(CONFIG_FILE, '{}', 'utf8');
      return {};
    }
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('⚠ config.json not found, creating new one');
      await fsp.writeFile(CONFIG_FILE, '{}', 'utf8');
      return {};
    }
    console.error('❌ Error loading config:', error.message);
    return {};
  }
}

// Save config file
async function saveConfig(config) {
  try {
    await fsp.mkdir(path.dirname(CONFIG_FILE), { recursive: true }); // Ensure folder exists
    const jsonData = JSON.stringify(config, null, 2);
    await fsp.writeFile(CONFIG_FILE, jsonData, 'utf8');
    console.log('✅ Config saved successfully');
  } catch (error) {
    console.error('❌ Error saving config:', error.message);
    throw error;
  }
}

// GET current admin email
app.get('/api/admin-email', async (req, res) => {
  try {
    const config = await loadConfig();
    res.json({ email: config.adminEmail || '' });
  } catch (error) {
    console.error('GET /admin-email error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// PUT update admin email
app.post('/update-admin-email', async (req, res) => {
  try {
    const { adminEmail } = req.body;
    console.log('📥 Received adminEmail:', adminEmail);

    if (!adminEmail) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    // Load config
    const config = await loadConfig();
    config.adminEmail = adminEmail;

    // Save config
    await saveConfig(config);

    res.json({ status: 'success', message: 'Admin email updated' });
  } catch (error) {
    console.error('PUT /update-admin-email error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
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

// ? Get all sources
app.get('/api/sources', (req, res) => {
  console.log('/api/sources hit');
  res.json(getSources());
});





server.listen(PORT, () => {
  console.log(`? Server running at http://localhost:${PORT}`);
});


 