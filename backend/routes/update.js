const express = require("express");
const router = express.Router();
const Landlord = require("../models/Landlord");
const Property = require("../models/Property");
const Tenant = require("../models/Tenant");
const path = require(`path`);
const fs = require(`fs`);
const moveImage = require(`../helper_funcs/Saveimage`); // Helper function to save images
const authMiddleware = require("../middlewares/checkuser"); // Middleware for JWT authentication
require(`dotenv`).config(`../.env`);
const SaveImage = require(`../helper_funcs/Saveimage`);
const config = require(`../config`);

const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT;
const MAX_ALLOWED_PICS = 10; // Maximum allowed images for a property
const maxSize = 2 * 1024 * 1024; // Maximum allowed image size: 2MB
const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i; // Allowed image extensions

// --------------------- Update Profile ---------------------
// Route to update user profile
// Requires `accounttype` and other fields (except email and password) in the request body
// Optionally accepts an image file in `req.files.image` (max size: 2MB)
router.post("/updateProfile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { accounttype, remove, ...updatedFields } = req.body;
        let user;

        // Fetch user based on account type
        if (accounttype === "tenant") {
            user = await Tenant.findById(userId);
        } else if (accounttype === "landlord") {
            user = await Landlord.findById(userId);
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Account Type"
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        // Handle image upload
        if (req.files && req.files.image) {
            let image = req.files.image;

            // Validate image size and extension
            if (image.size > maxSize) {
                return res.status(400).json({
                    success: false,
                    message: `Image size is ${image.size} but maximum allowed is only ${maxSize}`
                });
            } else if (!allowedExtensions.test(image.name)) {
                return res.status(400).json({
                    success: false,
                    message: `Only png, jpg, and jpeg formats are allowed.`
                });
            } else {
                // Create directory if it doesn't exist (for any account type)
                const dir = path.join(__dirname, `../Pictures`, `${accounttype}`);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                // Save the image to the appropriate directory
                let UploadPath = path.join(__dirname, `../Pictures`, `${accounttype}`, `${user.id}${path.extname(image.name).toLowerCase()}`);
                await SaveImage(image, UploadPath);
                user.Images = `${config.backend}/Pictures/${accounttype}/${user.id}${path.extname(image.name).toLowerCase()}`;
            }
        }

        // Update user fields except email and password
        Object.keys(updatedFields).forEach((key) => {
            if (key !== `email` && key !== `password` && updatedFields[key] !== undefined) {
                user[key] = updatedFields[key];
            }
        });

        // Handle profile picture removal
        if (remove === `profilepic`) {
            user.Images = `${config.backend}/Pictures/Default.png`;
        }

        // Save the updated user
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully"
        });
    } catch (error) {
        console.error("Error saving updated user:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the profile. Please try again.",
            error: error.message,
        });
    }
});

// --------------------- Update Property ---------------------
// Route to update property attributes
// Requires property fields in the request body, `id` in the body, and `authToken` in the header
router.post("/updateProperty/", authMiddleware, async (req, res) => {
    try {
        const propertyData = req.body;
        const landlordId = req.user.id;
        const propertyId = req.body.id;

        // Required fields for property update
        const requiredFields = ["city", "town", "address", "area", "bhk", "description", "price", "amenities", "lat", "lng"];
        const missingFields = requiredFields.filter(field => (propertyData[field] === undefined));

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing Required Fields: ${missingFields.join(", ")}`
            });
        }

        // Check if the property belongs to the landlord
        if (!req.user.propertyList.includes(propertyId)) {
            return res.status(400).json({
                success: false,
                message: "You do not own this property"
            });
        }

        // Fetch the property by ID
        let property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        // Update property fields
        property.description = req.body.description;
        property.city = req.body.city;
        property.town = req.body.town;
        property.address = req.body.address;
        property.area = req.body.area;
        property.bhk = req.body.bhk;
        property.price = req.body.price;
        property.amenities = req.body.amenities;
        property.lat = req.body.lat;
        property.lng = req.body.lng;

        // Handle image upload for the property
        if (req.files && req.files.image) {
            // Convert single image to array for consistency
            if (!Array.isArray(req.files.image)) {
                req.files.image = [req.files.image];
            }

            // Clear existing images from the property directory
            const propertyDir = path.join(__dirname, `../Pictures`, `property`, `${propertyId}`);
            fs.rmdirSync(propertyDir, { recursive: true });
            property.Images = [];

            // Create a new directory for the property
            fs.mkdirSync(propertyDir);

            if (req.files.image.length > MAX_ALLOWED_PICS) {
                return res.status(400).json({
                    success: false,
                    message: `Maximum allowed images are ${MAX_ALLOWED_PICS}`
                });
            }

            let Image_count = 0;
            for (let image of req.files.image) {
                // Validate image size and extension
                if (image.size > maxSize) {
                    return res.status(400).json({
                        success: false,
                        message: `Image size is ${image.size} but maximum allowed is only ${maxSize}`
                    });
                } else if (!allowedExtensions.test(image.name)) {
                    return res.status(400).json({
                        success: false,
                        message: `Only png, jpg, and jpeg formats are allowed.`
                    });
                } else {
                    // Save the image to the property directory
                    let UploadPath = path.join(__dirname, `../Pictures`, `property`, `${property.id}`, `${Image_count}${path.extname(image.name).toLowerCase()}`);
                    await moveImage(image, UploadPath);
                    property.Images.push(`${config.backend}/Pictures/property/${property.id}/${Image_count}${path.extname(image.name).toLowerCase()}`);
                    Image_count++;
                }
            }
        }

        // Save the updated property
        await property.save();
        return res.status(200).json({
            success: true,
            message: "Property Updated Successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

module.exports = router;
