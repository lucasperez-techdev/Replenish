// app/login/page.js
'use client';

import { useState } from 'react';
import { auth } from '../../../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Message from '../../../components/Message';
import styles from '../../../styles/AuthForm.module.css';
import Image from 'next/image';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ text: 'Please enter both email and password.', type: 'error' });
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setMessage({ text: 'Login successful!', type: 'success' });
      // Store user ID in localStorage
      localStorage.setItem('loggedInUserId', user.uid);
      setTimeout(() => {
        router.push('/homepage'); // Ensure you have a homepage.js in app/
      }, 2000);
    } catch (error) {
      console.error("Error during login:", error);
      let errorMsg = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      }
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authForm}>
        <h2 className={styles.formHeader}>Login</h2>
        {message.text && <Message message={message.text} type={message.type} onClose={() => setMessage({ text: '', type: '' })} />}
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
    </div>
  );
};

export default Login;
