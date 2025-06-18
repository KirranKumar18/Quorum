
import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useLocation } from 'react-router-dom';
import './HomePage.css'; // Import your CSS file

const socket = io("http://localhost:5000");

function extractChats(response) {
  return response.message;
}

function HomePage() {
  const [chats, setChats] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  
  const User = localStorage.getItem("Username");
  
  const handleImage = function(e) {
    const file = e.target.files[0];
    if (file) {
      console.log("Image selected:", file.name);
      // Handle image upload logic here
    }

    
  }

  // gets the data from the database
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/chatRoom");
        const chatArray = extractChats(res.data);
        setChats(chatArray);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };
    fetchChats();
  }, []);

  // used to send the data to the database
  useEffect(() => {
    socket.on("newMessage", (newMsg) => {
      setChats((prevChats) => [...prevChats, newMsg]);
    });
    return () => {
      socket.off("newMessage");
    };
  }, []);

  const handleSend = async () => {
    if (inputMessage.trim() === "") return;
    
    const payload = {
      Grpid: "group123",
      Sender: User,
      Message: inputMessage,
      image: "abc"
    };

    try {
      await axios.post("http://localhost:5000/api/messageSave", payload);
      setInputMessage(""); 
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (

    <>
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat Messages</h2>
      </div>
      
      <div className="messages-container">
        {chats.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <ul className="messages-list">
            {chats.map((chat, index) => (
              <li 
                key={index} 
                className={`message-item ${chat.Sender === User ? 'message-own' : 'message-other'}`}
              >
                <div className="message-sender">{chat.Sender}</div>
                <p className="message-text">{chat.Message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="input-container">
        <div className="input-row">
          <input
            type="text"
            className="message-input"
            value={inputMessage}
            placeholder="Type your message..."
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          
          <div className="file-input-wrapper">
            <input 
              type="file" 
              id="file-input"
              className="file-input"
              accept="image/*" 
              onChange={handleImage}
            />
            <label htmlFor="file-input" className="file-input-label" title="Attach image"></label>
          </div>
          
          <button 
            className="send-button"
            onClick={handleSend}
            disabled={inputMessage.trim() === ""}
          >
            Send
          </button>
        </div>
      </div>
    </div>

    </>
    
  );
}

export default HomePage;