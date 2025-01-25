// app/register/page.js
'use client';

import { useState } from 'react';
import { auth, db } from '../../../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Message from '../../../components/Message';
import styles from '../../../styles/AuthForm.module.css';
import Image from 'next/image';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userData = { email, firstName, lastName };
      await setDoc(doc(db, "users", user.uid), userData);
      setMessage({ text: 'Account Created Successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error("Error during registration:", error);
      let errorMsg = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'Email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.';
      }
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authForm}>
        <h2 className={styles.formHeader}>Create Account</h2>
        {message.text && <Message message={message.text} type={message.type} onClose={() => setMessage({ text: '', type: '' })} />}
        <form onSubmit={handleRegistration}>
          <div className={styles.formGroup}>
            <Image src="/svgs/user.svg" alt="User Icon" width={20} height={20} />
            <input
              type="text"
              id="firstName"
              placeholder=" "
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <label htmlFor="firstName">First Name</label>
          </div>
          <div className={styles.formGroup}>
            <Image src="/svgs/user.svg" alt="User Icon" width={20} height={20} />
            <input
              type="text"
              id="lastName"
              placeholder=" "
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <label htmlFor="lastName">Last Name</label>
          </div>
          <div className={styles.formGroup}>
            <Image src="/svgs/envelope.svg" alt="Envelope Icon" width={20} height={20} />
            <input
              type="email"
              id="registerEmail"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="registerEmail">Email Address</label>
          </div>
          <div className={styles.formGroup}>
            <Image src="/svgs/lock.svg" alt="Lock Icon" width={20} height={20} />
            <input
              type="password"
              id="registerPassword"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="registerPassword">Password</label>
          </div>
          <button type="submit" className={styles.btn}>Register</button>
        </form>
        <div className={styles.separator}>
          <span>OR</span>
        </div>
        <div className={styles.toggleAuth}>
          <p>Already have an account?</p>
          <button onClick={() => router.push('/')}>Login Here</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
