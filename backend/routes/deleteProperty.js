const express = require("express");
const router = express.Router();
const Landlord = require("../models/Landlord");
const Property = require("../models/Property");
const authMiddleware = require("../middlewares/checkuser"); // Middleware for JWT authentication
const mongoose = require('mongoose');

// Route to delete a property by its ID
// Requires `propertyId` as a URL parameter and authenticated landlord
router.delete("/deleteProperty/:id", authMiddleware, async (req, res) => {
    try {     
        const landlordId = req.user.id; // Extract landlord ID from authenticated user
        const propertyId = req.params.id; // Extract property ID from URL parameter

        // Validate the property ID
        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ error: `${propertyId} is invalid ID` });
        }

        // Find the landlord by ID
        const landlord = await Landlord.findById(landlordId);
        if (!landlord) {
            return res.status(404).json({
                success: false,
                message: "Landlord not found",
            });
        }

        // Check if the property belongs to the landlord
        if (!landlord.propertyList.includes(propertyId)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this property",
            });
        }

        // Find the property by ID
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        // Delete the property and update the landlord's property list
        await Property.findByIdAndDelete(propertyId);
        landlord.propertyList = landlord.propertyList.filter(id => id.toString() !== propertyId);
        await landlord.save();

        return res.status(200).json({
            success: true,
            message: "Property deleted successfully",
        });
    } catch (error) {
        console.error("Unexpected Error: ", error); // Log unexpected errors for debugging
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});

module.exports = router;
