const express = require("express");
const Router = express.Router();

const {
     UserRegister,
     UserLogin
}= require("../Controller/User");



Router.route("/register").post(UserRegister);
Router.route("/login").get(UserLogin);