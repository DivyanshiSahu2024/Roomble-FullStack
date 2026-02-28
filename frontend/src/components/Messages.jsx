/**
 * This component is responsible for displaying a messaging interface. It fetches and displays
 * the details of a specific conversation, including its members and messages. It also handles
 * navigation and error scenarios when something goes wrong during data fetching.
 */

import React, { useEffect, useState } from "react";
import "../css/MessageBoxStyle/Messages.css";
import MessageBox from "./MessageComponents/MessageBox";
import ChatBox from "./MessageComponents/ChatBox";
import { useNavigate, useParams } from "react-router-dom";
import config from "../config.json";
import { toast } from "react-toastify";

function Messages() {
  const navigate = useNavigate();

  // State to store the current conversation ID
  const [currentConvId, setCurrentConvId] = useState(null);

  // State to handle errors
  const [somethingwentwrong, setSomethingwentwrong] = useState(false);

  // State to store the current messages and conversation details
  const [currentMessages, setCurrentMessages] = useState({
    members: ["loading", "loading"],
    messages: [
      {
        senderID: "loading",
        message: "loading",
        timestamp: 123,
      },
    ],
  });

  // State to store the list of conversations (not used in this code)
  const [currentConversations, setCurrentConversations] = useState([]);

  // React Router hooks

  const params = useParams();
  const id = params.id;

  // Effect to handle navigation and error toast when something goes wrong
  useEffect(() => {
    if (localStorage.getItem("authtoken") === null) {
      navigate("/login"); // Redirect to login if not authenticated
    }
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1); // Navigate back to the previous page
    }
  }, [somethingwentwrong]);

  // Effect to fetch conversation details when the component mounts or `id` changes
  useEffect(() => {
    setCurrentConvId(id);

    fetch(`${config.backend}/messages/getConversation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authtoken: localStorage.getItem("authtoken"),
      },
      body: JSON.stringify({ conversation_id: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Update state with the fetched conversation data
          setCurrentMessages(data.conversation);
        } else {
          // Set error state if the API call fails
          setSomethingwentwrong(true);
        }
      });
  }, [id]);

  return (
    <div className="message-container">
      {/* MessageBox component */}
      <MessageBox />

      {/* ChatBox component with props */}
      <ChatBox
        currentConvId={currentConvId}
        setCurrentConvId={setCurrentConvId}
        currentMessages={currentMessages}
        setCurrentMessages={setCurrentMessages}
      />
    </div>
  );
}

export default Messages;
