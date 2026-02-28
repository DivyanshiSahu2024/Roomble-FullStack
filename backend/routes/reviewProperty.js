const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Landlord = require('../models/Landlord');
const Tenant = require('../models/Tenant');
const checkUser = require('../middlewares/checkuser'); // Middleware to authenticate and attach user to the request

// Route to add a review for a property
// Requires `rating`, `review`, and `propertyId` in the request body
router.post('/addreview', checkUser, async (req, res) => {
    try {
        const { rating, review, propertyId } = req.body;

        // Find the property by its ID
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }

        // Check if the user has already reviewed the property
        for (let i = 0; i < property.reviews.length; i++) {
            if (property.reviews[i].reviewer.toString() === req.user._id.toString()) {
                return res.status(400).json({ message: "You have already reviewed this property", success: false });
            }
        }

        const user = req.user;

        if(user.type == 'landlord'){
            return res.status(400).json({ message: "Landlords cannot review properties", success: false });
        }

        // Create a review object with reviewer details, rating, and comment
        const reviewObj = {
            reviewer: user._id,
            reviewertype: user.type, // Type of reviewer (Landlord or Tenant)
            rating,
            comment: review
        };

        // Add the review to the property's reviews array
        property.reviews.push(reviewObj);
        await property.save();

        return res.json({ success: true, message: "Review added successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
});

// Route to fetch all reviews for a property
// Requires `propertyId` in the request body
router.post('/getreviews', async (req, res) => {
    try {
        const { propertyId } = req.body;

        // Find the property by its ID
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ error: "Property not found", success: false });
        }

        const reviews = [];

        // Iterate through the property's reviews and fetch reviewer details
        for (let i = 0; i < property.reviews.length; i++) {
            const review = property.reviews[i];
            let user;

            // Fetch the reviewer details based on their type (Landlord or Tenant)
            if (review.reviewertype === 'Landlord') {
                user = await Landlord.findById(review.reviewer);
            } else {
                user = await Tenant.findById(review.reviewer);
            }

            // Add the review details along with reviewer information to the response
            reviews.push({
                rating: review.rating,
                comment: review.comment,
                name: user.name,
                email: user.email,
                image: user.Images
            });
        }

        return res.json({ success: true, reviews });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", success: false });
    }
});

module.exports = router;