const express = require("express");
const router = express.Router();
require(`dotenv`).config(`../.env`); // Load environment variables
const jwt = require(`jsonwebtoken`);
const SECRET_KEY = process.env.SECRET_KEY; // Secret key for JWT
const Sendmail = require("../helper_funcs/mailSender"); // Utility for sending emails
const Landlord = require("../models/Landlord");
const Tenant = require("../models/Tenant");
const authMiddleware = require("../middlewares/checkuser"); // Middleware for JWT authentication
const { Landlord_OTP, Tenant_OTP } = require("../models/OTP_models");
const Conversation = require("../models/Conversation");
const Property = require("../models/Property");

// Route to initiate account deletion
// Requires `email` and `accounttype` in the request body
router.post(`/deleteInitiate`, async (req, res) => {
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
        message: "Bad Account type",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No such user exists",
      });
    } else {
      // Generate a short-lived JWT token for authentication
      const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
        expiresIn: "5m", // Token expires in 5 minutes
      });

      if (accounttype === `tenant`) {
        let ifExists = await Tenant_OTP.findOne({ email: email });

        if (ifExists) {
          // Generate a new OTP and send it via email
          let new_OTP = Math.floor(100000 + Math.random() * 900000).toString();
          await Sendmail(
            email,
            `Sorry to see you go, we hope we were helpful <3`,
            `Here is your OTP ${new_OTP}`
          );
          await ifExists.updateOne({ OTP: new_OTP });

          return res.status(200).json({
            success: true,
            message: "New OTP sent",
            authtoken: token,
          });
        }

        // Generate and send OTP for new requests
        let new_OTP = Math.floor(100000 + Math.random() * 900000).toString();
        await Sendmail(
          email,
          `Welcome once again to Roomble`,
          `Hello, If it was you who was trying to delete your account, here's your OTP ${new_OTP}. However if this wasn't you, Kindly ignore.`
        );
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
          authtoken: token,
        });
      } else if (accounttype === `landlord`) {
        let ifExists = await Landlord_OTP.findOne({ email: email });

        if (ifExists) {
          // Generate a new OTP and send it via email
          let new_OTP = Math.floor(100000 + Math.random() * 900000).toString();
          await Sendmail(
            email,
            `Sorry to see you go, we hope we were helpful <3`,
            `Here is your OTP ${new_OTP}`
          );
          await ifExists.updateOne({ OTP: new_OTP });

          return res.status(200).json({
            success: true,
            message: "New OTP sent",
            authtoken: token,
          });
        }

        // Generate and send OTP for new requests
        let new_OTP = Math.floor(100000 + Math.random() * 900000).toString();
        await Sendmail(
          email,
          `Welcome once again to Roomble`,
          `Hello, If it was you who was trying to delete your account, here's your OTP ${new_OTP}. However if this wasn't you, Kindly ignore.`
        );

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
          authtoken: token,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Route to verify OTP and delete account
// Requires `email`, `accounttype`, and `Entered_OTP` in the request body, and token in the header
router.post(`/enterOTPtoDelete`, authMiddleware, async (req, res) => {
  try {
    let userEmail = req.user.email;
    let Entered_OTP = req.body.Entered_OTP;
    let accounttype = req.body.accounttype;

    let userOTP;
    if (accounttype === `tenant`) {
      userOTP = await Tenant_OTP.findOne({ email: userEmail });
    } else if (accounttype === `landlord`) {
      userOTP = await Landlord_OTP.findOne({ email: userEmail });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid Account Type",
      });
    }

    if (!userOTP) {
      return res.status(404).json({
        success: false,
        message: "Please request an OTP. Your OTP has expired or was not sent.",
      });
    } else if (userOTP.OTP === Entered_OTP) {
        // Delete user account
        const deletedUser = await Tenant.findOneAndDelete({ email: userEmail }) || await Landlord.findOneAndDelete({ email: userEmail });
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found or already deleted",
            });
        }

        // Delete related data
        if (accounttype === `tenant`) {
          await Conversation.deleteMany({ tenantEmail: userEmail }); // Delete tenant conversations
        } else if (accounttype === `landlord`) {
          await Property.deleteMany({ landlordEmail: userEmail }); // Delete landlord properties
          await Conversation.deleteMany({ landlordEmail: userEmail }); // Delete landlord conversations
        }

        // Delete OTP record
        const deletedUserOTP = await Tenant_OTP.findOneAndDelete({ email: userEmail }) || await Landlord_OTP.findOneAndDelete({ email: userEmail });

        return res.status(200).json({
            success: true,
            message: "Account and related data deleted successfully.",
        });
    } else {
      return res.status(401).json({
        success: false,
        message: "Wrong OTP, please try again",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
});

module.exports = router;
