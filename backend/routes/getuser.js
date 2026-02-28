const express = require(`express`);
const jwt = require(`jsonwebtoken`);
const bcrypt = require(`bcrypt`);
const Landlord = require(`../models/Landlord`);
const Tenant = require(`../models/Tenant`);
const checkUser = require("../middlewares/checkuser"); // Middleware to authenticate and attach user to the request

const router = express.Router();
require(`dotenv`).config(`../.env`); // Load environment variables

const SECRET_KEY = process.env.SECRET_KEY; // Secret key for JWT

// Route to fetch the authenticated user's details
// Requires a valid token in the request header
router.post('/user', checkUser, async (req, res) => {
    try {
        const user = req.user; // Extract user details from the request (set by middleware)
        res.json({ user, success: true }); // Respond with user details and success status
    } catch (err) {
        // Handle unexpected errors
        res.json({ success: false });
    }
});

module.exports = router;