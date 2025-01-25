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
      console.log('Calling Gemini API with endpoint:', endpoint);
  
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
        console.error('Error response from Gemini API:', response.statusText);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Log the entire response to debug
      console.log('Response from Google Gemini API:', JSON.stringify(data, null, 2));
  
      // Extract the response text
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
  
      return res.status(200).json({ response: botResponse });
    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch response from Gemini' });
    }
  }
  