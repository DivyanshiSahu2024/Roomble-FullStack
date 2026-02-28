async function moveImage (image, UploadPath) {
    return new Promise((resolve, reject) => {
        image.mv(UploadPath, (err) => { // Move the image to the specified path
            if (err) {
                console.log("Error uploading image while updating"); // Log the error for debugging
                console.log(err);
                reject({
                    success: false,
                    message: "Some internal server error, in uploading the picture." // Send a generic error message to the client
                });
            } else {
                resolve();
            }
        });
    });
}

module.exports = moveImage;