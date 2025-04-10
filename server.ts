require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Log the key value (for debugging ONLY - remove/comment out in production)
console.log("Attempting to use Gemini API Key:", process.env.GEMINI_API_KEY ? "Loaded" : "NOT LOADED or EMPTY");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Use standard env var name
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/generate-content', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      console.error('API Error: No prompt received in request body.');
      return res.status(400).json({ error: 'Prompt is required in the request body' });
    }
    console.log(`Received prompt: "${prompt}"`); // Log received prompt
    console.log("Calling Gemini API..."); // Log before API call
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Gemini API call successful."); // Log after successful API call
    res.json({ content: response.text() });
  } catch (error) {
    console.error('Detailed API Error in /api/generate-content:', error); // Log the full error object
    // Check if the error object has more details, e.g., error.message
    const errorMessage = error instanceof Error ? error.message : 'Unknown backend error';
    res.status(500).json({ error: `Failed to generate content: ${errorMessage}` }); // More specific error message
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});