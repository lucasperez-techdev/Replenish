// app/(auth)/reset-password/page.js
'use client';

import { useState } from 'react';
import { auth } from '../../../firebase/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Message from '../../../components/Message';
import styles from '../../../styles/AuthForm.module.css';
import Image from 'next/image';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Please enter your email address.', type: 'error' });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({ text: 'Password reset email sent! Please check your inbox.', type: 'success' });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      let errorMsg = 'Failed to send reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMsg = 'No user found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      }
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authForm}>
        <h2 className={styles.formHeader}>Reset Password</h2>
        {message.text && <Message message={message.text} type={message.type} onClose={() => setMessage({ text: '', type: '' })} />}
        <form onSubmit={handlePasswordReset}>
          <div className={styles.formGroup}>
            <Image src="/svgs/envelope.svg" alt="Envelope Icon" width={20} height={20} />
            <input
              type="email"
              id="resetEmail"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="resetEmail">Email Address</label>
          </div>
          <button type="submit" className={styles.btn}>Send Reset Link</button>
        </form>
        <div className={styles.separator}>
          <span>OR</span>
        </div>
        <div className={styles.toggleAuth}>
          <p>Remembered your password?</p>
          <button onClick={() => router.push('/login')}>Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
