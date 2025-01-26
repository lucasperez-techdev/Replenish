
// app/login/page.js
'use client';

import { useState } from 'react';
import { auth } from '../../../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/AuthForm.module.css';
import Image from 'next/image';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setPopupMessage('Please enter both email and password.');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem('loggedInUserId', user.uid);
      router.push('/homepage');
    } catch (error) {
      console.error("Error during login:", error);
      let errorMsg = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      }
      setPopupMessage(errorMsg);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authForm}>
        <h2 className={styles.formHeader}>Login</h2>
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <Image src="/svgs/envelope.svg" alt="Envelope Icon" width={20} height={20} className={styles.icon} />
            <input
              type="email"
              id="loginEmail"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="loginEmail">Email Address</label>
          </div>
          <div className={styles.formGroup}>
            <Image src="/svgs/lock.svg" alt="Lock Icon" width={20} height={20} className={styles.icon} />
            <input
              type="password"
              id="loginPassword"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="loginPassword">Password</label>
          </div>
          <div className={styles.formGroup}>
            <a href="/reset-password" className={styles.recoverPassword}>Forgot Password?</a>
          </div>
          <button type="submit" className={styles.btn}>Login</button>
        </form>
        <div className={styles.separator}>
          <span>OR</span>
        </div>
        <div className={styles.toggleAuth}>
          <p>Don't have an account?</p>
          <button onClick={() => router.push('/register')}>Register Now</button>
        </div>
      </div>
      {showPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md flex items-center space-x-2 animate-pulse">
          <span>&#9888;</span>
          <span>{popupMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Login;
