const transporter = require('../config/nodemailer'); // or wherever your transporter is defined
const loadConfig = require('../config/loadConfig');   // adjust path if needed

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
        text: `User ${data.userId} has requested human assistance.\n\nAccess the admin dashboard: http://45.77.187.108:3000/admin.html`,
        html: `<p>User <strong>${data.userId}</strong> has requested human assistance.</p><p><a href="http://45.77.187.108:3000/admin.html">Access the admin dashboard</a></p>`,
      };
      break;
    case 'new_user':
      mailOptions = {
        from: process.env.SMTP_USER,
        to: adminEmail,
        subject: `New User Joined Chat: ${data.userId}`,
        text: `A new user (${data.userId}) has joined the chat.\n\nAccess the admin dashboard: http://45.77.187.108:3000/admin.html`,
        html: `<p>A new user <strong>${data.userId}</strong> has joined the chat.</p><p><a href="http://45.77.187.108:3000/admin.html">Access the admin dashboard</a></p>`,
      };
      break;
    case 'chat_ended':
      const formattedHistory = data.messages.map(msg => `[${msg.timestamp}] ${msg.sender}: ${msg.message}`).join('\n');
      mailOptions = {
        from: process.env.SMTP_USER,
        to: adminEmail,
        subject: `Chat History for User ${data.userId}`,
        text: `Chat session ended for user ${data.userId}.\n\nChat History:\n${formattedHistory}\n\nAccess the admin dashboard: http://45.77.187.108:3000/admin.html`,
        html: `<p>Chat session ended for user <strong>${data.userId}</strong>.</p><h3>Chat History</h3><pre>${formattedHistory}</pre><p><a href="http://45.77.187.108:3000/admin.html">Access the admin dashboard</a></p>`,
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

module.exports = { sendEmailNotification };
