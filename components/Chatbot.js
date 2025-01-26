//components/Chatbot.js
"use client";

import { useState } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isOpen, setIsOpen] = useState(true); // Track whether the chatbot is open or collapsed

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Please provide a detailed, structured response: "${userInput}". Do not include "*" symbols and make it short and just give me a simple paragraph or two`,
        }),
      });

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.response || "No response from AI" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { sender: "bot", text: "Something went wrong. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setUserInput("");
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
      {/* Chatbot Content */}
      {isOpen ? (
        <div
          style={{
            maxWidth: "370px", // Fixed width for the chatbot
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
            position: "relative", // Position relative for the close button
            display: "flex",
            flexDirection: "column", // For proper layout alignment
          }}
        >
          {/* Chatbot Header */}
          <div
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "15px 40px 15px 15px", // Add padding to the right for the "X" button
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
              fontWeight: "bold",
              textAlign: "center",
              position: "relative", // For positioning the close button
            }}
          >
            Hello I am ZSG, how can I assist you?

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: "50%", // Center vertically within the header
                right: "10px", // Align to the right edge
                transform: "translateY(-50%)", // Adjust for vertical centering
                background: "transparent",
                color: "#fff",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          {/* Messages Section */}
          <div style={{ padding: "10px", overflowY: "auto", maxHeight: "350px" }}>
            {messages.map((msg, index) => (
              <p
                key={index}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  padding: "10px",
                  borderRadius: "8px",
                  margin: "5px",
                  maxWidth: "75%",
                  backgroundColor: msg.sender === "user" ? "#add8e6" : "#fff", // User messages are blue, bot messages are white
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  marginLeft: msg.sender === "user" ? "auto" : "0", // Shifts user messages to the right
                }}
              >
                {msg.text}
              </p>
            ))}
          </div>

          {/* Input Section */}
          <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc" }}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: "10px",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        /* Open Chat Button */
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          Open Chat
        </button>
      )}
    </div>
  );
};

export default Chatbot;
