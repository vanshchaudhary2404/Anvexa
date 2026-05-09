const express = require('express');
const router = express.Router();
const { registerUser , loginUser , User } = require('../controllers/authController');

router.post("/register" , registerUser);
router.post("/login" , loginUser);
router.post("/user" , User);
