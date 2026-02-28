const express = require(`express`);
const jwt = require("jsonwebtoken"); // JWT for token authentication
const bcrypt = require(`bcrypt`);
const Tenant = require("../models/Tenant");
const { Landlord_OTP, Tenant_OTP } = require("../models/OTP_models");
const router = express.Router();
require(`dotenv`).config(`../.env`); // Load environment variables
const Sendmail = require("../helper_funcs/mailSender");

const SECRET_KEY = process.env.SECRET_KEY; // Secret key for JWT

// Utility function to hash passwords securely
async function Hashpassword(plainPassword) {
    const saltRounds = 10; // Number of salt rounds for bcrypt
    return await bcrypt.hash(plainPassword, saltRounds);
}

// Utility function to compare entered password with stored hash
async function ComparePassword(enteredPassword, storedHash) {
    return await bcrypt.compare(enteredPassword, storedHash);
}

// --------------------- Tenant Registration ---------------------
// Route to register a new tenant
// Requires `name`, `email`, `password`, `locality`, `city`, `gender`, `smoke`, `veg`, `pets`, and `flatmate` in the request body
router.post(`/Tenant_register`, async (req, res) => {
    try {
        const { name, email, password, locality, city, gender, smoke, veg, pets, flatmate } = req.body;

        // Check if a tenant with the given email already exists
        const checkExistingUser = await Tenant.findOne({ email });
        if (checkExistingUser) {
            return res.status(400).json({
                success: false,
                message: "A user already exists with the given credentials",
                status: 400
            });
        }

        // Check if a pending OTP entry exists for the given email
        const checkExistingUser_withOTP = await Tenant_OTP.findOne({ email });
        if (checkExistingUser_withOTP) {
            let new_OTP = (Math.floor(100000 + Math.random() * 900000)).toString();
            await Sendmail(email, `Welcome once again to Roomble`, new_OTP);

            // Delete the existing OTP entry and create a new one
            await Tenant_OTP.deleteOne({ email });
            let hashedPassword = await Hashpassword(password);
            const newlyCreatedUser = new Tenant_OTP({
                name,
                email,
                password: hashedPassword,
                OTP: new_OTP,
                locality,
                city,
                gender,
                smoke,
                veg,
                pets,
                flatmate
            });

            await newlyCreatedUser.save();

            return res.json({ message: `${newlyCreatedUser._id}`, success: true });
        }

        // Create a new OTP entry for the tenant
        let hashedPassword = await Hashpassword(password);
        let generated_OTP = (Math.floor(100000 + Math.random() * 900000)).toString();

        const newlyCreatedUser = new Tenant_OTP({
            name,
            email,
            password: hashedPassword,
            OTP: generated_OTP,
            locality,
            city,
            smoke,
            pets,
            veg,
            gender,
            flatmate,
        });

        await newlyCreatedUser.save();

        if (newlyCreatedUser) {
            await Sendmail(email, `Welcome to Roomble!!`, `Your OTP is ${generated_OTP}`);
            res.status(200).json({
                success: true,
                message: `${newlyCreatedUser._id}`
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Unable to register user! Please try again."
            });
        }
    } catch (e) {
        console.error(`Error occurred`, e);
        res.status(500).json({
            message: "Some error in server",
            success: false
        });
    }
});

// --------------------- OTP Verification & Tenant Creation ---------------------
// Route to verify OTP and create a tenant account
// Requires `Entered_OTP` in the request body and `id` as a URL parameter
router.post(`/verifyTenant/:id`, async (req, res) => {
    try {
        const { Entered_OTP } = req.body;
        const userId = req.params.id;

        if (!userId) {
            return res.json({ message: "Invalid UserID" });
        }

        // Find the OTP entry for the given user ID
        const Tenant_withOTP = await Tenant_OTP.findById(userId);
        if (!Tenant_withOTP) {
            return res.status(404).json({
                success: false,
                message: "Your session has expired"
            });
        }

        // Verify the entered OTP
        if (Entered_OTP === Tenant_withOTP.OTP) {
            // Create a new tenant account
            const newTenant = new Tenant({
                name: Tenant_withOTP.name,
                email: Tenant_withOTP.email,
                password: Tenant_withOTP.password,
                locality: Tenant_withOTP.locality,
                city: Tenant_withOTP.city,
                gender: Tenant_withOTP.gender,
                smoke: Tenant_withOTP.smoke,
                veg: Tenant_withOTP.veg,
                pets: Tenant_withOTP.pets,
                flatmate: Tenant_withOTP.flatmate
            });

            // Delete the OTP entry after successful verification
            await Tenant_OTP.deleteOne({ email: Tenant_withOTP.email });

            await newTenant.save();

            return res.status(201).json({
                success: true,
                message: "User successfully registered"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP, please try again"
            });
        }
    } catch (e) {
        console.error(`Error occurred`, e);
        res.status(500).json({
            success: false,
            message: "Some error in server"
        });
    }
});

// --------------------- Tenant Login with JWT Token ---------------------
// Route to log in a tenant
// Requires `email` and `password` in the request body
router.post(`/Tenant_login`, async (req, res) => {
    try {
        const { email, password, remember_me } = req.body;

        // Find the tenant by email
        const findTenant = await Tenant.findOne({ email });
        if (!findTenant) {
            return res.status(404).json({
                success: false,
                message: "No user exists.",
                status: "404"
            });
        }

        // Compare the entered password with the stored hash
        let result = await ComparePassword(password, findTenant.password);

        if (result) {
            // Generate a JWT token for the tenant
            let token;
            if(remember_me){
                token = jwt.sign({ id: findTenant._id, email: findTenant.email }, SECRET_KEY, { expiresIn: "30d" });
            } else {
                token = jwt.sign({ id: findTenant._id, email: findTenant.email }, SECRET_KEY, { expiresIn: "5h" });
            }
            res.status(200).json({
                success: true,
                name: findTenant.name,
                message: "Successful Login",
                authtoken: token // Returning the token
            });
        } else {
            res.status(401).json({
                status: "401",
                message: "Wrong password, entry denied",
                success: false
            });
        }
    } catch (e) {
        console.error(`Error occurred`, e);
        res.status(500).json({
            message: "Some error in server",
            success: false
        });
    }
});

// --------------------- Get Tenant Profile ---------------------
// Route to fetch tenant profile by ID
// Requires `id` in the request body
router.post('/getuser', async (req, res) => {
    try {
        const { id } = req.body;

        // Find the tenant by ID
        const tenant = await Tenant.findById(id);
        if (!tenant) {
            res.send({ success: false });
            return;
        }

        res.send({ tenant, success: true });
    } catch (err) {
        res.send({ success: false });
    }
});

module.exports = router;
