const express = require(`express`);
const jwt = require("jsonwebtoken"); // JWT for token authentication
const bcrypt = require(`bcrypt`);
const Tenant = require("../models/Tenant");
const Landlord = require(`../models/Landlord`);
const Property = require(`../models/Property`);
const mongoose = require(`mongoose`);
const router = express.Router();
const SaveImage = require(`../helper_funcs/Saveimage`);
require(`dotenv`).config(`../.env`); // Load environment variables
const authMiddleware = require("../middlewares/checkuser"); // Middleware for JWT authentication

const SECRET_KEY = process.env.SECRET_KEY;

/* Contains routes for viewing self profile and other users' profiles */

// Route to fetch the authenticated user's profile
// Requires `authtoken` and `accounttype` in the header
router.post(`/Self_profile`, authMiddleware, async (req, res) => {
    try {
        let userid = req.user.id;
        let accountType = req.header(`accounttype`);
        let user;

        if (accountType === `tenant`) {
            // Fetch tenant details
            user = await Tenant.findById(userid);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Account not found"
                });
            }

            return res.status(200).json({
                success: true,
                id: user._id,
                name: user.name,
                email: user.email,
                locality: user.locality,
                gender: user.gender,
                pets: user.pets,
                smoke: user.smoke,
                veg: user.veg,
                flatmates: user.flatmate,
                reviews: user.reviews,
                Images: user.Images
            });
        } else if (accountType === `landlord`) {
            // Fetch landlord details
            user = await Landlord.findById(userid);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Account not found"
                });
            }

            // Fetch properties owned by the landlord
            let propertyData = [];
            for (let propid of user.propertyList) {
                let prop = await Property.findById(propid);
                if (prop) {
                    propertyData.push(prop);
                }
            }

            return res.status(200).json({
                success: true,
                name: user.name,
                email: user.email,
                message: `You own ${propertyData.length} properties.`,
                Properties: propertyData,
                reviews: user.reviews,
                Images: user.Images,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Account Type."
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "Some error occurred in the backend"
        });
    }
});

// Route to fetch another user's profile
// Requires `requested_id` and `accounttype` in the request body
router.post(`/other_users`, async (req, res) => {
    try {
        let { requested_id, accounttype } = req.body;
        let user;

        // Validate the requested ID
        if (!mongoose.Types.ObjectId.isValid(requested_id)) {
            return res.status(400).json({ error: `${requested_id} is an invalid ID` });
        }

        if (accounttype === `tenant`) {
            // Fetch tenant details
            user = await Tenant.findById(requested_id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "No such user exists."
                });
            }

            return res.status(200).json({
                success: true,
                id: user._id,
                name: user.name,
                city: user.city,
                locality: user.locality,
                gender: user.gender,
                pets: user.pets,
                smoke: user.smoke,
                veg: user.veg,
                flatmates: user.flatmate,
                reviews: user.reviews,
                Images: user.Images,
                description: user.description
            });
        } else if (accounttype === `landlord`) {
            // Fetch landlord details
            user = await Landlord.findById(requested_id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Account not found"
                });
            }

            // Fetch properties owned by the landlord
            let propertyData = [];
            for (let propid of user.propertyList) {
                let prop = await Property.findById(propid);
                if (prop) {
                    propertyData.push(prop);
                }
            }

            return res.status(200).json({
                success: true,
                name: user.name,
                email: user.email,
                message: `This user owns ${propertyData.length} properties.`,
                Properties: propertyData,
                reviews: user.reviews,
                Images: user.Images
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid account type. Please try again."
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "Some error occurred in the server. Please try again."
        });
    }
});

// Route to fetch user details by ID
// Requires `id` in the request body
router.post('/user', async (req, res) => {
    try {
        let { id } = req.body;

        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: `${id} is an invalid ID` });
        }

        // Fetch tenant details
        let user = await Tenant.findById(id);
        if (user) {
            return res.status(200).json({
                success: true,
                id: user._id,
                name: user.name,
                email: user.email,
                locality: user.locality,
                profilepic: user.Images,
                type: 'tenant'
            });
        }

        // Fetch landlord details
        user = await Landlord.findById(id);
        if (user) {
            return res.status(200).json({
                success: true,
                name: user.name,
                email: user.email,
                profilepic: user.Images,
                type: 'landlord'
            });
        }

        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Some error occurred in the server. Please try again."
        });
    }
});

module.exports = router;