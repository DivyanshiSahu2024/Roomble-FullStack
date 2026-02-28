const express = require(`express`);
const router = express.Router();
require(`dotenv`).config(`../.env`); // Load environment variables
const jwt = require(`jsonwebtoken`);
const bcrypt = require(`bcrypt`);
const Sendmail = require("../helper_funcs/mailSender"); // Utility for sending emails
const authMiddleware = require("../middlewares/checkuser"); // Middleware for JWT authentication

const SECRET_KEY = process.env.SECRET_KEY; // Secret key for JWT

const Landlord = require(`../models/Landlord`);
const Tenant = require(`../models/Tenant`);
const { Landlord_OTP, Tenant_OTP } = require(`../models/OTP_models`);

// Utility function to hash passwords securely
async function Hashpassword(plainPassword) {
    const saltRounds = 10; // Number of salt rounds for bcrypt
    return await bcrypt.hash(plainPassword, saltRounds);
}

// Route to handle email submission for password reset
// Requires `email` and `accounttype` in the request body
router.post(`/enteremail`, async (req, res) => {
    try {
        const { email, accounttype } = req.body;
        let user;

        // Fetch user based on account type
        if (accounttype === `tenant`) {
            user = await Tenant.findOne({ email: email });
        } else if (accounttype === `landlord`) {
            user = await Landlord.findOne({ email: email });
        } else {
            return res.status(400).json({
                success: false,
                message: "Bad Account type"
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "No such user exists"
            });
        } else {
            // Generate a short-lived JWT token for authentication
            const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: "5m" });

            if (accounttype === `tenant`) {
                let ifExists = await Tenant_OTP.findOne({ email: email });

                if (ifExists) {
                    // Generate a new OTP and send it via email
                    let new_OTP = (Math.floor(100000 + Math.random() * 900000)).toString();
                    await Sendmail(email, `Welcome once again to Roomble`, `Here is your new OTP ${new_OTP}`);
                    await ifExists.updateOne({ OTP: new_OTP });

                    return res.status(200).json({
                        success: true,
                        message: "New OTP sent",
                        authtoken: token
                    });
                }

                // Generate and send OTP for new requests
                let new_OTP = (Math.floor(100000 + Math.random() * 900000)).toString();
                await Sendmail(email, `Welcome once again to Roomble`, `Hello, If it was you who was trying to reset your password, here's your OTP ${new_OTP}. However if this wasn't you, Kindly ignore.`);
                const newlyCreatedUser = new Tenant_OTP({
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    OTP: new_OTP,
                    locality: user.locality,
                    smoke: user.smoke,
                    pets: user.pets,
                    veg: user.veg,
                    gender: user.gender,
                    flatmate: user.flatmate,
                });
                await newlyCreatedUser.save();

                return res.status(200).json({
                    success: true,
                    authtoken: token
                });
            } else if (accounttype === `landlord`) {
                let ifExists = await Landlord_OTP.findOne({ email: email });

                if (ifExists) {
                    // Generate a new OTP and send it via email
                    let new_OTP = (Math.floor(100000 + Math.random() * 900000)).toString();
                    await Sendmail(email, `Welcome once again to Roomble`, `Here is your new OTP ${new_OTP}`);
                    await ifExists.updateOne({ OTP: new_OTP });

                    return res.status(200).json({
                        success: true,
                        message: "New OTP sent",
                        authtoken: token
                    });
                }

                // Generate and send OTP for new requests
                let new_OTP = (Math.floor(100000 + Math.random() * 900000)).toString();
                await Sendmail(email, `Welcome once again to Roomble`, `Hello, If it was you who was trying to reset your password, here's your OTP ${new_OTP}. However if this wasn't you, Kindly ignore.`);

                const newlyCreatedUser = new Landlord_OTP({
                    name: user.name,
                    type: user.type,
                    email: user.email,
                    password: user.password,
                    OTP: new_OTP,
                    propertyList: user.propertyList,
                    conversations: user.conversations,
                });
                await newlyCreatedUser.save();

                return res.status(200).json({
                    success: true,
                    authtoken: token
                });
            }
        }
    } catch (error) {
        console.error(`Error in forgot password:`, error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Route to verify OTP and grant access for password reset
// Requires `authtoken`, `accounttype`, and `Entered_OTP` in the request
router.post(`/enterOTP`, authMiddleware, async (req, res) => {
    try {
        let useremail = req.user.email;
        let Entered_OTP = req.body.Entered_OTP;
        let accounttype = req.body.accounttype;

        let user;
        if (accounttype === `tenant`) {
            user = await Tenant_OTP.findOne({ email: useremail });
        } else if (accounttype === `landlord`) {
            user = await Landlord_OTP.findOne({ email: useremail });
        } else {
            return res.status(401).json({
                success: false,
                message: "No accounttype"
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Please request an OTP. Your OTP has expired or was not sent."
            });
        } else if (user.OTP === Entered_OTP) {
            // Mark the user as authorized to make changes
            await user.updateOne({ Allow_changes: true });

            return res.status(200).json({
                success: true,
                message: "Correct OTP entered, access granted."
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Wrong OTP, please try again'
            });
        }
    } catch (err) {
        console.error(`Error in forgot password OTP verification:`, err);
        return res.status(500).json({
            success: false,
            message: "Internal Server error"
        });
    }
});

// Route to reset the password
// Requires `accounttype`, `authtoken`, and `newPassword` in the request
router.post(`/ForgotPassword`, authMiddleware, async (req, res) => {
    try {
        let useremail = req.user.email;
        let newPassword = req.body.newPassword;
        const Hashedpassword = await Hashpassword(newPassword);
        let accounttype = req.body.accounttype;

        if (accounttype === `tenant`) {
            let user = await Tenant_OTP.findOne({ email: useremail });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "OTP not found / OTP expired"
                });
            }
            if (user.Allow_changes === false) {
                return res.status(401).json({
                    success: false,
                    message: "Not Authorized to make changes"
                });
            } else {
                let tenant_user = await Tenant.findOne({ email: useremail });
                tenant_user.password = Hashedpassword;
                await tenant_user.save();
                return res.status(200).json({
                    success: true,
                    message: "Password successfully updated"
                });
            }
        } else if (accounttype === `landlord`) {
            let user = await Landlord_OTP.findOne({ email: useremail });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "OTP not found / OTP expired"
                });
            }
            if (user.Allow_changes === false) {
                return res.status(401).json({
                    success: false,
                    message: "Not Authorized to make changes"
                });
            } else {
                let landlord_user = await Landlord.findOne({ email: useremail });
                landlord_user.password = Hashedpassword;
                await landlord_user.save();
                return res.status(200).json({
                    success: true,
                    message: "Password successfully updated"
                });
            }
        }
    } catch (error) {
        console.error(`Error in forgot password reset:`, error);
        return res.status(500).json({
            success: false,
            message: `Internal server error`
        });
    }
});

module.exports = router;
