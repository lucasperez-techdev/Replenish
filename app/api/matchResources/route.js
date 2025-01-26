// app/api/matchResources/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import nodemailer from 'nodemailer';

/**
 * You’ll need environment variables:
 *   GMAIL_USER=<yourgmail>@gmail.com
 *   GMAIL_PASS=<your-gmail-app-password>
 *
 * or use any free email SMTP (Ethereal, etc.)
 * Then add them to your hosting environment so they are not exposed publicly.
 */

export async function POST(request) {
  try {
    const { newUser } = await request.json();
    if (!newUser) {
      return NextResponse.json(
        { error: 'newUser data not provided' },
        { status: 400 }
      );
    }

    // 1. Retrieve all existing users
    const snapshot = await getDocs(collection(db, 'users'));
    if (snapshot.empty) {
      return NextResponse.json({ message: 'No other users found' }, { status: 200 });
    }

    const existingUsers = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Skip the newly registered user themselves
      if (data.email !== newUser.email) {
        existingUsers.push(data);
      }
    });

    // 2. Create arrays for easier checking
    const newNeeded = newUser.resourcesNeeded || [];
    const newHave   = newUser.resourcesHave   || [];

    // 3. Prepare arrays of matches
    //    Each match = { matchedUserEmail, matchedData, reason } etc.
    const matches = [];

    // Check each existing user’s resources
    existingUsers.forEach((usr) => {
      const usrNeeded = usr.resourcesNeeded || [];
      const usrHave   = usr.resourcesHave   || [];

      // Condition A: The new user needs something that 'usr' has
      // intersection of (newNeeded) and (usrHave)
      const newNeedsTheirHaves = newNeeded.filter((r) => usrHave.includes(r));

      // Condition B: The new user has something that 'usr' needs
      // intersection of (newHave) and (usrNeeded)
      const newHasWhatTheyNeed = newHave.filter((r) => usrNeeded.includes(r));

      // If there are any matches, we’ll store them
      if (newNeedsTheirHaves.length > 0 || newHasWhatTheyNeed.length > 0) {
        matches.push({
          userEmail: usr.email,          // The existing user
          userBusinessName: usr.businessName,
          newUserEmail: newUser.email,   // The newly registered user
          newUserBusinessName: newUser.businessName,
          matchNeeded: newNeedsTheirHaves,   // new user’s needed resources that existing user has
          matchOffered: newHasWhatTheyNeed,  // new user’s offered resources that existing user needs
        });
      }
    });

    if (matches.length === 0) {
      return NextResponse.json({ message: 'No matching resources found' }, { status: 200 });
    }

    // 4. Configure Nodemailer with your free email (e.g. Gmail)
    //    Make sure you set up an "App Password" in your Gmail account settings.
    //    Or use another free SMTP like Ethereal.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // e.g. "myemail@gmail.com"
        pass: process.env.GMAIL_PASS, // "my-app-password"
      },
    });

    // 5. Send emails
    //    We’ll send an email to each existing user that has a match
    //    You could also send to the newly registered user about who can help them
    for (const m of matches) {
      // Construct the text of the email
      let textContent = `Hello ${m.userBusinessName},
A new company (“${m.newUserBusinessName}”) has registered with Zero-Sum and matches your resource needs/offers!

`;

      if (m.matchNeeded.length) {
        textContent += `They NEED the following resource(s) which you HAVE: ${m.matchNeeded.join(
          ', '
        )}\n`;
      }
      if (m.matchOffered.length) {
        textContent += `They OFFER the following resource(s) which you NEED: ${m.matchOffered.join(
          ', '
        )}\n`;
      }
      textContent += `\nFeel free to contact them at: ${m.newUserEmail}\n`;

      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: m.userEmail, // existing user’s email
          subject: 'New Resource Match Found!',
          text: textContent,
        });
        console.log(`Email sent to ${m.userEmail}`);
      } catch (error) {
        console.error('Error sending mail', error);
      }
    }

    // (Optional) Also notify the new user of all matches (who can help them)
    // For demonstration, we gather all relevant matches from the above
    // and send one single email to the new user.
    let newUserText = '';
    matches.forEach((m) => {
      // If the new user needs something that user has
      if (m.matchNeeded.length > 0) {
        newUserText += `- ${m.userBusinessName} can provide you: ${m.matchNeeded.join(', ')}\n`;
      }
      // If the new user offers something that user needs
      if (m.matchOffered.length > 0) {
        newUserText += `- ${m.userBusinessName} needs what you offer: ${m.matchOffered.join(', ')}\n`;
      }
    });
    if (newUserText) {
      const newUserEmailText = `Hello ${newUser.businessName},
Welcome to Zero-Sum! We've found some companies that match your resources:

${newUserText}

Feel free to reach out to them directly on Zero-Sum.
`;
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: newUser.email,
          subject: 'Companies Matching Your Resources',
          text: newUserEmailText,
        });
        console.log(`Email sent to new user ${newUser.email}`);
      } catch (error) {
        console.error('Error sending mail to new user', error);
      }
    }

    return NextResponse.json(
      { message: 'Match emails sent successfully.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in matchResources route', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
