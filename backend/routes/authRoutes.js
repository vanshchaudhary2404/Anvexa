const express = require('express');
const router = express.Router();
const { registerUser , loginUser , getUsers } = require('../controllers/authController');

router.post("/register" , registerUser);
router.post("/login" , loginUser);
router.get("/users" , protect , admin ,  getUsers); //protect -> check if user is authenticated , admin -> check if user is admin

module.exports = router;
