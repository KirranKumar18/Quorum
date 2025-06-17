import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useLocation } from 'react-router-dom';


const socket = io("http://localhost:5000");

function extractChats(response) {
  return response.message;
}

function HomePage() {
  const [chats, setChats] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  
  const User= localStorage.getItem("Username");

  
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
    <div>
      <h2>Chat Messages</h2>
      <ul>
        {chats.map((chat, index) => (
          <li key={index}>
            <strong>{chat.Sender}:</strong> {chat.Message}
          </li>
        ))}
      </ul>
      
   
      <input
        type="text"
        value={inputMessage}
        placeholder="Enter your message"
        onChange={(e) => setInputMessage(e.target.value)}
         onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
}

export default HomePage;
