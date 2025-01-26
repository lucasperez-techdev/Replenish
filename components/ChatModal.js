"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import styles from "../styles/ChatModal.module.css";

export default function ChatModal({ open, onClose, otherUser, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Create a unique conversationId so both users see the same chat
  const conversationId = [currentUser.uid, otherUser.id].sort().join("_");

  const bottomOfChatRef = useRef(null);

  // Listen for real-time messages
  useEffect(() => {
    if (!open) return; // Only load messages if modal is open

    const messagesRef = collection(db, "chats", conversationId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId, open]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messagesRef = collection(db, "chats", conversationId, "messages");
    await addDoc(messagesRef, {
      text: newMessage.trim(),
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    setNewMessage("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chat with {otherUser.businessName}</DialogTitle>
      <DialogContent dividers>
        <List className={styles.chatList}>
          {messages.map((msg, idx) => {
            const isCurrentUser = msg.senderId === currentUser.uid;
            return (
              <ListItem
                key={idx}
                className={`${styles.messageItem} ${
                  isCurrentUser ? styles.ownMessage : styles.otherMessage
                }`}
              >
                <ListItemText primary={msg.text} />
              </ListItem>
            );
          })}
          <div ref={bottomOfChatRef} />
        </List>
      </DialogContent>

      <DialogActions>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          className={styles.textField}
        />
        <Button onClick={handleSendMessage} variant="contained">
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}
