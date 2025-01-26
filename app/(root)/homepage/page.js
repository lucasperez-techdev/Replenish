// app/homepage/page.js
'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from "../../../styles/Homepage.module.css";
import CompanyCard from '../../../components/CompanyCard';
import { collection, getDocs } from 'firebase/firestore';

const Homepage = () => {
  const [currentUser, setCurrentUser] = useState(null); // For authenticated user
  const [companies, setCompanies] = useState([]); // For list of companies
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

  // Fetch companies from Firestore
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesCollection = collection(db, 'users');
        const companiesSnapshot = await getDocs(companiesCollection);
        const companiesList = companiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCompanies(companiesList);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    if (currentUser) {
      fetchCompanies();
    }
  }, [currentUser]);

  if (!currentUser) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Welcome, {currentUser.displayName || 'User'}!
      </h1>
      <h2 className={styles.subtitle}>
        Potential Collaborators:
      </h2>
      <div className={styles.grid}>
        {companies.map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
};

export default Homepage;
