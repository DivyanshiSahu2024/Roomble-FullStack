
/**
 * This component represents the chat interface for users to send and receive messages in real-time.
 * It includes features like emoji picker, message input, and dynamic updates for online status and messages.
 * The component interacts with a backend API and uses WebSocket for real-time communication.
*/

import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import SendIcon from '@mui/icons-material/Send';
import EmojiPicker from 'emoji-picker-react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import '../../css/MessageBoxStyle/ChatBox.css';
import SampleMessages from "./SampleMessages";
import OwnMessage from "./OwnMessage";
import RecievedMessage from "./RecievedMessage";
import { Basecontext } from '../../context/base/Basecontext';
import useDidMountEffect from "../../useDidMountEffect";
import { socket } from "../../socket";
import config from "../../config.json";

function ChatBox({ currentConvId, setCurrentConvId, currentMessages, setCurrentMessages }) {
    const state = useContext(Basecontext);
    const { user } = state;

    const [emojiOpen, setEmojiOpen] = useState(false); // Controls emoji picker visibility
    const [message, setMessage] = useState(''); // Stores the current message input
    const [otherUser, setOtherUser] = useState({ name: "Loading...", status: "offline", profilepic: "/sampleUser_Img.png" });
    const [somethingWentWrong, setSomethingWentWrong] = useState(false);

    const endRef = useRef(null); // Reference to scroll to the bottom of the chat
    const navigate = useNavigate();

    // Handle errors and navigate back if something goes wrong
    useEffect(() => {
        if (somethingWentWrong) {
            toast.error('Something went wrong. Please try again later.');
            navigate(-1);
        }
    }, [somethingWentWrong]);

    // Fetch other user's details when online users are updated
    useEffect(() => {
        socket.on("update_online_users", () => {
            fetchUserNameStatus();
        });

        // Update messages in real-time when a new message is received
        socket.on("message", (data) => {
            if (currentConvId === data.conversation_id) {
                setCurrentMessages(data.messages);
                scrollToBottom();
            }
        });
    });

    // Fetch other user's details when `currentMessages` changes
    useDidMountEffect(() => {
        fetchUserNameStatus();
    }, [currentMessages]);

    // Fetch other user's name, status, and profile picture
    const fetchUserNameStatus = async () => {
        try {
            scrollToBottom();
            const res = await fetch(`${config.backend}/messages/getUserNameStatus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userID: currentMessages.members[0] === user._id
                        ? currentMessages.members[1]
                        : currentMessages.members[0]
                }),
            });

            const data = await res.json();
            if (data.success) {
                setOtherUser({ name: data.name, status: data.status, profilepic: data.profilepic });
            }
        } catch (err) {
            setSomethingWentWrong(true);
        }
    };

    // Scroll to the bottom of the chat
    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Handle emoji selection
    const handleEmojiClick = (event) => {
        setMessage((prev) => prev + event.emoji);
    };

    // Handle message input change
    const handleChange = (event) => {
        setMessage(event.target.value);
    };

    // Handle sending a message
    const handleSend = async () => {
        if (message) {
            try {
                const res = await fetch(`${config.backend}/messages/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'authtoken': localStorage.getItem('authtoken'),
                    },
                    body: JSON.stringify({ conversation_id: currentConvId, message }),
                });

                const data = await res.json();
                if (data.success) {
                    setMessage("");
                    setCurrentMessages(data.messages);
                    scrollToBottom();
                }
            } catch (err) {
                console.error("Error sending message:", err);
            }
        }
    };

    return (
        <div className="chats">
            {/* Chat Header */}
            <div className="chatHeading">
                <div className="active-sender">
                    <img src={otherUser.profilepic} alt="Name" className="active-sender" />
                    <div className="text">
                        <span className="activeSendername">{otherUser.name}</span>
                        <p className="status">{otherUser.status}</p>
                    </div>
                </div>
                <div className="Menu">
                    <MoreVertIcon style={{ fontSize: 30 }} />
                </div>
            </div>

            {/* Chat Body */}
            <div className="chatBody">
                {currentMessages.messages.map((msg, id) => (
                    msg.senderID === user._id
                        ? <OwnMessage key={id} message={msg.message} otherUser={otherUser} timestamp={msg.timestamp} />
                        : <RecievedMessage key={id} message={msg.message} otherUser={otherUser} timestamp={msg.timestamp} />
                ))}
                <div ref={endRef}></div>
            </div>

            {/* Chat Input */}
            <div className="chatInput">
                <div className="icons">
                    <div className="emoji">
                        <EmojiEmotionsOutlinedIcon
                            style={{ fontSize: 30 }}
                            onClick={() => setEmojiOpen((prev) => !prev)}
                        />
                        {emojiOpen && (
                            <div className="picker">
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </div>
                        )}
                    </div>
                </div>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    className="msginput"
                    onChange={handleChange}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                />
                <SendIcon
                    className="sendButton"
                    style={{ fontSize: 30, color: "#7D141D" }}
                    onClick={handleSend}
                />
            </div>
        </div>
    );
}

export default ChatBox;
