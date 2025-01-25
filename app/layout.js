// app/layout.js
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
