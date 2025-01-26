// app/homepage/page.js
'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from "../../../styles/Homepage.module.css";
import FlipCard from '../../../components/FlipCard';
import { collection, getDocs } from 'firebase/firestore';

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

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  if (!currentUser) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Welcome, {currentUser.displayName || 'User'}!
      </h1>
      <h2 className={styles.subtitle}>
        Potential traders:
      </h2>
      <div className={styles.grid}>
        {users.map(user => (
          <FlipCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default Homepage;
