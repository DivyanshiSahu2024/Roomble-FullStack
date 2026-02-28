

// Component to display a message when no chat is selected

import React from "react";

export default function NoChatSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
      {/* SVG Illustration */}
      <svg
        width="150"
        height="150"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-4 text-gray-400"
      >
        {/* Chat bubble outline */}
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        {/* Horizontal lines inside the chat bubble */}
        <path d="M8 10h8" />
        <path d="M8 14h6" />
      </svg>

      {/* Title */}
      <h2 className="text-xl font-semibold">No Chat Selected</h2>

      {/* Subtitle */}
      <p className="text-sm text-gray-400 mt-2">
        Choose a conversation to start messaging.
      </p>
    </div>
  );
}
