
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
const crypto = require('crypto');
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
// const { console } = require('inspector');

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


app.get('/api/forgot-password',(req,res)=>{
  res.sendFile(path.join(__dirname,'views','ForgotPassword.html'));
})



app.get('/reset-password/:resetToken',(req,res)=>{
  res.sendFile(path.join(__dirname,'views','ResetPassword.html'));
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



// app.get("api/search/username",()=>{
//   const {username}=req.query;
//   const users= loadUsers();

//   if(! username){
//     return res.json(users);
//   }
//   const  searchUsername = users.filter(
//     (user) =>
//       user.username?.toLowerCase().includes(username.toLowerCase())
//   );
//   res.join(searchUsername);
//  })

// ✅ Search API (by username only)
app.get("/api/search-users", (req, res) => {
  const { username } = req.query; // ?username=abc
  const users = loadUsers();

  if (!username) {
    return res.json(users); // if no username given, return all users
  }
  const searchResult = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(username.toLowerCase())
  );
  res.json(searchResult);
});



app.get("/api/status-users", (req, res) => {
  const {status} = req.query; // ?username=abc
  const users = loadUsers();
  if (!status) {
    return res.json(users); // if no username given, return all users
  }
  const searchResult = users.filter(
    (user) =>
      user.status?.toLowerCase().includes(status.toLowerCase())
  );
  res.json(searchResult);
});




// Helper: Save users
const saveUsers = (users) => {
  fs.writeFileSync('user.json', JSON.stringify(users, null, 2));
};


// Register API
// app.post('/api/register', (req, res) => {
//   const { username, password, email, propertyUrl, role } = req.body; // role can be "admin" or "superadmin"
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

//   const createdAt = formatDateTime(new Date());
//   const status = "active";
//   const userId = uuidv4(); // unique user ID

//   users.push({ userId, username, email, password, role: role || "admin", status, createdAt });
//   saveUsers(users);

//   console.log("New User Registered:", { userId, username, email });

//   // Create widget
//   const widgetId = generateWidgetId();
//   saveWidgetToDb({
//     widgetId,
//     welcome: "Welcome to Iosandweb Technology",
//     color: "#007bff",
//     overviewColor: "#0a6fbd",
//     show: true,
//     position: "bottom-right",
//     propertyUrl,
//     status: "active",
//     forwardEmail: "support@example.com",
//     createdBy: username
//   });

//   res.status(200).json({ 
//     message: "Registration successful", 
//     userId, 
//     username, 
//     role: role || "admin" 
//   });
// });

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, propertyUrl, role } = req.body;
    const errors = {};
    const users = loadUsers();

    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|org|net|co\.uk)$/i;
    const urlRegex = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

    // Username validation
    if (!usernameRegex.test(username)) {
      errors.username = "Username must be 3-20 alphanumeric characters.";
    }

    // Password validation
    if (!password || password.length < 4) {
      errors.password = "Password must be at least 4 characters.";
    }

    // Email validation
    if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid Email.";
    }
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      errors.email = "Email already registered.";
    }

    // URL validation
    if (!urlRegex.test(propertyUrl)) {
      errors.widget = "Invalid Project URL. Example: https://example.com";
    }

    // Duplicate username
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      errors.username = "Username already exists.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const createdAt = formatDateTime(new Date());
    const status = "active";
    const userId = Date.now().toString(); // ✅ safer unique id

    users.push({ userId, username, email, password, role: role || "admin", status, createdAt });
    saveUsers(users);

    // ✅ Send Email Confirmation
    try {
    await transporter.sendMail({
    from: `"Support Team" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Registration Successful - Welcome to IAW Chat",
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f7fa; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header with logo -->
          <div style="background: #0a6fbd; padding: 20px; text-align: center;">
            <img src="https://www.iosandweb.com/static/media/IAW-logo-white.6b112d39bfa39ab63a4a.png" alt="IAW Logo" style="max-height: 50px;">
          </div>
                    <div style="padding: 30px; text-align: center;">
            <h2 style="color: #0a6fbd; margin-bottom: 10px;">Welcome, ${username}!</h2>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Your account has been registered successfully 🎉  
              You’re now part of the <b>IAW Chat Application</b>, where you can collaborate and connect just like other chat platforms.
            </p>
            
            <a href="http://localhost:3000/login" 
              style="display: inline-block; background: #0a6fbd; color: #ffffff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">
              Login to Your Account
            </a>
          </div>
          
          <!-- Footer -->
          <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            © ${new Date().getFullYear()} IosAndWeb Technology. All rights reserved.  
          </div>
        </div>
      </div>
    `,
  });




    } catch (error) {
      console.error("Email error:", error);
    }

    console.log("✅ New User Registered:", { userId, username, email });

    // Create admin chat object
    const chatPath = path.join(__dirname, 'chat.json');
    let chatData = {};
    if (fs.existsSync(chatPath)) {
      chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
    }
    if (!chatData[username]) {
      chatData[username] = {};
    }
    chatData[username][userId] = [];
    fs.writeFileSync(chatPath, JSON.stringify(chatData, null, 2));

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

    // ✅ Send only ONE response
    return res.status(200).json({
      message: "Registration successful",
      userId,
      username,
      role: role || "admin"
    });

  } catch (err) {
    console.error("Register API error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
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

  // ✅ Block login if status is inactive
  if (user.status !== "active") {
    return res.status(403).json({ message: "Your account is inactive. Please contact admin." });
  }

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



//-----------------forgot password -----------------------


// ------------------- Forgot Password API -----------------------------
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  let users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  saveUsers(users);
  const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
  try {
    // ✅ Send Email
    await transporter.sendMail({
      from: `"Support Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.json({ message: "Password reset email sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Error sending email" });
  }
});

// -------------------✅ Reset Password API ----------------------------
app.post("/api/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  let users = loadUsers();

  // Find user by reset token
  const user = users.find(
    u => u.resetToken === token && u.resetTokenExpiry > Date.now()
  );

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  // Update password
  user.password = newPassword;
  delete user.resetToken;
  delete user.resetTokenExpiry;
  saveUsers(users);

  res.json({ success: true, message: "Password reset successful. Please login again." });
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
app.get('api/chat-history/:userId', (req, res) => {
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


// Active users list
app.get('/api/active-users', (req, res) => {
  res.json(Array.from(activeUsers));
});

// Chat history (admin + userId)
app.get('/api/chat-history/:userId', (req, res) => {
  const chatData = readChatFile();
  const admin = req.query.admin || "admin";
  const userId = req.params.userId;

  const messages = (chatData[admin] && chatData[admin][userId]) || [];
  res.json(messages);
});

// Socket.io admin reply
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


// Chat history (optional)
// app.get('/api/chat-history/:userId', (req, res) => {
//   const userId = req.params.userId;
//   const chatData = JSON.parse(fs.readFileSync('chat.json', 'utf8') || '{}');
//   res.json(chatData[userId] || []);
// });





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
    const adminName = req.query.adminName; // pass as query param
    if (!adminName) {
      return res.status(400).json({ error: "Admin name is required" });
    }

    const data = await fs.promises.readFile(FAQ_FILE, 'utf8');
    const allFaqs = JSON.parse(data);
    const faqs = allFaqs[adminName] || [];

    res.json(faqs);
  } catch (err) {
    console.error("❌ Error loading faqs.json:", err);
    res.status(500).json({ error: 'Failed to load FAQs' });
  }
});


// app.get('/api/faqs', async (req, res) => {
//   try {
//     console.log("?? Looking for:", FAQ_FILE);
//     const data = await fs.readFileSync(FAQ_FILE, 'utf8');
//     const faqs = JSON.parse(data);
//     res.json(faqs);
//   } catch (err) {
//     console.error("? Error loading faqs.json:", err);
//     res.status(500).json({ error: 'Failed to load FAQs' });
//   }
// });








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

// ✅ Increase body size limit for JSON & urlencoded
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // unique filename
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // ✅ 50 MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") || // ✅ allow any image
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only images or PDF files are allowed!'));
    }
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

// ✅ GET - Fetch sources for a specific user
app.get("/api/faq-sources", (req, res) => {
  const username = req.headers["x-username"];
  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const sources = getSources();
    res.json(sources[username] || []);
  } catch (err) {
    console.error("❌ Error loading sources:", err);
    res.status(500).json({ error: "Failed to load sources" });
  }
});

// ✅ POST - Save new source for a user


//---------------------

// ? Add URL

function generateId() {
  return Date.now() + '-' + Math.floor(Math.random() * 1000000);
}

// === API: Add URL ===

async function saveSources(sources) {
  try {
    await fsp.writeFile(SOURCES_FILE, JSON.stringify(sources, null, 2));
    io.emit("source_updated"); // optional real-time event
    if (typeof updateKnowledgeBase === "function") {
      await updateKnowledgeBase(); // optional hook
    }
  } catch (err) {
    console.error("❌ Error saving sources:", err.message);
  }
}

// === API: Upload PDF ===
app.post("/api/upload-pdf", upload.single("pdf"), async (req, res) => {
  const username = req.headers["x-username"];
  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text?.replace(/\s+/g, " ").trim() || "";

    const sources = getSources();
    if (!sources[username]) sources[username] = [];

    const newId = generateId();
    const target = {
      id: newId,
      data: [
        {
          type: "pdf",
          value: req.file.filename,
          text: extractedText,
        },
       
      ],
    };

    sources[username].push(target);

    await saveSources(sources);
    res.json({ message: "✅ PDF uploaded", id: newId });
  } catch (err) {
    console.error("❌ PDF upload error:", err.message);
    res.status(500).json({ error: "Failed to upload PDF" });
  }
});

// === API: Add URL ===
app.post("/api/add-url", async (req, res) => {
  const { url, id } = req.body;
  const username = req.headers["x-username"];

  if (!username) return res.status(400).json({ error: "Username required" });
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    const response = await axios.get(url);
    let rawText = sanitizeHtml(response.data, {
      allowedTags: [],
      allowedAttributes: {},
    });
    rawText = rawText.replace(/\s+/g, " ").trim();

    const sources = getSources();
    if (!sources[username]) sources[username] = [];

    let target;
    if (id) {
      // ✅ अगर id दी गई है तो उसी object को ढूंढो
      target = sources[username].find((obj) => obj.id === id);
    }

    // ✅ अगर id नहीं मिली → तो आखिरी वाले object में add कर दो
    if (!target && sources[username].length > 0) {
      target = sources[username][sources[username].length - 1];
    }

    if (!target) {
      // fallback → नया बनाना पड़े
      const newId = generateId();
      target = { id: newId, data: [] };
      sources[username].push(target);
    }

    target.data.push({
      type: "url",
      value: url,
      text: rawText || "Document",
    });

    await saveSources(sources);
    res.json({ message: "✅ URL added", id: target.id });
  } catch (err) {
    console.error("❌ URL add error:", err.message);
    res.status(500).json({ error: "Failed to fetch URL" });
  }
});



//------------------DELETE THE DATA ------------------------------
app.delete('/api/delete/:id', (req, res) => {
  const { id } = req.params;
  const username = req.headers['x-username'];
  if (!username) return res.status(400).json({ error: 'Username required' });

  let sources = getSources();
  if (!sources[username]) return res.status(404).json({ error: 'No data for this user' });

  sources[username] = sources[username].filter(item => String(item.id) !== String(id));

  saveSources(sources);
  res.json({ message: `✅ Item with ID ${id} deleted` });
});

//----------------UPDATE THE DATA---------------------------
//----------------UPDATE THE DATA---------------------------
app.put('/api/update/:id', upload.single('pdf'), async (req, res) => {
  const { id } = req.params;
  const username = req.headers['x-username'];
  if (!username) return res.status(400).json({ error: 'Username required' });

  let sources = getSources();
  if (!sources[username]) return res.status(404).json({ error: 'No data for this user' });

  const target = sources[username].find(item => String(item.id) === String(id));
  if (!target) return res.status(404).json({ error: 'Item not found' });

  try {
    // === Update PDF if uploaded ===
    if (req.file) {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);

      let pdfEntry = target.data.find(d => d.type === "pdf");
      if (pdfEntry) {
        pdfEntry.value = req.file.filename;
        pdfEntry.text = pdfData.text?.replace(/\s+/g, ' ').trim() || '';
      } else {
        target.data.push({
          type: "pdf",
          value: req.file.filename,
          text: pdfData.text?.replace(/\s+/g, ' ').trim() || ''
        });
      }
    }

    // === Update URL if given ===
    if (req.body.url) {
      const response = await axios.get(req.body.url);
      let rawText = sanitizeHtml(response.data, { allowedTags: [], allowedAttributes: {} });
      rawText = rawText.replace(/\s+/g, ' ').trim();

      let urlEntry = target.data.find(d => d.type === "url");
      if (urlEntry) {
        urlEntry.value = req.body.url;
        urlEntry.text = rawText || "Document";
      } else {
        target.data.push({
          type: "url",
          value: req.body.url,
          text: rawText || "Document"
        });
      }
    }

    await saveSources(sources);
    res.json({ message: `✅ Item updated successfully`, id });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ error: "Failed to update source" });
  }
});
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

// ===== Emoji Setup =====
const emojiResponses = {
  "😀": "happy",
  "😂": "funny",
  "😍": "love",
  "😎": "cool",
  "😢": "sad",
  "👍": "positive",
  "🙏": "grateful",
  "🎉": "celebration",
  "💖": "love",
  "😡": "angry",
  "😃": "happy",
  "😄": "happy",
  "😁": "happy",
  "😆": "funny",
  "😅": "relieved",
  "😇": "innocent",
  "😉": "playful",
  "😊": "happy",
  "😋": "playful",
  "😜": "playful",
  "🤩": "excited",
  "🥰": "love",
  "🤗": "friendly",
  "😏": "smug",
  "😔": "sad",
  "😪": "tired",
  "😷": "sick",
  "🤔": "thoughtful",
  "🤨": "skeptical",
  "😬": "awkward",
  "🤐": "secret",
  "😳": "embarrassed",
  "🥳": "celebration",
  "😤": "frustrated",
  "😠": "angry",
  "🤯": "shocked"
};

// fallback response for unknown emojis
const DEFAULT_EMOJI_RESPONSE = "emoji detected";

const emojis = Object.keys(emojiResponses);

// ===== Emoji detection =====
function extractEmojis(message) {
  const chars = Array.from(message);
  return chars.filter(c => emojis.includes(c));
}

// ===== AI Response =====
async function getAIResponse(message, userId = "default", isDetailed = false) {
  try {
    const cleanMessage = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });

    // Extract emojis
    const detectedEmojis = extractEmojis(cleanMessage);

    // ✅ Emoji-only message → predefined response
    if (detectedEmojis.length > 0 && cleanMessage.length === detectedEmojis.length) {
      const responses = detectedEmojis
        .map(e => emojiResponses[e] || DEFAULT_EMOJI_RESPONSE)
        .join(", ");
      return responses;
    }

    // Normal text (with or without emojis) → call AI
    const cacheKey = `${userId}:${cleanMessage}:${isDetailed}`;
    if (aiResponseCache.has(cacheKey)) return aiResponseCache.get(cacheKey);

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
  const message = req.method === "POST"
    ? req.body?.message || ""
    : req.query?.message || "";

  const adminName = req.query.adminName || "defaultAdmin";

  if (!message.trim()) {
    return res.status(400).json({ answer: "Please enter a question.", source: "System" });
  }

  const normalize = str => str.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const msg = normalize(message);
  const msgWords = msg.split(/\s+/); // ✅ define msgWords

  try {
    const botReplies = JSON.parse(fs.readFileSync("botReplies.json", "utf8"));
    const allFaqs = JSON.parse(fs.readFileSync("faqs.json", "utf8"));
    const faqs = allFaqs[adminName] || [];

    // ===== Safe sources handling =====
    let sources = [];
    if (typeof getSources === "function") {
      const result = getSources();
      if (Array.isArray(result)) {
        sources = result;
      } else {
        console.warn("getSources() did not return an array, using empty array.");
      }
    } else {
      console.warn("getSources function is not defined, using empty array.");
    }

    // 1️⃣ Strict match in PDFs/URLs
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
            source: src.url ? `🌐 URL: ${src.url}` : `📄 PDF: ${src.filename || "unknown"}`,
          });
        }
      }
    }

    // 2️⃣ Admin-specific FAQs
    for (const faq of faqs) {
      const q = normalize(faq.question);
      if (msg === q || msg.includes(q) || q.includes(msg)) {
        return res.json({ answer: faq.answer, source: "📌 FAQ" });
      }
    }

    // 3️⃣ Bot replies
    for (const entry of botReplies) {
      if (entry.keywords.some(k => msg.includes(normalize(k)))) {
        return res.json({ answer: entry.response, source: "🤖 Bot" });
      }
    }

    // 4️⃣ Loose match in PDFs/URLs
    for (const src of sources) {
      const text = (src.text || "").toLowerCase();
      if (text.includes(msg)) {
        return res.json({
          answer: "Your question matches content in a source. Please rephrase or be more specific.",
          source: src.url ? `🌐 URL: ${src.url}` : `📄 PDF: ${src.filename || "unknown"}`,
        });
      }
    }

    // 5️⃣ AI fallback
    const aiAnswer = await getAIResponse(message);
    return res.json({ answer: aiAnswer || "No response available", source: "🤖 AI" });

  } catch (err) {
    console.error("❌ Error in /api/ask-question:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});



// Load widget

app.get('/api/load-widget', async (req, res) => {
  const id = req.query.id;
    const adminName = req.query.adminName || 'defaultAdmin';
  const allWidgets = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  const data = allWidgets.find(w => w.widgetId === id);
  if (!data || !data.show) return res.end();  const [vPos, hPos] = data.position.split('-');
  const imageUrl = data.imageUrl || 'https://img.freepik.com/free-vector/young-man-with-glasses-illustration_1308-174706.jpg';
  const chatHeader = data.chatHeader || 'iosandweb';
  const welcome = data.welcome || 'Welcome! How can I assist you today?';
  const fontFamily = data.fontFamily || 'Arial';
  const fontSize = data.fontSize || '14px';
  const fontSizeOverview = data.fontSizeOverview || '16px';
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
          --chat-font-family: 'Poppins', sans-serif;
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
    font-size: 25px;
    font-weight: 600;
    color: white;
  font-family: 'Poppins', sans-serif;
  }

  .chat-card p {
    margin: 0 0 15px;
    font-size: 14px;
     font-weight: 400;
      font-family: 'Poppins', sans-serif;
    color:white;
  }

#start-chat-now-inside {
  width: 320px;
  margin-top: 5px;
  margin-left: -22px;
  padding: 25px 26px;
  border-radius:25px;
  background: #D8E6FB;
  border: 1px solid #D8E6FB;
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
    text-align: center;
    font-size: 13px;
    color: #FFFFFF;
    font-weight: 500;
}
   .powered a {
    text-decoration: none;
    color: #FFFFFF;
     }
   .powereds{
     font-size: 12px;
    text-align: center;
    color: #FFFFFF;
    margin-left: 8px;
    font-weight: 500;
     }
       .powereds a {
        text-decoration: none;
       color: #FFFFFF;
     }

     #chat-arrow{
     height: 26px;
    width: 26px;
    margin: 7px -14px;
     }
      \`;
      document.head.appendChild(styleVars);

      let botReplies = [];
let faqs = [];
let sources = [];
let askpdfqustions = [];
// Ask question function
// Ask question function
// Get query params from script src
function getQueryParam(name) {
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1]; // the last loaded script is this widget
  const urlParams = new URLSearchParams(currentScript.src.split('?')[1]);
  return urlParams.get(name);
}

const adminName = getQueryParam('adminName') || 'defaultAdmin';
const widgetId = getQueryParam('id') || 'unknown';
function askQuestion(message = "") {
    if (!message) {
      return Promise.resolve({ answer: "Please enter a question.", source: "System" });
    }
          // const adminName = req.query.adminName || 'defaultAdmin';
    // const adminName = localStorage.getItem('loggedInUsername') || 'defaultAdmin';
    return fetch(\`http://localhost:3000/api/ask-question?message=\${encodeURIComponent(message)}&adminName=\${encodeURIComponent(adminName)}\`)
      .then(res => res.json())
      .catch(err => {
        console.error("❌ Error in askQuestion:", err);
        return { answer: "Sorry, no response", source: "Error" };
      });
  }
// Load all required data (bot replies, faqs, sources)
// const adminName = localStorage.getItem('loggedInUsername') || 'defaultAdmin';
Promise.all([
  fetch('http://localhost:3000/api/bot-replies').then(res => res.json()),
  fetch(\`http://localhost:3000/api/faqs?adminName=\${encodeURIComponent(adminName)}\`).then(res => res.json()),
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
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400&display=swap";
document.head.appendChild(fontLink);
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
          <img src="https://cdn-icons-png.freepik.com/512/10486/10486534.png" style="height:22px; width:22px; cursor:pointer;" />
        </div>
   <div id="icon-close-chat">
          <img src="images/back.png" style="height:22px; width:22px; cursor:pointer;" />
        </div>  &nbsp; &nbsp;
  <img src='${imageUrl}' style="height:30px;width:30px;border-radius:50%;margin-right:13px;" />
  ${chatHeader}
<img id="reload-chat" 
     src="images/restart.png"  
     style="height:24px;width:24px;border-radius:50%;margin-left: 72px;cursor:pointer"/>
  <button id="close-btn" style="margin-left:auto;background:transparent;border:none;font-size:18px;cursor:pointer;color:white">X</button>
</div>

<div id="hrFormWrapper" style="dispaly:block;">
<div class="chat-card">
<img src="images/logo.png" alt="Logo" style="height:50px;width:150px;margin:8px 71px">
<div id="close-humanfrom">
    <img src="images/close.png" alt="Close Icon" />
  </div>
  <div style="height:5px"></div>
    <h2>Hi there &#9995;</h2>
  <p>Welcome to our website Ask us anything &#10024;</p>
  <form id="hr-form">
  <button type="button" id="start-chat-now-inside">
  <div class="chat-text">
    <strong>Continue to Chat with Us</strong>
    <div class="chat-note">We Typically Reply Within a few minutes.</div>
  </div>
  <span class="chat-arrow">
    <img src="images/start.png" alt="Close Icon"  id="chat-arrow"/>
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

<!-- Chat Messages -->
<div class='chat-messages' id='chat-msgs' style="display:none;"></div>
<!-- Chat Input -->
<div class='chat-input' id="chatInputWrapper" style="display:flex; align-items:center;">
  <input 
    type='text' 
    id='chat-input' 
    placeholder='Type a message...' 
    autocomplete="off"
    onkeydown="if(event.key==='Enter') sendChatMsg()" 
  />
  <img src="images/microphone.png" alt="Mic" 
       style="height:20px;width:20px;cursor:pointer;" id="micBtn">
  <img src="images/happy.png" alt="Emoji" 
       style="height:20px; width:20px; margin: 0 5px; cursor:pointer;" id="emojiBtn">
  <img 
    src="images/send.png" 
    alt="Send" 
    style="height:20px; width:20px; cursor:pointer;margin: 0 5px;" 
    onclick="sendChatMsg()"
  >
</div>

<!-- Emoji picker container -->
<div id="emojiPicker" style="display:none;"></div>




<div class="row mb-3" id="chat-controls">
  <div class="col-8 d-flex" style="align-items: center; gap: 20px;">
<u style="color:green; cursor: pointer; text-decoration: none;margin-left: 14px;" id="contact-human">Contact Human</u>&nbsp;
<u style="color: red; cursor: pointer; text-decoration: none; margin-left: 121px;" id="close-btn-end">End Chat</u>&nbsp;&nbsp;&nbsp;&nbsp;
    <p class="powereds" style="margin-left: auto;">
      &#169; Powered By - 
      <a href="https://iosandweb.net/" target="_blank" rel="noopener noreferrer">
        IosAndWeb Technologies - AI.Dev &#169;
      </a>
    </p>
  </div>
</div>



<!-- Confirmation Popup -->
<div id="chat-confirmation" style="display:none;position:absolute;top:30%;left:4%;width:82%;background:white;border-radius:10px;padding:20px;box-shadow:0 0 10px rgba(0,0,0,0.3);z-index:999;text-align:center">
  <p>Are you sure you want to end the chat?</p>
  <button id="confirm-end-chat" style="margin-right:10px;background:red;color:white;padding:10px 15px;border:none;border-radius:5px">End</button>
  <button id="cancel-end-chat" style="background:gray;color:white;padding:10px 18px;border:none;border-radius:5px">Continue</button>
</div>


<!-- Feedback Form -->
<div id="chat-feedback" style="display:none;padding:20px;">
   <form id="feedback-form">
    <div style="display:flex; justify-content:space-between; align-items:center;">
  <!-- Back button -->
  <img id="back-to-chat" 
  src="images/back.png" style="height:22px; width:22px; cursor:pointer;"  title="Back to Chat" />


  <!-- Close button -->
  <div id="icon-close-feedback">
    <img src="images/close.png" 
         style="height:18px; width:18px; cursor:pointer;" 
         title="Close Feedback" />
  </div>
</div>
    <center>
   <div class="feedback-form">
  <form>
    <div class="star-rating">
    <center></center>
  <input type="radio" id="star5" name="rating" value="5" />
  <label for="star5" class="star"></label>

  <input type="radio" id="star4" name="rating" value="4" />
  <label for="star4" class="star"></label>

  <input type="radio" id="star3" name="rating" value="3" />
  <label for="star3" class="star"></label>

  <input type="radio" id="star2" name="rating" value="2" />
  <label for="star2" class="star"></label>

  <input type="radio" id="star1" name="rating" value="1" />
  <label for="star1" class="star"></label>
 &nbsp; &nbsp;
  <span class="rate-text">Rate This Chat</span>
</div>
<br/>
    <input type="text" class="feedback-input" placeholder="Your name" name="name" id="feedbackename" required />
    <input type="email" class="feedback-input" placeholder="Your email" name="email" id="feedbackemail" required />
    <textarea class="feedback-textarea" name="feedback" placeholder="Your Feedback" required></textarea>
    <button type="submit" class="feedback-button">Submit</button>
  </form>
</div>
<br>
    \`;
function initEmojiPicker() {
  const emojiBtn = document.getElementById("emojiBtn");
  const emojiPicker = document.getElementById("emojiPicker");
  const chatInput = document.getElementById("chat-input");
  if (!emojiBtn || !emojiPicker || !chatInput) return;

const emojis = [
  "😀","😂","😍","😎","😢","👍","🙏","🎉","💖","😡",
  "😃","😄","😁","😆","😅","😇","😉","😊","😋","😜",
  "🤩","🥰","🤗","😏","😔","😪","😷","🤔","🤨","😬",
  "🤐","😳","🥳","😎","😤","😠","🤯"
];
  emojiPicker.innerHTML = "";

  emojis.forEach(e => {
    const span = document.createElement("span");
    span.textContent = e;
    span.style.cursor = "pointer";
    span.style.fontSize = "10px";
    span.style.margin = "1px";
    span.addEventListener("click", () => {
      chatInput.value += e;
      emojiPicker.style.display = "none";
      chatInput.focus();
    });
    emojiPicker.appendChild(span);
  });
  emojiBtn.addEventListener("click", () => {
    if (emojiPicker.style.display === "none" || emojiPicker.style.display === "") {
      emojiPicker.style.display = "flex";
      // Apply your CSS
      emojiPicker.style.flexWrap = "wrap";
      emojiPicker.style.background = "rgb(255, 255, 255)";
      emojiPicker.style.border = "1px solid rgb(204, 204, 204)";
      emojiPicker.style.padding = "5px";
      emojiPicker.style.maxHeight = "150px";
      emojiPicker.style.overflowY = "auto"; // optional
      emojiPicker.style.boxShadow = "rgba(0, 0, 0, 0.4) 0px 2px 8px";
      emojiPicker.style.position = "absolute";
      emojiPicker.style.zIndex = 1000;
      emojiPicker.style.width = "142px";
      emojiPicker.style.borderRadius = "10px"; // ✅ Rounded corners
      emojiPicker.style.margin = "243px 181px"; // your custom margin
    } else {
      emojiPicker.style.display = "none";
    }
  });
}


document.addEventListener("DOMContentLoaded", initEmojiPicker);
function initMic() {
  const micBtn = document.getElementById("micBtn");
  const chatInput = document.getElementById("chat-input");
  if (!micBtn || !chatInput) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return console.warn("SpeechRecognition not supported");

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    chatInput.value = event.results[0][0].transcript;
  };
  recognition.onerror = (evt) => console.error("Speech recognition error:", evt.error);

  micBtn.addEventListener("click", () => {
    try {
      recognition.start();
    } catch (err) {
      console.error("Mic error:", err);
    }
  });
}

document.addEventListener("DOMContentLoaded", initMic);



setTimeout(() => {
  const reloadIcon = document.getElementById("reload-chat");
  if (reloadIcon) {
    reloadIcon.addEventListener("click", () => {
      // ✅ नया userId बनाओ
      const newUserId = generateUUID();
      localStorage.setItem("custom_user_id", newUserId);

      // ✅ पुरानी chat साफ़ करो
      const chatMsgs = document.getElementById("chat-msgs");
      if (chatMsgs) chatMsgs.innerHTML = "";

      // ✅ welcomeShown reset करो
      localStorage.removeItem("welcomeShown");

      // ✅ Chat interface hide करो
      const chatInputDiv = document.querySelector(".chat-input");
      const chatControls = document.getElementById("chat-controls");
      const hrForm = document.getElementById("hrFormWrapper");

      if(chatInputDiv) chatInputDiv.style.display = "none";
      if(chatControls) chatControls.style.display = "none";
      if(hrForm) hrForm.style.display = "none";

      // ✅ Loader दिखाओ
      if(chatMsgs){
        chatMsgs.style.display = "block";
        chatMsgs.innerHTML = \`
          <div style="text-align:center; padding:20px; color:white;">
            <div class="loader" style="border:4px solid #f3f3f3; border-top:4px solid #007bff; border-radius:50%; width:50px; height:50px; margin: auto; animation: spin 1s linear infinite;"></div>
            <p>Starting new chat...</p>
          </div>
        \`;

        // Loader animation CSS
        const style = document.createElement("style");
        style.innerHTML = \`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        \`;
        document.head.appendChild(style);
      }

      // ✅ थोड़ी देर बाद (2 सेकंड) नया session UI दिखाओ
      setTimeout(() => {
        if(chatMsgs) chatMsgs.innerHTML = "";
        showChatInterface();
initEmojiPicker();
initMic();
      }, 2000);

      console.log("🔄 Chat reloaded with new session:", newUserId);
    });
  }
}, 2000);


    
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
    const closeBtnEnd = document.getElementById("close-btn-end");

  
  const endChatBtn = document.getElementById("end-chat");
  const contactHumanBtn = document.getElementById("contact-human");


  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("chat-confirmation").style.display = "block";
    });
  }

  if (closeBtnEnd) {
    closeBtnEnd.addEventListener("click", () => {
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
      console.error("Error submitting feedback:", err);
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
    const userId = localStorage.getItem("custom_user_id") || (crypto.randomUUID ? crypto.randomUUID() : generateUUID());
    localStorage.setItem("custom_user_id", userId);
    // Show typing animation
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-msg bot-human typing";
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

      // Remove typing animation
      typingDiv.remove();

      // Show human/bot response
      const humanMsg = document.createElement("div");
      humanMsg.className = "chat-msg bot-msg";
      humanMsg.innerHTML = \`
        <img src="images/bot.png" alt="Bot" class="chat-avatar" />
        <div class="chat-bubble">
          <p>\${result.message || "A human assistant has been notified."}</p>
        </div>
      \`;
      chatMsgs.appendChild(humanMsg);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;

    } catch (error) {
      console.error("Failed to request human:", error);

      typingDiv.remove();
      const errorMsg = document.createElement("div");
      errorMsg.className = "chat-msg bot-human";
      errorMsg.innerHTML = \`
        <img src="images/bot.png" alt="Bot" class="chat-avatar" />
        <div class="chat-bubble">
          <p>❌ Failed to request human. Please try again.</p>
        </div>
      \`;
      chatMsgs.appendChild(errorMsg);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }
  });
}

}, 1000);

// Icon click logic
// === Close feedback box ===
setTimeout(() => {
  const chatFeedback = document.getElementById("chat-feedback");
  const chatBox = document.querySelector(".chat-box"); // main chat window
  const backToChat = document.getElementById("back-to-chat");
  const iconCloseChat = document.getElementById("icon-close-feedback");

  // === Back button → hide feedback & show chat again ===
  if (backToChat && chatBox && chatFeedback) {
    backToChat.onclick = function () {
      chatFeedback.style.display = "none";   // hide feedback
      chatBox.style.display = "flex";        // ✅ flex, not block
      
      // ✅ also restore chat UI elements
     const chatMsgs = document.getElementById("chat-msgs");
  const chatInputDiv = document.querySelector(".chat-input");
  const chatControls = document.getElementById("chat-controls");
  const chatHeader = document.querySelector(".chat-header");

  if (chatMsgs) chatMsgs.style.display = "block";
  if (chatInputDiv) chatInputDiv.style.display = "flex";
  if (chatControls) chatControls.style.display = "block";
  if (chatHeader) chatHeader.style.display = "flex";
    };
  }

  // === Close button → hide whole chat box ===
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
initEmojiPicker();
initMic();
  }
}, 100);

// === Restore on browser navigation ===
window.addEventListener("popstate", () => {
  const chatBox = document.querySelector(".chat-box");
  const uid = localStorage.getItem("custom_user_id");
  if (uid && chatBox) {
    chatBox.style.display = "flex";
    showChatInterface();
initEmojiPicker();
initMic();
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
initEmojiPicker();
initMic();
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
initEmojiPicker();
initMic();
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
             initEmojiPicker();
             initMic();
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
initEmojiPicker();
initMic();
    });
  }
}, 500);

// === Show Chat Interface ===
function formatDateTime(timestamp) {
  const date = new Date(timestamp);

  // Options for full date and time with month name
  const options = {
    year: "numeric",
    month: "long",   // full month name (e.g. August)
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };

  return date.toLocaleString("en-IN", options);
}
function showChatInterface() {
  const hrForm = document.getElementById("hrFormWrapper") || document.getElementById("hr-form");
  const chatMsgs = document.getElementById("chat-msgs");
  const chatInput = document.querySelector(".chat-input");
  const chatControls = document.getElementById("chat-controls");
  const chatHeader = document.getElementById("chat-headers");
  const chatFeedback = document.getElementById("chat-feedback");
  const headersfrom = document.getElementById("headers-from");
    const emojiPicker = document.getElementById("emojiPicker");


  // Show chat interface, hide form
  if (hrForm) hrForm.style.display = "none";
  if (chatMsgs) chatMsgs.style.display = "flex";
  if (chatInput) chatInput.style.display = "flex";
  if (chatControls) chatControls.style.display = "flex";
  if (chatHeader) chatHeader.style.display = "flex";
  if (chatFeedback) chatFeedback.style.display = "none";
  if (headersfrom) headersfrom.style.display = "none";
 
  if (emojiPicker) {
    emojiPicker.style.display = "none"; // Start hidden
  }


  // Ensure full-height for desktop
  if(chatMsgs) {
    chatMsgs.style.flexDirection = "column";
    chatMsgs.style.overflowY = "auto";
    chatMsgs.style.height = "calc(100vh - 150px)"; // Adjust depending on header/footer height
    chatMsgs.style.gap = "10px";
    chatMsgs.style.padding = "10px";
  }

  // Generate userId if missing
  if (!userId) {
    userId = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : generateUUID();
    localStorage.setItem("custom_user_id", userId);
  }

  // Register socket connection if exists
  if (typeof socket !== "undefined") {
    if (socket.connected) {
      socket.emit("register", userId, true);
    } else {
      socket.on("connect", () => {
        socket.emit("register", userId, true);
      });
    }
  }


  
  if (!localStorage.getItem("welcomeShown")) {
    const timestamp = new Date();
  const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // Bot message at top
    const welcomeMsg = document.createElement("div");
    welcomeMsg.className = "chat-msg bot-msg";

   welcomeMsg.innerHTML = \`
    <div class="chat-time">Today \${formattedTime}</div>
  <div class="chat-timedemo">\${formattedTime}</div>
      <div class="chat-row">
      <img src="images/bot.png" alt="Bot" class="chat-avatar" />
      <div class="chat-bubble">
        <p>${welcome}</p>
        <div class="time-ago"></div>
      </div>
    </div>
    \`;
    chatMsgs.appendChild(welcomeMsg);

    

    // Options container pinned at bottom
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "chat-options";
    optionsContainer.style.marginTop = "auto"; // Push to bottom
    optionsContainer.innerHTML = \`
      <label><input type="radio" name="chatOption" value="Digital Marketing" /> Digital Marketing</label>
      <label><input type="radio" name="chatOption" value="Software Development" /> Software Development</label>
      <label><input type="radio" name="chatOption" value="Web Development" /> Web Development</label>
      <label><input type="radio" name="chatOption" value="Mobile App Development" /> Mobile App Development</label>
      <label><input type="radio" name="chatOption" value="Blockchain Development" /> Blockchain Development</label>
      <label><input type="radio" name="chatOption" value="Web & Graphic Design" /> Web & Graphic Design</label>
      <label><input type="radio" name="chatOption" value="Website Traffic" /> Website Traffic</label>
      <label><input type="radio" name="chatOption" value="Blog & Content Strategy" /> Blog & Content Strategy</label>
    \`;
    chatMsgs.appendChild(optionsContainer);

    // Set timestamps
    welcomeMsg.querySelector(".time-ago").innerText = timeAgo(timestamp);
   // welcomeMsg.querySelector(".date-time").innerText = formatDateTime(timestamp);

    setInterval(() => {
      welcomeMsg.querySelector(".time-ago").innerText = timeAgo(timestamp);

    }, 100);

    const replies = {
      "Digital Marketing": "We provide SEO, Google Ads, and social media campaigns to boost your online presence.",
      "Software Development": "We build custom software solutions tailored to your business needs.",
      "Web Development": "We create responsive, fast, and scalable websites.",
      "Mobile App Development": "We develop Android and iOS mobile applications with the latest technologies.",
      "Blockchain Development": "We specialize in blockchain solutions, crypto apps, and smart contracts.",
      "Web & Graphic Design": "Our design team crafts creative logos, UI/UX, and brand visuals.",
      "Website Traffic": "We help you grow your website traffic with proven marketing strategies.",
      "Blog & Content Strategy": "We provide high-quality blog writing and content marketing services."
    };

    // Event listeners for options
    optionsContainer.querySelectorAll("input[name='chatOption']").forEach((radio) => {
      radio.addEventListener("change", () => {
        const selected = radio.value;
         const timestamp = new Date();

        const userMsg = document.createElement("div");
        userMsg.className = "chat-msg user-msg";
        userMsg.innerHTML = \`<div class="chat-bubble">\${selected} <div class="time-ago"></div> </div>\`;
        chatMsgs.appendChild(userMsg);

          // Set timestamps
    userMsg.querySelector(".time-ago").innerText = timeAgo(timestamp);
   // welcomeMsg.querySelector(".date-time").innerText = formatDateTime(timestamp);

    setInterval(() => {
      userMsg.querySelector(".time-ago").innerText = timeAgo(timestamp);

    }, 100);
        const botReply = document.createElement("div");
        botReply.className = "chat-msg bot-msg";
        botReply.innerHTML = \`
          <img src="images/bot.png" alt="Bot" class="chat-avatar" />
          <div class="chat-bubble">
            <p>\${replies[selected]}</p>
            <div class="time-ago"></div>
          </div>
        \`;
        chatMsgs.appendChild(botReply);
   // Set timestamps
    botReply.querySelector(".time-ago").innerText = timeAgo(timestamp);
   // welcomeMsg.querySelector(".date-time").innerText = formatDateTime(timestamp);

    setInterval(() => {
      botReply.querySelector(".time-ago").innerText = timeAgo(timestamp);

    }, 100);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
      });
    });
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

  // Get currently logged-in admin name (set this during login)
  // const adminName = localStorage.getItem("loggedInAdmin");

  // User message container
const userDiv = document.createElement("div");
userDiv.className = "chat-msg user-msg";

// Create chat bubble wrapper
const userMsgDiv = document.createElement("div");
userMsgDiv.className = "chat-bubble";

// Message text
const msgP = document.createElement("p");
msgP.textContent = msg;

// Time-ago div
const userTimeAgoDiv = document.createElement("div");
userTimeAgoDiv.className = "time-ago";
userTimeAgoDiv.innerText = timeAgo(userTimestamp);

// Append message + time inside bubble
userMsgDiv.appendChild(msgP);
userMsgDiv.appendChild(userTimeAgoDiv);

// Append bubble inside userDiv
userDiv.appendChild(userMsgDiv);

// Optional avatar (if needed)
// const userAvatar = document.createElement("img");
// userAvatar.src = "images/bot.png";
// userAvatar.alt = "You";
// userAvatar.className = "chat-avatar";
// userDiv.appendChild(userAvatar);


const userAvatar = document.createElement("div");
userAvatar.className = "chat-avatar";
userAvatar.textContent = \`${adminName}\`.charAt(0).toUpperCase();
userDiv.appendChild(userAvatar);
chatMsgs.appendChild(userDiv);



chatMsgs.scrollTop = chatMsgs.scrollHeight;

  setInterval(() => {
    userTimeAgoDiv.innerText = timeAgo(userTimestamp);
  }, 10000);

  input.value = "";

  // Save user message to backend
  fetch('http://localhost:3000/api/save-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
    adminName:"${adminName}",
      userId,
      sender: "user",
      message: msg,
      timestamp: userTimestamp
    })
  }).catch(err => console.error("❌ Failed to save user message:", err));

  // Typing indicator container
const typingDiv = document.createElement("div");
typingDiv.className = "chat-msg bot-msg typing";

// Create chat bubble wrapper
const typingBubble = document.createElement("div");
typingBubble.className = "chat-bubble";

// Typing dots
const typingDotsDiv = document.createElement("div");
typingDotsDiv.className = "typing-dots";
typingDotsDiv.innerHTML = 'Typing...';

// Time-ago div
const typingTimeDiv = document.createElement("div");
typingTimeDiv.className = "time-ago";
const typingTimestamp = new Date();
typingTimeDiv.innerText = timeAgo(typingTimestamp);

// Put dots + time inside bubble
typingBubble.appendChild(typingDotsDiv);
typingBubble.appendChild(typingTimeDiv);

// Append bubble inside typing container
typingDiv.appendChild(typingBubble);

// Add to chat window
chatMsgs.appendChild(typingDiv);
chatMsgs.scrollTop = chatMsgs.scrollHeight;

// Keep updating "time ago"
setInterval(() => {
  typingTimeDiv.innerText = timeAgo(typingTimestamp);
}, 10000);


  // Ask bot and replace typing dots with reply
  askQuestion(msg)
    .then(response => {
      const reply = response.answer || getBotResponse(msg);
      const botTimestamp = new Date();

      // Clear typing dots
    typingDiv.innerHTML = "";
    typingDiv.classList.remove("typing");

    // === Bot avatar (optional) ===
    const botAvatar = document.createElement("img");
    botAvatar.src = "images/bot.png";
    botAvatar.alt = "Bot";
    botAvatar.className = "chat-avatar";

    // === Chat bubble wrapper ===
    const botBubble = document.createElement("div");
    botBubble.className = "chat-bubble";

    // Bot message text
    const botMsgDiv = document.createElement("div");
    botMsgDiv.className = "bot-text";
    botMsgDiv.textContent = reply;

    // Time ago
    const botTimeAgoDiv = document.createElement("div");
    botTimeAgoDiv.className = "time-ago";
    botTimeAgoDiv.innerText = timeAgo(botTimestamp);

    // Append message + time to bubble
    botBubble.appendChild(botMsgDiv);
    botBubble.appendChild(botTimeAgoDiv);

    // Append avatar + bubble inside typingDiv
    typingDiv.appendChild(botAvatar);
    typingDiv.appendChild(botBubble);

    // Scroll to bottom
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

      setInterval(() => {
        botTimeAgoDiv.innerText = timeAgo(botTimestamp);
      }, 10000);

      // Save bot reply to backend
      return fetch('http://localhost:3000/api/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        adminName:"${adminName}",
          userId,
          sender: "bot",
          message: reply,
          timestamp: botTimestamp
        })
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







socket.on('admin-message', (data) => {
  console.log("✅ Admin payload:", data);

  const chatMsgs = document.getElementById("chat-msgs");
  if (!chatMsgs) {
    console.error("❌ chat-msgs element not found!");
    return;
  }

  // Extract data directly
  const msgText = data.message ?? "[No message]";
  const timestamp = data.timestamp ?? "";

  // typing placeholder
  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-msg admin-msg typing";
  typingDiv.innerHTML = \`
    <img src="images/profile.png" alt="Bot" class="chat-avatar" />
    <div class="chat-bubble">
      <span class="typing-dots">...</span>
    </div>
  \`;
  chatMsgs.appendChild(typingDiv);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;

  // Replace typing dots with actual message after 2 seconds
  setTimeout(() => {
    typingDiv.innerHTML = \`
      <img src="images/profile.png" alt="Bot" class="chat-avatar" />
      <div class="chat-bubble">
        \${msgText}
        \${timestamp ? \`<div class="chat-timestamp">\${timestamp}</div>\` : ""}
      </div>
    \`;
    typingDiv.classList.remove("typing");
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }, 2000);
});



// Inject and execute the code
// const script = document.createElement("script");
// script.innerHTML = code;
// document.body.appendChild(script);




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
    text: `User has requested human assistance.\n\nAccess the admin dashboard: http://localhost:3000admin`,
    html: `<p>User has requested human assistance.</p><p><a href="http://localhost:3000admin">Access the admin dashboard</a></p>`,
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
        text: `A new user (${data.userId}) has joined the chat.\n\nAccess the admin dashboard:  http://localhost:3000admin`,
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






// app.get('/api/chat-history/:userId', (req, res) => {
//   const chatData = readChatFile(); // Function that reads chat.json
//   const messages = chatData[req.params.userId] || [];
//   res.json(messages);
// });


app.post('/api/save-message', (req, res) => {
  const { adminName, userId, sender, message, timestamp } = req.body;

  if (!adminName || !userId || !sender || !message || !timestamp) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const chatPath = path.join(__dirname, 'chat.json');
  let chatData = {};

  if (fs.existsSync(chatPath)) {
    chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
  }

  // Ensure adminName exists
  if (!chatData[adminName]) {
    chatData[adminName] = {};
  }

  // Ensure userId exists under adminName
  if (!chatData[adminName][userId]) {
    chatData[adminName][userId] = [];
  }

  // Push new message
  chatData[adminName][userId].push({ sender, message, timestamp });

  fs.writeFileSync(chatPath, JSON.stringify(chatData, null, 2));
  res.json({ success: true });
});





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

// app.get('/api/get-all-user-ids', (req, res) => {
//   const chatPath = path.join(__dirname, 'chat.json');
//   if (!fs.existsSync(chatPath)) return res.json([]);

//   const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
//   res.json(Object.keys(chatData));
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

// Get all user IDs for a specific admin
app.get('/api/get-all-user-ids', (req, res) => {
  const { adminName } = req.query;
  if (!adminName) {
    return res.status(400).json({ error: 'Missing adminName' });
  }

  const chatPath = path.join(__dirname, 'chat.json');
  if (!fs.existsSync(chatPath)) {
    return res.json([]);
  }

  const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
  const userIds = chatData[adminName] ? Object.keys(chatData[adminName]) : [];
  res.json(userIds);
});

// Get messages for a specific admin + user
app.get('/api/get-messages', (req, res) => {
  const { adminName, userId } = req.query;
  if (!adminName || !userId) {
    return res.status(400).json({ error: 'Missing adminName or userId' });
  }
  const chatPath = path.join(__dirname, 'chat.json');
  if (!fs.existsSync(chatPath)) {
    return res.json({ messages: [] });
  }
  const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
  const messages =
    chatData[adminName] && chatData[adminName][userId]
      ? chatData[adminName][userId]
      : [];
  res.json({ messages });
});










app.get('/api/all/chat-admin data', (req, res) => {
  const { adminName } = req.query;

  if (!adminName) {
    return res.status(400).json({ error: 'Missing adminName' });
  }

  const chatPath = path.join(__dirname, 'chat.json');

  if (!fs.existsSync(chatPath)) {
    return res.json({ chats: {} });
  }

  const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));

  let filteredChats;

  if (adminName === 'admin') {
    // Super Admin sees all chats
    filteredChats = chatData;
  } else {
    // Normal admin sees only their assigned chats
    filteredChats = Object.fromEntries(
      Object.entries(chatData).filter(([_, messages]) =>
        messages.some(msg => msg.adminName === adminName)
      )
    );
  }

  res.json({ chats: filteredChats });
});



// ? AI POST Endpoint (kept outside the above route!)
// Load FAQs from JSON
async function loadFAQs() {
  try {
    const data = await fs.promises.readFile(FAQ_FILE, 'utf8');
    return data.trim() ? JSON.parse(data) : {}; // object, not array
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.promises.writeFile(FAQ_FILE, '{}'); // create empty object
      return {};
    }
    console.error('Error reading FAQ file:', err.message);
    return {};
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

async function loadFAQs() {
  try {
    const data = await fs.promises.readFile(FAQ_FILE, 'utf8');
    console.log("File contents:", data);
    return data.trim() ? JSON.parse(data) : {}; // Always object
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.promises.writeFile(FAQ_FILE, '{}'); // Empty object
      return {};
    }
    console.error('Error reading FAQ file:', err.message);
    return {};
  }
}



async function saveFAQs(data) {
  try {
    await fs.promises.writeFile(FAQ_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('FAQs saved to file.');
  } catch (err) {
    console.error('Error saving FAQs:', err.message);
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
// ✅ Update Knowledge Base

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


// app.post('/add-faq', async (req, res) => {
//   const {adminName, id, question, answer } = req.body;

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

//-----------------ADD THE FQA ADD POST DATA............................

// ➡️ Add / Update FAQ
app.post('/add-faq', async (req, res) => {
  try {
    const { adminName, id, question, answer } = req.body;

    // ✅ Validate required fields
    if (!adminName || !question || !answer) {
      return res.status(400).json({
        status: "error",
        message: "Admin name, question, and answer are required"
      });
    }

    let allFaqs = await loadFAQs(); // returns object { adminName: [ ... ] }
    if (!allFaqs[adminName]) {
      allFaqs[adminName] = [];
    }

    // ✅ Use provided ID if present, else generate new
    const realId = id && id.trim() !== "" ? id : uuidv4();

    // ✅ Check if FAQ already exists (update case)
    const index = allFaqs[adminName].findIndex(f => f.id === realId);

    if (index !== -1) {
      // Update existing FAQ
      allFaqs[adminName][index] = { id: realId, question, answer };
    } else {
      // Add new FAQ
      allFaqs[adminName].push({ id: realId, question, answer });
    }

    // Save updated FAQs
    await saveFAQs(allFaqs);

    // Update knowledge base (rebuild combined data)
    await updateKnowledgeBase();

    // Notify all connected clients
    io.emit("faq_updated");
    return res.json({
      status: "success",
      message: index !== -1 ? "FAQ updated successfully" : "FAQ added successfully"
    });

  } catch (error) {
    console.error("Error in /add-faq:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.get('/faq-sources', async (req, res) => {
  const sources = await loadSources();
  res.json(sources);
});


// ✅ FIXED updateKnowledgeBase
async function updateKnowledgeBase() {
  const faqsObj = await loadFAQs();   // returns object { adminName: [ ... ] }
  let sources = await loadSources();  // should be an array of { text }

  // Ensure sources is always an array
  if (!Array.isArray(sources)) {
    sources = [];
  }

  // Flatten all FAQs across admins
  const allFaqs = Object.values(faqsObj).flat();

  // Convert FAQs to text
  const faqText = allFaqs
    .map(faq => `Q: ${faq.question}\nA: ${faq.answer}`)
    .join("\n\n");

  // Sources to text
  const sourceText = sources
    .map(s => s.text)
    .join("\n\n");

  // Merge FAQ + Sources
  const combined = [faqText, sourceText].filter(Boolean).join("\n\n");

  // Save knowledge base
  await saveKnowledgeBase({ text: combined });
}






app.post('/delete-faq', async (req, res) => {
  const { id } = req.body;
  let faqs = await loadFAQs();

  // 🔍 sirf admin ke faqs check karo
  const index = faqs.admin.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ status: "error", message: "FAQ not found in admin" });
  }
  // ❌ remove entry
  faqs.admin.splice(index, 1);

  // ✅ save updated JSON
  await saveFAQs(faqs);
  await updateKnowledgeBase();

  // socket broadcast
  io.emit("faq_deleted", { id });

  res.json({ status: "success", message: "FAQ deleted from admin" });
});

// ----------------------EMAIL NOTIFICATIONS -----------------------------------------
// Load config

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
  console.log(`Server running at http://localhost:${PORT}`);
});







