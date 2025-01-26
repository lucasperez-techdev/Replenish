import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    let match = message.match(/who has (.+?)\?|what business has (.+?)\?/i);
    const requestedResource = match ? (match[1] || match[2]).trim() : null;

    let userDataSummary = "No relevant data found in the database.";

    if (requestedResource) {
      console.log('Requested Resource:', requestedResource);

      const q = query(
        collection(db, 'users'),
        where('resourcesHave', 'array-contains', requestedResource)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const matchingUsers = [];
        querySnapshot.forEach((doc) => {
          const user = doc.data();
          matchingUsers.push({
            name: `${user.businessName}`,
            resourcesHave: user.resourcesHave,
            resourcesNeeded: user.resourcesNeeded,
          });
        });

        userDataSummary = matchingUsers
          .map(
            (user) =>
              `${user.name} has: ${user.resourcesHave.join(', ')} and needs: ${user.resourcesNeeded.join(', ')}.`
          )
          .join('\n');
      } else {
        userDataSummary = `No users found with the resource: "${requestedResource}".`;
      }
    }

    const customPrompt = `
      The following is the list of user data from the database:
      ${userDataSummary}

      User Question: "${message}"

      If the database contains relevant information, answer the question using it. If not, politely inform the user that the requested resource is not available.
    `;

    console.log('Custom Prompt Sent to Gemini:', customPrompt);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: customPrompt }] }],
      }),
    });

    if (!response.ok) {
      console.error('Error response from Gemini API:', response.statusText);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('AI Response:', JSON.stringify(data, null, 2));

    const botResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

    return res.status(200).json({ response: botResponse });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch response from Gemini' });
  }
}
