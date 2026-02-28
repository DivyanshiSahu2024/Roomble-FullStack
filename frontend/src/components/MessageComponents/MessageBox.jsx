
/**
 * MessageBox component displays a list of user conversations with a search functionality.
 * It fetches and updates conversations dynamically using API calls and socket events.
 */

import React, { useState, useContext, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import MessageCard from './MessageCard.jsx';
import '../../css/MessageBoxStyle/MessageBox.css';
import { Basecontext } from '../../context/base/Basecontext';
import { socket } from '../../socket.js';
import config from "../../config.json";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function MessageBox() {
    // Context and state variables
    const state = useContext(Basecontext);
    const { user, setUser, fetuser } = state;
    const [currentMessages, setCurrentMessages] = useState([]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [somethingwentwrong, setSomethingwentwrong] = useState(false);
    const navigate = useNavigate();

    // Fetch conversations on component mount or when the user changes
    useEffect(() => {
        setCurrentUserId(user._id);

        const fetchConversations = async () => {
            try {
                const res = await fetch(`${config.backend}/messages/getConversations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "authtoken": localStorage.getItem("authtoken")
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setCurrentMessages(data.conversations);
                } else {
                    setSomethingwentwrong(true);
                }
            } catch (error) {
                setSomethingwentwrong(true);
            }
        };

        fetchConversations();
    }, [user]);

    // Handle errors and navigate back if something goes wrong
    useEffect(() => {
        if (somethingwentwrong) {
            toast.error('Something went wrong. Please try again later.');
            navigate(-1);
        }
    }, [somethingwentwrong]);

    // Listen for new messages via socket and refresh conversations
    useEffect(() => {
        socket.on("message", () => {
            const fetchConversations = async () => {
                try {
                    const res = await fetch(`${config.backend}/messages/getConversations`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "authtoken": localStorage.getItem("authtoken")
                        }
                    });
                    const data = await res.json();
                    if (data.success) {
                        setCurrentMessages(data.conversations);
                    }
                } catch (error) {
                    setSomethingwentwrong(true);
                }
            };

            fetchConversations();
        });
    }, []);

    // Filter and sort messages based on search query and timestamp
    const filteredMessages = currentMessages
        .filter(conversation =>
            conversation.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="message-cards">
            {/* Top section contains the heading and search bar */}
            <div className="top">
                <h2 className="people-text">People</h2>
                <div className="search-bar">
                    <SearchIcon style={{ fontSize: 30 }} />
                    <input
                        type="text"
                        placeholder="Search"
                        className="chat-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Bottom section contains the list of all conversations */}
            <div className="bottom">
                {filteredMessages.map((conversation, index) => (
                    <MessageCard key={index} conversation={conversation} />
                ))}
            </div>
        </div>
    );
}

export default MessageBox;