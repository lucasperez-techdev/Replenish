'use client';

import { useState, useRef } from 'react';
import { auth, db, storage } from '../../../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import Message from '../../../components/Message';
import styles from '../../../styles/AuthForm.module.css';
import Image from 'next/image';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // NEW: Resources have/need
  const [resourcesHave, setResourcesHave] = useState('');
  const [resourcesNeeded, setResourcesNeeded] = useState('');

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef(null);

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !businessName ||
      !phoneNumber
    ) {
      return;
    }

    setIsUploading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      let profilePictureURL = '';
      if (profilePictureFile) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, profilePictureFile);
        profilePictureURL = await getDownloadURL(storageRef);
      }

      // Convert comma-separated strings to arrays (trim whitespace)
      const resourcesHaveArr = resourcesHave
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean); // remove empty
      const resourcesNeededArr = resourcesNeeded
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const userData = {
        email,
        firstName,
        lastName,
        businessName,
        phoneNumber,
        profilePicture: profilePictureURL,
        resourcesHave: resourcesHaveArr,
        resourcesNeeded: resourcesNeededArr,
        createdAt: new Date(),
      };

      // 1. Save user in Firestore
      await setDoc(doc(db, 'users', user.uid), userData);

      // 2. Check for matches & send emails
      //    We'll call our new API route to handle matching + email sending.
      await fetch('/api/matchResources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUser: userData,
        }),
      });

      // After registration success
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        router.push('/homepage');
      }, 1500);
    } catch (error) {
      console.error('Error during registration:', error);
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={styles.authContainer}>
      {/** LEFT SECTION WITH LOGO & MOTTO **/}
      <div className={styles.leftSection}>
        <Image
          src="/images/ZeroSum.png"
          alt="Zero-Sum Logo"
          width={700}
          height={500}
          className={styles.largeLogo}
        />
        <p className={styles.motto}>ZERO-SUM, WHERE BUSINESSES BENEFIT.</p>
      </div>

      {/** RIGHT SECTION WITH FORM **/}
      <div className={styles.rightSection}>
        <div className={styles.authForm}>
          <h2 className={styles.formHeader}>Create Account</h2>
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

            {/* Business/Company */}
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
              <Image
                src="/svgs/phone.svg"
                alt="Phone Icon"
                width={20}
                height={20}
                className={styles.icon}
              />
              <input
                type="tel"
                id="phoneNumber"
                placeholder=" "
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number."
              />
              <label htmlFor="phoneNumber">Phone Number</label>
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <Image
                src="/svgs/envelope.svg"
                alt="Envelope Icon"
                width={20}
                height={20}
                className={styles.icon}
              />
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
              <Image
                src="/svgs/lock.svg"
                alt="Lock Icon"
                width={20}
                height={20}
                className={styles.icon}
              />
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

            {/* Resources Have */}
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder=""
                value={resourcesHave}
                onChange={(e) => setResourcesHave(e.target.value)}
              />
              <label>Resources You Have (Comma Separated)</label>
            </div>

            {/* Resources Needed */}
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder=""
                value={resourcesNeeded}
                onChange={(e) => setResourcesNeeded(e.target.value)}
              />
              <label>Resources You Need (Comma Separated)</label>
            </div>

            {/* Profile Picture Upload */}
            <div className={styles.formGroup}>
              <button
                type="button"
                onClick={handleButtonClick}
                className={styles.uploadButton}
              >
                Upload Profile Picture
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                className={styles.hiddenFileInput}
              />
            </div>

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

            <button type="submit" className={styles.btn} disabled={isUploading}>
              {isUploading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className={styles.separator}>
            <span>OR</span>
          </div>

          <div className={styles.toggleAuth}>
            <p>Already have an account?</p>
            <button onClick={() => router.push('/login')}>Login Here</button>
          </div>
        </div>
        {showPopup && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md flex items-center space-x-2 animate-fade">
            <span>&#10003;</span>
            <span>Account Created</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
