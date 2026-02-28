const express = require('express');
const { createReview, getReviewsForUser } = require('../controllers/reviewcontroller');
const checkUser = require('../middlewares/checkuser'); // Middleware to authenticate and attach user to the request

const router = express.Router();

// Route to create a new review
// Requires authentication and review details in the request body
router.post('/', checkUser, createReview);

// Route to get all reviews for a specific user (Tenant/Landlord)
// Changed from GET to POST to allow passing user details in the request body
router.post('/reviewee', getReviewsForUser);

module.exports = router;
