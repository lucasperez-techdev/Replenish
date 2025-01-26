// app/homepage/page.js
'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from "../../../styles/Homepage.module.css";

const Homepage = () => {
  const [currentUser, setCurrentUser] = useState(null); // For authenticated user
  const [users, setUsers] = useState([]); // For list of users
  const router = useRouter();

  // Handle authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const users = [
      {
        id: 1,
        name: 'MLH',
        resourcesNeeded: ['Financial Assistance', 'Business Mentorship'],
        resourcesToOffer: ['Marketing Skills', 'Networking Opportunities'],
      },
      {
        id: 2,
        name: 'Converse',
        resourcesNeeded: ['Web Development', 'SEO Optimization'],
        resourcesToOffer: ['Graphic Design', 'Content Creation'],
      },
      {
        id: 3,
        name: 'Path To College',
        resourcesNeeded: ['Legal Advice', 'Fundraising Strategies'],
        resourcesToOffer: ['Event Planning', 'Project Management'],
      },
      {
        id: 4,
        name: 'Surefoot',
        resourcesNeeded: ['Product Prototyping', 'Market Research'],
        resourcesToOffer: ['Sales Expertise', 'Customer Insights'],
      },
      {
        id: 5,
        name: 'Bundle IQ',
        resourcesNeeded: ['Technical Support', 'Data Analysis'],
        resourcesToOffer: ['Social Media Management', 'Brand Strategy'],
      },
      {
        id: 6,
        name: 'Target',
        resourcesNeeded: ['Team Building', 'Leadership Coaching'],
        resourcesToOffer: ['Training Programs', 'Operational Processes'],
      },
    ];
    setUsers(users);
  }, []);

  if (!currentUser) return <p>Loading...</p>;

  // Function to render user cards
  const renderUserCards = (users) => {
    return users.map((user) => (
    <div key={user.id} className={styles.card}>
      {/* Profile Picture */}
      <div className={styles.profilePicture}></div>
      <div className={styles.cardContent}>
        {/* Company Name */}
        <h3>{user.name}</h3>
        {/* Resources Lists */}
        <div>
          <h4>Resources Needed:</h4>
          <ul>
            {user.resourcesNeeded.map((resource, index) => (
              <li key={index}>{resource}</li>
            ))}
          </ul>
          <h4>Resources to Offer:</h4>
          <ul>
            {user.resourcesToOffer.map((resource, index) => (
              <li key={index}>{resource}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    ));
  };

  return (
    <div className={styles.container}>
    <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
      Welcome, {currentUser.displayName || 'User'}!
    </h1>
    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
      Potential traders:
    </h2>
    <div className={styles.grid}>{renderUserCards(users)}</div>
  </div>
  );
};

export default Homepage;
