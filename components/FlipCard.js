// components/FlipCard.js
'use client';

import { useState } from 'react';
import styles from '../styles/FlipCard.module.css';
import Image from 'next/image';

const FlipCard = ({ user }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
    setShowContact(false); // Reset contact info when flipping
  };

  const handleContactClick = (e) => {
    e.stopPropagation(); // Prevent card flip
    setShowContact(!showContact);
  };

  return (
    <div className={styles.flipCard} onClick={handleCardClick}>
      <div className={`${styles.flipCardInner} ${isFlipped ? styles.flipped : ''}`}>
        {/* Front Side */}
        <div className={styles.flipCardFront}>
          <div className={styles.profilePicture}>
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={`${user.businessName} Profile`}
                width={80}
                height={80}
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.placeholderImage}></div>
            )}
          </div>
          <h3>{user.businessName}</h3>
        </div>

        {/* Back Side */}
        <div className={styles.flipCardBack}>
          <h4>Resources Needed:</h4>
          <ul>
            {user.resourcesNeeded && user.resourcesNeeded.map((resource, index) => (
              <li key={index}>{resource}</li>
            ))}
          </ul>
          <h4>Resources to Offer:</h4>
          <ul>
            {user.resourcesHave && user.resourcesHave.map((resource, index) => (
              <li key={index}>{resource}</li>
            ))}
          </ul>
          <button
            className={styles.contactButton}
            onClick={handleContactClick}
          >
            {showContact ? 'Hide Contact Info' : 'Show Contact Info'}
          </button>
          {showContact && (
            <div className={styles.contactInfo}>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phoneNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
