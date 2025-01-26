'use client'

import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePicture: "",
    businessName: "",
    resourcesNeeded: [],
    resourcesHave: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newResourceNeeded, setNewResourceNeeded] = useState("");
  const [newResourceHave, setNewResourceHave] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // NEW: Controls whether our delete confirmation modal is visible
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fileInputRef = useRef(null);
  const storage = getStorage();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({
            ...profile,
            ...docSnap.data(),
            resourcesNeeded: docSnap.data().resourcesNeeded || [],
            resourcesHave: docSnap.data().resourcesHave || [],
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddResourceNeeded = () => {
    if (newResourceNeeded.trim() !== "") {
      setProfile((prev) => ({
        ...prev,
        resourcesNeeded: [...(prev.resourcesNeeded || []), newResourceNeeded],
      }));
      setNewResourceNeeded("");
    }
  };

  const handleAddResourceHave = () => {
    if (newResourceHave.trim() !== "") {
      setProfile((prev) => ({
        ...prev,
        resourcesHave: [...(prev.resourcesHave || []), newResourceHave],
      }));
      setNewResourceHave("");
    }
  };

  const handleRemoveResourceNeeded = (index) => {
    setProfile((prev) => ({
      ...prev,
      resourcesNeeded: (prev.resourcesNeeded || []).filter((_, i) => i !== index),
    }));
  };

  const handleRemoveResourceHave = (index) => {
    setProfile((prev) => ({
      ...prev,
      resourcesHave: (prev.resourcesHave || []).filter((_, i) => i !== index),
    }));
  };

  const handleProfilePictureUpload = async () => {
    if (profilePictureFile && user) {
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, profilePictureFile);
      const downloadURL = await getDownloadURL(storageRef);
      setProfile((prev) => ({ ...prev, profilePicture: downloadURL }));
    }
  };

  const handleSave = async () => {
    if (user) {
      setSaving(true);
      const docRef = doc(db, "users", user.uid);
      try {
        // If file input changed, upload new profile picture
        if (profilePictureFile) {
          await handleProfilePictureUpload();
        }
        const updatedProfile = {
          ...profile,
          resourcesNeeded: profile.resourcesNeeded || [],
          resourcesHave: profile.resourcesHave || [],
        };
        await setDoc(docRef, updatedProfile, { merge: true });
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 1000);
      } catch (error) {
        console.error("Error updating profile: ", error);
        alert("Failed to update profile. Please try again.");
      } finally {
        setSaving(false);
      }
    }
  };

  // Triggered when user clicks "Confirm Delete" in the modal
  const handleConfirmDelete = async () => {
    try {
      if (user) {
        // 1. Delete the user document from Firestore
        await deleteDoc(doc(db, "users", user.uid));

        // 2. Delete the user from Firebase Auth
        await deleteUser(user);

        // 3. Redirect (e.g. back to register or homepage)
        router.push("/register");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Unable to delete your account. Please try again or contact support.");
    } finally {
      // Close modal if needed (or you can keep it closed by redirect)
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <div className="space-y-4">
        {/* --------------------- PROFILE FORM --------------------- */}
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Company/Org</label>
          <input
            type="text"
            name="businessName"
            value={profile.businessName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleButtonClick}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Upload Profile Picture
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setProfilePictureFile(e.target.files[0])}
              className="hidden"
            />
            {profile.profilePicture && (
              <img
                src={profile.profilePicture}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover border border-gray-300"
              />
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Resources Needed</label>
          <div className="space-y-2">
            {(profile.resourcesNeeded || []).map((resource, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="flex-1">{resource}</span>
                <button
                  onClick={() => handleRemoveResourceNeeded(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={newResourceNeeded}
              onChange={(e) => setNewResourceNeeded(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
            <button
              onClick={handleAddResourceNeeded}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Add
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Resources Have</label>
          <div className="space-y-2">
            {(profile.resourcesHave || []).map((resource, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="flex-1">{resource}</span>
                <button
                  onClick={() => handleRemoveResourceHave(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={newResourceHave}
              onChange={(e) => setNewResourceHave(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
            <button
              onClick={handleAddResourceHave}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Add
            </button>
          </div>
        </div>
        {/* --------------------- SAVE CHANGES BUTTON --------------------- */}
        <button
          onClick={handleSave}
          className={`px-4 py-2 text-white font-semibold rounded-lg focus:outline-none focus:ring focus:ring-blue-300 ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          disabled={saving}
        >
          {saving ? (
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Saving...</span>
            </div>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
        {showPopup && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md flex items-center space-x-2 animate-fade">
            <span>&#10003;</span>
            <span>Changes saved</span>
          </div>
        )}
      </div>

      {/* --------------------- DELETE ACCOUNT BUTTON --------------------- */}
      <div className="mt-8">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300"
        >
          Delete Account
        </button>
      </div>

      {/* --------------------- DELETE CONFIRMATION MODAL --------------------- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {/* MODAL CARD */}
          <div className="bg-white p-6 rounded shadow-md max-w-md w-full mx-2">
            <h2 className="text-xl font-bold mb-4 text-center">
              Are you sure?
            </h2>
            <p className="mb-6 text-center">
              Deleting your account is <strong>irreversible</strong> and will remove all of your data. Do you wish to continue?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
