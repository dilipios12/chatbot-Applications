const mongoose = require('mongoose');
const User = require("../Modal/Login");

const UserRegister = async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existingUser = User.find(user => user.email === email);
  if (existingUser) {
    return res.send('User already exists with this email. <a href="/register">Try again</a>');
  }

  const widgetId = Math.random().toString(36).substr(2, 12); // Unique ID
  User.push({ name, email, phone, password, widgetId });

  req.session.loggedIn = true;
  req.session.user = { email, widgetId };

  res.redirect('/dashboard');
};




const UserLogin= async (req, res) => {
  const { email, password } = req.body;

  const user = User.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.send('Invalid credentials. <a href="/">Try again</a>');
  }

  req.session.loggedIn = true;
  req.session.user = { email, widgetId: user.widgetId };
  res.redirect('/dashboard');
};

module.exports={
    UserRegister,
    UserLogin
}