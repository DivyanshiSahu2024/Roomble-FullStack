/**
 * This component displays a user's bookmarked flatmates and properties.
 * It allows users to view, manage, and delete their bookmarks through a drag-and-drop interface
 * or confirmation dialogs. The component also supports toggling between flatmates and properties.
 */

import React, { useEffect, useState, useContext } from "react";
import FlatmateCard from "../components/FlatmateCard.jsx";
import "../css/BookmarkedFlatmates.css";
import { Basecontext } from "../context/base/Basecontext";
import { toast } from "react-toastify";
import PropertyCardTenant from "./FindPropertyComponents/PropertyCardTenant.jsx";
import config from "../config";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const BookmarkedFlatmates = () => {
  // State variables
  const [showFlatmates, setShowFlatmates] = useState(true); // Toggle between flatmates and properties
  const [flatmates, setFlatmates] = useState([]); // List of bookmarked flatmates
  const [properties, setProperties] = useState([]); // List of bookmarked properties
  const [error, setError] = useState(null); // Error state
  const { user, loading, setLoading } = useContext(Basecontext); // Context for user and loading state
  const [somethingwentwrong, setSomethingwentwrong] = useState(false); // Flag for unexpected errors
  const [isDragging, setIsDragging] = useState(false); // Dragging state
  const navigate = useNavigate(); // Navigation hook

  // Handle unexpected errors
  useEffect(() => {
    if (localStorage.getItem("authtoken") === null) {
      navigate("/login"); // Redirect to login if not authenticated
    }
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1); // Navigate back
    }
  }, [somethingwentwrong, navigate]);

  // Fetch bookmarked data on component mount
  useEffect(() => {
    const fetchBookmarkedData = async () => {
      const token = localStorage.getItem("authtoken");
      try {
        const response = await fetch(
          `${config.backend}/api/BookMarking_Routes/get_bookmarks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authtoken: token,
            },
          }
        );
        const data = await response.json();
        if (!data.success) {
          toast.error(data.message);
          return;
        }
        setFlatmates(data.FlatmateBookMarks); // Set flatmates data
        setProperties(data.PropertyBookMarks); // Set properties data
      } catch (err) {
        setError(err.message); // Set error message
        setSomethingwentwrong(true); // Trigger error handling
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchBookmarkedData();
  }, []);

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle drag end
  const handleDragEnd = async (result, handler) => {
    setIsDragging(false);
    await handler(result); // Call the appropriate handler
  };

  // Handle bookmark deletion
  const handleDelete = async (bookmarkId, thing) => {
    const token = localStorage.getItem("authtoken");
    try {
      const response = await fetch(
        `${config.backend}/api/BookMarking_Routes/edit_bookmarks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authtoken: token,
          },
          body: JSON.stringify({
            action: "unmark",
            thing: thing,
            id: bookmarkId,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success(data.message); // Show success message
        return true;
      } else {
        toast.error(data.message); // Show error message
        return false;
      }
    } catch (error) {
      toast.error("Failed to remove bookmark"); // Show error message
      console.error("Deletion error:", error);
      return false;
    }
  };

  // Handle bookmark click (confirmation and deletion)
  const handleBookmarkClick = async (bookmarkId, thing) => {
    const confirmPopup = await Swal.fire({
      title: "Remove Bookmark?",
      text: "Are you sure you want to remove this bookmark?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    });
    if (confirmPopup.isConfirmed) {
      const success = await handleDelete(bookmarkId, thing);
      if (success) {
        if (thing === "flatmate") {
          setFlatmates((prev) =>
            prev.filter((item) => item._id !== bookmarkId)
          ); // Remove flatmate
        } else if (thing === "property") {
          setProperties((prev) =>
            prev.filter((item) => item._id !== bookmarkId)
          ); // Remove property
        }
      }
    }
  };

  // Handle drag end for flatmates
  const handleFlatmatesDragEnd = async (result) => {
    if (!result.destination) return; // Exit if no destination
    const { destination, draggableId } = result;
    if (destination.droppableId === "delete-zone") {
      const confirmDelete = await Swal.fire({
        title: "Remove Bookmark?",
        text: "Are you sure you want to delete this bookmark?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, remove it!",
        cancelButtonText: "Cancel",
      });
      if (confirmDelete.isConfirmed) {
        const index = flatmates.findIndex((item) => item._id === draggableId);
        if (index !== -1) {
          const removedItem = flatmates[index];
          const updatedFlatmates = [...flatmates];
          updatedFlatmates.splice(index, 1); // Remove item from list
          const success = await handleDelete(removedItem._id, "flatmate");
          if (success) setFlatmates(updatedFlatmates); // Update state
        }
      }
    }
  };

  // Handle drag end for properties
  const handlePropertiesDragEnd = async (result) => {
    if (!result.destination) return; // Exit if no destination
    const { destination, draggableId } = result;
    if (destination.droppableId === "delete-zone") {
      const confirmDelete = await Swal.fire({
        title: "Remove Bookmark?",
        text: "Are you sure you want to delete this bookmark?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, remove it!",
        cancelButtonText: "Cancel",
      });
      if (confirmDelete.isConfirmed) {
        const index = properties.findIndex((item) => item._id === draggableId);
        if (index !== -1) {
          const removedItem = properties[index];
          const updatedProperties = [...properties];
          updatedProperties.splice(index, 1); // Remove item from list
          const success = await handleDelete(removedItem._id, "property");
          if (success) setProperties(updatedProperties); // Update state
        }
      }
    }
  };

  // Handle tab click (toggle between flatmates and properties)
  const handleTabClick = (isFlatmatesTab) => {
    setShowFlatmates(isFlatmatesTab);
  };

  // Render loading state
  if (loading)
    return (
      <div className="tenant-dashboard-bookmarked-page">
        Loading bookmarks...
      </div>
    );

  // Render error state
  if (error)
    return (
      <div className="tenant-dashboard-bookmarked-page">Error: {error}</div>
    );

  return (
    <div className="tenant-dashboard-bookmarked-page">
      {/* Tabs for switching between flatmates and properties */}
      <div className="tenant-dashboard-tabs">
        <button
          className={`tenant-dashboard-tab-button ${
            showFlatmates ? "tenant-dashboard-active-tab" : ""
          }`}
          onClick={() => handleTabClick(true)}
        >
          Bookmarked Flatmates
        </button>
        <button
          className={`tenant-dashboard-tab-button ${
            !showFlatmates ? "tenant-dashboard-active-tab" : ""
          }`}
          onClick={() => handleTabClick(false)}
        >
          Bookmarked Properties
        </button>
      </div>

      {/* Main content */}
      <div
        key={showFlatmates ? "flatmates" : "properties"}
        className="tenant-dashboard-page-container"
      >
        <div className="tenant-dashboard-page-content animate-flip">
          <DragDropContext
            onDragStart={handleDragStart}
            onDragEnd={(result) =>
              handleDragEnd(
                result,
                showFlatmates ? handleFlatmatesDragEnd : handlePropertiesDragEnd
              )
            }
          >
            {/* Delete zone for drag-and-drop */}
            <Droppable droppableId="delete-zone">
              {(provided, snapshot) => (
                <div
                  className={`tenant-dashboard-delete-zone ${
                    isDragging ? "visible" : "hidden"
                  }`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <img
                    src="/delete-icon.png"
                    alt="Delete"
                    className={`tenant-dashboard-trash-icon ${
                      snapshot.isDraggingOver ? "trash-active" : ""
                    }`}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Page title */}
            <h1 className="tenant-dashboard-page-title">
              Your Bookmarked {showFlatmates ? "Flatmates" : "Properties"}
            </h1>

            {/* Empty state messages */}
            {showFlatmates && flatmates.length === 0 ? (
              <div className="tenant-dashboard-empty-message">
                <img src="./people_when_page_empty.png" alt="No bookmarks" />
                <h3>No Bookmarked Flatmates Yet</h3>
              </div>
            ) : !showFlatmates && properties.length === 0 ? (
              <div className="tenant-dashboard-empty-message">
                <img src="./house_when_page_empty.png" alt="No bookmarks" />
                <h3>No Bookmarked Properties Yet</h3>
              </div>
            ) : (
              // Render bookmarked items
              <Droppable
                droppableId={showFlatmates ? "flatmates" : "properties"}
              >
                {(provided) => (
                  <div
                    className="tenant-dashboard-flatmates-grid"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {(showFlatmates ? flatmates : properties).map(
                      (item, index) => (
                        <Draggable
                          key={item._id}
                          draggableId={item._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="tenant-dashboard-draggable-card"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {showFlatmates ? (
                                // Render flatmate card
                                <FlatmateCard
                                  id={item._id}
                                  name={item.name}
                                  locality={item.locality}
                                  city={item.city || "Mumbai"}
                                  gender={item.gender}
                                  image={item.Images}
                                  compatibilityScore={item.score}
                                  isBookmarked={true}
                                  onBookmarkToggle={() =>
                                    handleBookmarkClick(item._id, "flatmate")
                                  }
                                  help={true}
                                />
                              ) : (
                                // Render property card
                                <PropertyCardTenant
                                  id={item._id}
                                  image={item.Images[0]}
                                  price={item.price}
                                  title={item.name}
                                  location={item.address}
                                  bhk={item.bhk}
                                  available={item.available}
                                  onView={() => {}}
                                  onDelete={() =>
                                    handleBookmarkClick(item._id, "property")
                                  }
                                />
                              )}
                            </div>
                          )}
                        </Draggable>
                      )
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default BookmarkedFlatmates;
