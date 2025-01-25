// app/page.js
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/homepage');
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <p>Loading...</p>;
};

export default Home;
