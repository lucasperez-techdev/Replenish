// components/CompanyCard.js
'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../styles/CompanyCard.module.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const CompanyCard = ({ company }) => {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(true);
    setContactOpen(false); // Reset contact info when opening modal
  };

  const handleCloseModal = () => {
    setOpen(false);
    setContactOpen(false); // Reset contact info when closing modal
  };

  const toggleContactInfo = () => {
    setContactOpen(!contactOpen);
  };

  return (
    <>
      <div className={styles.card} onClick={handleOpenModal}>
        <div className={styles.profilePicture}>
          {company.profilePicture ? (
            <Image
              src={company.profilePicture}
              alt={`${company.businessName} Profile`}
              width={80}
              height={80}
              className={styles.profileImage}
            />
          ) : (
            <div className={styles.placeholderImage}></div>
          )}
        </div>
        <h3 className={styles.companyName}>{company.businessName}</h3>
      </div>

      {/* Modal Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
        aria-labelledby={`dialog-title-${company.id}`}
        classes={{ paper: styles.dialogPaper }}
      >
        <DialogTitle id={`dialog-title-${company.id}`} className={styles.dialogTitle}>
          {company.businessName}
        </DialogTitle>
        <DialogContent dividers>
          {/* Profile Picture */}
          <div className={styles.modalProfilePicture}>
            {company.profilePicture ? (
              <Image
                src={company.profilePicture}
                alt={`${company.businessName} Profile`}
                width={100}
                height={100}
                className={styles.modalProfileImage}
              />
            ) : (
              <div className={styles.modalPlaceholderImage}></div>
            )}
          </div>

          {/* Resources Needed */}
          <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
            Resources Needed
          </Typography>
          <List dense className={styles.list}>
            {company.resourcesNeeded && company.resourcesNeeded.length > 0 ? (
              company.resourcesNeeded.map((resource, index) => (
                <ListItem key={index} className={styles.listItem}>
                  <ListItemText primary={`• ${resource}`} />
                </ListItem>
              ))
            ) : (
              <ListItem className={styles.listItem}>
                <ListItemText primary="No resources needed." />
              </ListItem>
            )}
          </List>

          {/* Resources to Offer */}
          <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
            Resources to Offer
          </Typography>
          <List dense className={styles.list}>
            {company.resourcesHave && company.resourcesHave.length > 0 ? (
              company.resourcesHave.map((resource, index) => (
                <ListItem key={index} className={styles.listItem}>
                  <ListItemText primary={`• ${resource}`} />
                </ListItem>
              ))
            ) : (
              <ListItem className={styles.listItem}>
                <ListItemText primary="No resources to offer." />
              </ListItem>
            )}
          </List>

          {/* Toggle Contact Information */}
          <div className={styles.contactToggle}>
            <Button
              variant="outlined"
              startIcon={contactOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={toggleContactInfo}
              className={styles.contactButton}
            >
              {contactOpen ? 'Hide Contact Information' : 'Show Contact Information'}
            </Button>
            <Collapse in={contactOpen}>
              <div className={styles.contactInfo}>
                <Typography variant="body1">
                  <strong>Email:</strong> {company.email || 'N/A'}
                </Typography>
                <Typography variant="body1">
                  <strong>Phone:</strong> {company.phoneNumber || 'N/A'}
                </Typography>
              </div>
            </Collapse>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary" className={styles.closeButton}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompanyCard;
