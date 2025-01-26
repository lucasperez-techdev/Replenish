// app/(auth)/register/page.js
'use client';

import { useState, useRef } from 'react';
import { auth, db, storage } from '../../../firebase/firebaseConfig'; // Import Firebase services
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage functions
import { useRouter } from 'next/navigation';
import Message from '../../../components/Message';
import styles from '../../../styles/AuthForm.module.css';
import Image from 'next/image';

const Register = () => {
  // State variables for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState(''); // Business/Company Name
  const [phoneNumber, setPhoneNumber] = useState(''); // Phone Number
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null); // Profile Picture file
  const [preview, setPreview] = useState(null); // Profile Picture preview
  const [isUploading, setIsUploading] = useState(false); // Loading state for registration

  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  // Reference for the hidden file input
  const fileInputRef = useRef(null);

  // Handler for form submission
  const handleRegistration = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !businessName || !phoneNumber) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setIsUploading(true); // Start loading

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profilePictureURL = '';
      // If a profile picture is selected, upload it to Firebase Storage
      if (profilePictureFile) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, profilePictureFile);
        profilePictureURL = await getDownloadURL(storageRef);
      }

      // Prepare user data to store in Firestore
      const userData = {
        email,
        firstName,
        lastName,
        businessName, // Add Business/Company Name
        phoneNumber,  // Add Phone Number
        profilePicture: profilePictureURL, // Add Profile Picture URL
        createdAt: new Date()
      };

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      setMessage({ text: 'Account Created Successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/homepage');
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
    } finally {
      setIsUploading(false); // End loading
    }
  };

  // Handler for profile picture selection and preview
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePictureFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Handler to trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authForm}>
        <h2 className={styles.formHeader}>Create Account</h2>
        {message.text && (
          <Message
            message={message.text}
            type={message.type}
            onClose={() => setMessage({ text: '', type: '' })}
          />
        )}
        <form id="register" onSubmit={handleRegistration}>
          {/* First Name */}
          <div className={styles.formGroup}>
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

          {/* Last Name */}
          <div className={styles.formGroup}>
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

          {/* Business/Company Name */}
          <div className={styles.formGroup}>
            <input
              type="text"
              id="businessName"
              placeholder=" "
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
            <label htmlFor="businessName">Business/Company Name</label>
          </div>

          {/* Phone Number */}
          <div className={styles.formGroup}>
            <Image src="/svgs/phone.svg" alt="Phone Icon" width={20} height={20} className={styles.icon} />
            <input
              type="tel"
              id="phoneNumber"
              placeholder=" "
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              pattern="[0-9]{10}" /* Example pattern for 10-digit phone numbers */
              title="Please enter a valid 10-digit phone number."
            />
            <label htmlFor="phoneNumber">Phone Number</label>
          </div>

          {/* Email Address */}
          <div className={styles.formGroup}>
            <Image src="/svgs/envelope.svg" alt="Envelope Icon" width={20} height={20} className={styles.icon} />
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

          {/* Password */}
          <div className={styles.formGroup}>
            <Image src="/svgs/lock.svg" alt="Lock Icon" width={20} height={20} className={styles.icon} />
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

          {/* Profile Picture */}
          <div className={styles.formGroup}>
            {/* Profile Icon */}

            {/* Upload Button */}
            <button
              type="button"
              onClick={handleButtonClick}
              className={styles.uploadButton}
            >
              Upload Profile Picture
            </button>

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              className={styles.hiddenFileInput}
            />
          </div>

          {/* Profile Picture Preview */}
          {preview && (
            <div className={styles.previewContainer}>
              <Image
                src={preview}
                alt="Profile Preview"
                width={100}
                height={100}
                className={styles.profilePreview}
              />
            </div>
          )}

          {/* Register Button */}
          <button type="submit" className={styles.btn} disabled={isUploading}>
            {isUploading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Separator */}
        <div className={styles.separator}>
          <span>OR</span>
        </div>

        {/* Toggle Authentication */}
        <div className={styles.toggleAuth}>
          <p>Already have an account?</p>
          <button onClick={() => router.push('/login')}>Login Here</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
