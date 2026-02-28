const express = require("express");
const router = express.Router();
const Landlord = require("../models/Landlord");
const mongoose = require(`mongoose`);
const Property = require("../models/Property");
const Tenant = require("../models/Tenant");
const SendMailer = require(`../helper_funcs/mailSender`); // Utility function to send emails
const authMiddleware = require("../middlewares/checkuser"); // Middleware for JWT authentication
require(`dotenv`).config(`../.env`);
const config = require(`../config`);

// Route to notify the landlord when a tenant is interested in a property
// Requires `property_id` in the request body and authenticated tenant
router.post(`/Tenant_Prop`, authMiddleware, async (req, res) => {
    try {
        const Tenant_id = req.user.id; // Extract tenant ID from authenticated user
        const Property_id = req.body.property_id; // Extract property ID from request body

        // Validate the property ID
        if (!mongoose.Types.ObjectId.isValid(Property_id)) {
            return res.status(400).json({ error: `${Property_id} is invalid ID` });
        }

        // Fetch the tenant details
        let Actual_Tenant = await Tenant.findById(Tenant_id);

        // Fetch the property details and populate landlord information
        let Actual_Property = await Property.findById(Property_id).populate(`landlord`);

        if (!Actual_Property) {
            return res.status(404).json({
                success: false,
                message: "No such property exists"
            });
        }

        // Send an email notification to the landlord
        let result = await SendMailer(
            Actual_Property.landlord.email,
            "Someone is interested in your property",
            `Greetings, ${Actual_Property.landlord.name}. ${Actual_Tenant.name} is interested in your property at ${Actual_Property.address}. Mail them at ${Actual_Tenant.email} or message them via Roomble.`
        );

        // Log the result of the email operation
        console.log(result);

        if (result) {
            return res.status(200).json({
                success: true,
                message: `Owner was notified`
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Error sending email. Please try after a few minutes"
            });
        }
    } catch (e) {
        console.log(`Error in Interested.js`);
        console.error(e);
        return res.status(500).json({
            success: false,
            message: `Error in Backend`
        });
    }
});

module.exports = router;
