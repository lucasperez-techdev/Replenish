export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { message } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
  
    const API_KEY = process.env.GEMINI_API_KEY; // Use environment variable for security
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
  
      const data = await response.json();
      const botResponse = data.contents[0]?.parts[0]?.text || 'No response from AI';
  
      return res.status(200).json({ response: botResponse });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to fetch response from Gemini' });
    }
  }
  