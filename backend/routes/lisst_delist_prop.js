const express = require("express");
const router = express.Router();
const Landlord = require("../models/Landlord");
const Property = require("../models/Property");
const Tenant = require("../models/Tenant"); // Assuming tenants can bookmark properties
const mongoose = require(`mongoose`);
const authMiddleware = require("../middlewares/checkuser"); // Middleware for JWT authentication

// Route to list or delist a property
// Requires `authtoken` and `accounttype` in the header, and `property_id` and `action` in the body
// `action` can be either 'enlist' or 'delist'
router.post(`/List_Delist_Prop`, authMiddleware, async (req, res) => {
    try {
        const action = req.body.action; // Action to perform ('enlist' or 'delist')
        const list_id = req.body.property_id; // ID of the property to be listed/delisted
        const user_id = req.user.id; // ID of the authenticated landlord

        // Validate the action
        if (action !== 'enlist' && action !== 'delist') {
            return res.status(400).json({
                success: false,
                message: "Action can only be 'enlist' or 'delist'"
            });
        }

        // Validate the property ID format
        if (!mongoose.isValidObjectId(list_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format"
            });
        }

        // Fetch the landlord's details
        let user_landlord = await Landlord.findById(user_id);

        // Check if the property belongs to the landlord
        if (user_landlord.propertyList.includes(list_id)) {
            let prop = await Property.findById(list_id);
            if (!prop) {
                return res.status(500).json({
                    success: false,
                    message: "Property Not found"
                });
            }

            // Update the property's availability based on the action
            prop.available = (action === "enlist");
            await prop.save();

            return res.status(200).json({
                success: true,
                message: `Successfully ${action}ed property`
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "This property doesn't belong to you."
            });
        }
    } catch (e) {
        console.log(e); // Log the error for debugging
        return res.status(500).json({
            success: false,
            message: "Sorry, some internal server error occurred, please write to roomble360@gmail.com"
        });
    }
});

module.exports = router;