
/**
 * MessageCard component displays a card containing user details, 
 * the last message in a conversation, and a timestamp. It allows 
 * navigation to the chat page for the selected conversation.
 */

import React from 'react';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';

function MessageCard({ conversation }) {
    const navigate = useNavigate();

    // Function to format the timestamp into a readable time or date
    const Date_to_time = (timestamp) => {
        const time = new Date(timestamp);
        const now = new Date();

        // Format hours and minutes to always have 2 digits
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');

        // Get today's and yesterday's dates (without time)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // Get the message's date (without time)
        const msgDate = new Date(time.getFullYear(), time.getMonth(), time.getDate());

        // Return formatted time or date based on the message's date
        if (msgDate.getTime() === today.getTime()) {
            return `${hours}:${minutes}`; // Show time if it's today
        } else if (msgDate.getTime() === yesterday.getTime()) {
            return `Yesterday`; // Show "Yesterday" if it's yesterday
        } else {
            return time.toLocaleDateString(); // Show date for older messages
        }
    };

    // Function to navigate to the chat page for the selected conversation
    const redirectto = (id) => {
        navigate("/chat/" + id);
    };

    return (
        // Card component containing user details and last message
        <div className="card" onClick={() => redirectto(conversation.conversation_id)}>
            {/* User profile picture */}
            <img src={conversation.profilePic} alt="Name" className="sender-img" />

            {/* User information */}
            <div className="sender-info">
                <span className="senderName">{conversation.name}</span>
                <p className="last-message">
                    {conversation.lastMessage ? conversation.lastMessage.message : "Click to start the chat"}
                </p>
            </div>

            {/* Timestamp of the last message */}
            <div className="right">
                <p className="time">
                    {conversation.lastMessage ? Date_to_time(conversation.timestamp) : ""}
                </p>
            </div>
        </div>
    );
}

export default MessageCard;