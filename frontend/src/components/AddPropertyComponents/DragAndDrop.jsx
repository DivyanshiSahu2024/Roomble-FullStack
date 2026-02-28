
    /**
     * This function is used in a drag-and-drop file upload component.
     */

import React from 'react';
import "../../css/AddPropertyStyles/DragAndDrop.css";
import { useState, useRef } from 'react';

function DragAndDrop({ images, setImages, updateFormData }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

   
    function selectFiles() {
        fileInputRef.current.click();
    }

    // Handle file selection
    function onFileSelect(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        const newImages = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.split('/')[0] !== 'image') continue;

            newImages.push({
                name: files[i].name,
                url: URL.createObjectURL(files[i]),
                file: files[i],
            });
        }

        setImages((prev) => {
            const updatedImages = [...prev, ...newImages];
            updateFormData("photos", updatedImages); // Update formData
            return updatedImages;
        });

        event.target.value = ""; // Reset file input
    }

    // Delete an image
    function deleteImage(index) {
        setImages((prevImages) => {
            const updatedImages = prevImages.filter((_, i) => i !== index);
            updateFormData("photos", updatedImages); // Update formData
            URL.revokeObjectURL(prevImages[index].url); // Revoke object URL
            return updatedImages;
        });
    }

    // Handle drag over event
    function onDragOver(event) {
        event.preventDefault();
        setIsDragging(true);
        event.dataTransfer.dropEffect = "copy";
    }

    // Handle drag leave event
    function onDragLeave(event) {
        event.preventDefault();
        setIsDragging(false);
    }

    // Handle drop event
    function onDrop(event) {
        event.preventDefault();
        setIsDragging(false);

        const files = event.dataTransfer.files;
        if (files.length === 0) return;

        const newImages = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.split('/')[0] !== 'image') continue;

            newImages.push({
                name: files[i].name,
                url: URL.createObjectURL(files[i]),
                file: files[i],
            });
        }

        setImages((prev) => [...prev, ...newImages]);
    }

    return (
        <div className="drag-and-drop">
            {/* Top section */}
            <div className="drag-top">
                <p>Drag & Drop image uploading</p>
            </div>

            {/* Drag area */}
            <div
                className="drag-area"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                {isDragging ? (
                    <span className="drag-select">Drop images here</span>
                ) : (
                    <>
                        Drag & Drop image here or{" "}
                        <span
                            className="drag-select"
                            role="button"
                            onClick={selectFiles}
                            style={{ textDecoration: "underline" }}
                        >
                            Browse
                        </span>
                    </>
                )}
                <input
                    name="file"
                    type="file"
                    className="file"
                    multiple
                    ref={fileInputRef}
                    onChange={onFileSelect}
                />
            </div>

            {/* Container for displaying selected images */}
            <div className="drag-container">
                {images.map((image, index) => (
                    <div className="drag-image" key={index}>
                        {/* Delete button for each image */}
                        <span
                            className="drag-delete"
                            onClick={() => deleteImage(index)}
                        >
                            &times;
                        </span>
                        {/* Display the image */}
                        <img src={image.url} alt={image.name} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DragAndDrop