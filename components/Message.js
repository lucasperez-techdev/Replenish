// components/Message.js
import { useEffect } from 'react';
import styles from '../styles/AuthForm.module.css';

const Message = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.alertMessage} ${styles[type]}`}>
      {message}
    </div>
  );
};

export default Message;
