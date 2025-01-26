// app/root/profile/page.js
'use client'

import React, { useState, useEffect } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfilePage() {
	const [user, setUser] = useState(null);
	const [profile, setProfile] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		profilePicture: "",
		resourcesNeeded: [],
		resourcesHave: [],
	});
	const [loading, setLoading] = useState(true);
	const [newResourceNeeded, setNewResourceNeeded] = useState("");
	const [newResourceHave, setNewResourceHave] = useState("");
	const [profilePictureFile, setProfilePictureFile] = useState(null);

	const storage = getStorage();

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
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setProfile((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddResourceNeeded = () => {
		if (newResourceNeeded.trim() !== "") {
			setProfile((prev) => ({ ...prev, resourcesNeeded: [...(prev.resourcesNeeded || []), newResourceNeeded] }));
			setNewResourceNeeded("");
		}
	};

	const handleAddResourceHave = () => {
		if (newResourceHave.trim() !== "") {
			setProfile((prev) => ({ ...prev, resourcesHave: [...(prev.resourcesHave || []), newResourceHave] }));
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
			const docRef = doc(db, "users", user.uid);
			try {
				const updatedProfile = {
					...profile,
					resourcesNeeded: profile.resourcesNeeded || [],
					resourcesHave: profile.resourcesHave || [],
				};
				await setDoc(docRef, updatedProfile, { merge: true });
				alert("Profile updated successfully!");
			} catch (error) {
				console.error("Error updating profile: ", error);
				alert("Failed to update profile. Please try again.");
			}
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
					<input
						type="file"
						accept="image/*"
						onChange={(e) => setProfilePictureFile(e.target.files[0])}
						className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
					/>
					<button
						onClick={handleProfilePictureUpload}
						className="mt-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
					>
						Upload Picture
					</button>
					{profile.profilePicture && (
						<img
							src={profile.profilePicture}
							alt="Profile"
							className="mt-4 w-32 h-32 rounded-full object-cover"
						/>
					)}
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
				<button
					onClick={handleSave}
					className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
				>
					Save Changes
				</button>
			</div>
		</div>
	);
}

