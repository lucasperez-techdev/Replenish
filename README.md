# Zero-Sum Game
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)

## Introduction

ZSG is a barter system inspired web app that dynamically connects businesses so that they can trade any excess goods/resources. This benefits businesses because it helps them gain the resources they need by giving them resources that they don't have, hence the Zero-Sum aspect of the project. This project aims to allow businesses to interact with each other in a positive environment-friendly way so that everyone benefits and no one loses. It is built using React.js 19, Next.js 15, Firebase, Google Gemini, Node emailer, TailwindCSS, and of course HTML/CSS/Javascript.

## Features

1. User Authentication: We implemented an intuitive Login/Register page that interacts with Firebase on the backend to dynamically update user information. User authentication also includes an emailing feature for new and current users that notifies them when they join and when someone joins that have resources that they need. Forget password functionality also works on the Login page.
2. Home Page: We have multiple major features on the Home Page!
        - Profile/Company cards: Profile cards are the biggest part of our home page! This feature shows all the companies and users that have registered with our web app. When you click on the cards, you can see a detailed description of each company with information like their phone number, email, resources that they need, resources that they have, and also!!! We added a server-side live chat between companies where they can interact with each other seamlessly.
        - Gemini AI Chatbot: We implemented a chatbot powered by Google's Gemini AI that allows users to interact and ask questions about sustainability, the environment, and the human experience. There are a lot of questions that you can ask the bot but one that we find the most helpful is asking what companies have the resources that you (as a company) need.
        - Navbar: The navbar includes the option to go back to the home page, go to your profile and update it, or log out of your account. This feature is a core piece of making the website functional for users and lets them explore the entirety of the tool. When you log out of your account you are redirected to the login page, and because of our Firebase implementation, your profile information is saved for you to log in again!
3. Profile Management: On this page, the user can update all aspects of their profile. This includes their contact information, profile picture, name, and needs/goods and services. Once the user saves their information to update their profile, their card on the home page will automatically update as well. 

## Installation

To set up Replenish locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/lucasperez-techdev/Replenish.git
   cd Replenish
   ```
   
2.	**Install dependencies:**
   
   ```bash
   npm install
   ```

 3. **Set up environment variables:**
  Create a .env file in the root directory and add the necessary environment variables:
  (Given that this is a most likely going to be a hosted website this is not as important)

  ```env
  GEMINI_API_KEY=[value]
  ```

  4. **Start the application:**
  This can be done with npm, yarn, or any other package manager for JS
  ```bash
  npm run dev
  ```
