// Import the Landlord model from models directory to access and manipulate Landlord documents in MongoDB
const Landlord = require('../models/Landlord');
// Import the Tenant model from models directory to access and manipulate Tenant documents in MongoDB
const Tenant = require('../models/Tenant');
// Import mongoose library which provides a schema-based solution to model application data with MongoDB
const mongoose = require('mongoose');

/**
 * @desc Create a new review
 * @route POST /api/reviews
 * @access Public (Can be modified later to require authentication)
 */
const createReview = async (req, res) => {
    try{
        // Extract the MongoDB ObjectID of the user who will receive the review (reviewee) from request body
        const revieweeid = (req.body.reviewee);
        // Extract the MongoDB ObjectID of the user who is writing the review (reviewer) from the authenticated user object
        // This assumes an authentication middleware has already set the user object in the request
        const reviewerid = (req.user._id)
        // Extract the numeric rating value provided in the review (likely on a scale like 1-5)
        const rating = req.body.rating;
        // Extract the text comment/feedback provided as part of the review
        const comment = req.body.comment;
        // Extract the user type of the reviewer (either 'Tenant' or 'Landlord') from authenticated user data
        const reviewertype = req.user.type;

        // First attempt to find the user being reviewed (reviewee) in the Tenant collection
        let reviewee = await Tenant.findById(revieweeid);
        // Initialize reviewee type as 'Tenant' - will be used for response messages and potentially business logic
        let revieweetype = 'Tenant';
        // If the reviewee was not found in the Tenant collection, check if they're in the Landlord collection
        if(!reviewee){
            reviewee = await Landlord.findById(revieweeid);
            // Update the reviewee type to 'Landlord' if found in the Landlord collection
            revieweetype = 'Landlord';
        }
        // If the reviewee was not found in either collection, return a 404 Not Found error
        if(!reviewee){
            return res.status(404).json({
                success : false,
                message : "Reviewee not found"
            })
        }
        
        // Create a new review object with the collected data to be added to the reviewee's document
        const newReview = {
            reviewer : reviewerid,      // MongoDB ObjectID of the user writing the review
            rating,                     // Numeric rating value (using ES6 shorthand for rating: rating)
            comment,                    // Text feedback (using ES6 shorthand for comment: comment)
            reviewertype                // Type of user writing the review - 'Tenant' or 'Landlord' (using ES6 shorthand)
        }

        // Prevent users from reviewing themselves by comparing the reviewer and reviewee IDs
        // toString() is used to convert ObjectIDs to string for accurate comparison
        if(reviewerid.toString() === revieweeid.toString()){
            return res.status(400).json({
                success : false,
                message : "You cannot review yourself"
            })
        }
        
        // Check if this reviewer has already submitted a review for this reviewee
        // Initialize flag to track if a review from this user already exists
        let alreadyReviewed = false;
        // Iterate through all existing reviews on the reviewee's profile
        reviewee.reviews.forEach(review => {
            // If the reviewer ID in an existing review matches the current reviewer's ID
            if(review.reviewer.toString() === reviewerid.toString()){
                // Set the flag to true indicating a review already exists
                alreadyReviewed = true;
            }
        });
        // If a review from this reviewer already exists, return a 400 Bad Request error
        if(alreadyReviewed){
            return res.status(400).json({
                success : false,
                message : "You have already reviewed this user"
            })
        }

        // Add the new review object to the reviewee's reviews array
        reviewee.reviews.push(newReview);
        // Save the updated reviewee document with the new review to the database
        await reviewee.save();
        // Return a success response with status 200 and include the newly created review in the response
        return res.status(200).json({
            success : true,
            message : "Review added successfully",
            review : newReview
        })
        
    }
    // Catch any errors that occur during the review creation process
    catch(e){
        // Return a server error response (500) with the error message for debugging
        return res.status(500).json({
            success : false,
            message : "Server Error",
            error : e.message
        })
    }
};

/**
 * @desc Get all reviews for a specific Tenant or Landlord
 * @route GET /api/reviews/:revieweeId
 * @access Public
 */
const getReviewsForUser = async (req, res) => {
    try{
        // Extract the MongoDB ObjectID of the user whose reviews we want to retrieve
        // Note: Based on the route comment, this should ideally be from req.params.revieweeId rather than req.body
        const revieweeid = req.body.reviewee;
        // First attempt to find the user (reviewee) in the Tenant collection
        let reviewee = await Tenant.findById(revieweeid);
        // Initialize reviewee type as 'Tenant' for response formatting
        let revieweetype = 'Tenant';
        // If the reviewee was not found in the Tenant collection, check the Landlord collection
        if(!reviewee){
            reviewee = await Landlord.findById(revieweeid);
            // Update reviewee type to 'Landlord' if found in the Landlord collection
            revieweetype = 'Landlord';
        }
        // If the reviewee was not found in either collection, return a 404 Not Found error
        if(!reviewee){
            return res.status(404).json({
                success : false,
                message : "Reviewee not found"
            })
        }
        
        // Extract the reviews array from the reviewee document
        let reviews = reviewee.reviews;
        
        // Enhance each review with additional reviewer information for display purposes
        for(let i=0; i<reviews.length; i++){
            // For each review, try to find the reviewer in the Tenant collection first
            let reviewer = await Tenant.findById(reviews[i].reviewer);
            // If not found in Tenant collection, check the Landlord collection
            if(!reviewer){
                reviewer = await Landlord.findById(reviews[i].reviewer);
            }
            // Add the reviewer's name to the review object for display
            reviews[i].reviewername = reviewer.name;
            // Add the reviewer's profile image to the review object for display
            reviews[i].reviewerimage = reviewer.Images;
        }
        
        // Return a success response with all the reviews (now enhanced with reviewer details)
        return res.status(200).json({
            success : true,
            message : `Found ${reviews.length} reviews for ${revieweetype}`,
            reviews
        })
    }
    // Catch any errors that occur during the review retrieval process
    catch(e){
        // Return a server error response (500) with the error message for debugging
        return res.status(500).json({
            success : false,
            message : "Server Error",
            error : e.message
        })
    }
};

// Export the controller functions to make them available to route handlers
module.exports = { createReview, getReviewsForUser };
