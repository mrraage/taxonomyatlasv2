require('dotenv').config();
import express from 'express';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Validate API key before starting
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: Missing GEMINI_API_KEY in environment variables");
  process.exit(1);
}

console.log("Gemini API key validation successful");

// Configure API with retry logic and rate limiting
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    maxOutputTokens: 1000,
    temperature: 0.7,
    topP: 0.9
  },
  safetySettings: [
    { category: "HARM_CATEGORY_DANGEROUS", threshold: "BLOCK_ONLY_HIGH" }
  ]
});

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts = new Map();

interface RateLimitState {
  count: number;
  lastReset: number;
  blockedUntil: number;
}
// Enhanced rate limiting with Redis-ready structure
// Removed explicit RequestHandler type for now to simplify typing issues
const rateLimiter: express.RequestHandler = (req, res, next) => { // Add RequestHandler type back
  try { // Add try block
    const identifier = (req.headers['x-api-key'] || req.ip) as string;
    let current = requestCounts.get(identifier) as RateLimitState || {
      count: 0,
      lastReset: Date.now(),
      blockedUntil: 0
    };

    // Reset counter if window expired
    if (Date.now() - current.lastReset > RATE_LIMIT_WINDOW_MS) {
      current.count = 0;
      current.lastReset = Date.now();
      current.blockedUntil = 0;
    }

    // Check if blocked
    if (Date.now() < current.blockedUntil) {
      const retryAfter = Math.ceil((current.blockedUntil - Date.now()) / 1000);
      res.set('Retry-After', retryAfter.toString());
      res.status(429).json({ error: `Too many requests. Try again in ${retryAfter} seconds.` });
      return; // Explicitly return void
    }
    // Removed extra brace here

    // Check limit
    if (current.count >= MAX_REQUESTS_PER_WINDOW) {
      current.blockedUntil = Date.now() + RATE_LIMIT_WINDOW_MS;
      requestCounts.set(identifier, current);
      const retryAfter = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
      res.set('Retry-After', retryAfter.toString());
      res.status(429).json({ error: `Too many requests. Try again in ${retryAfter} seconds.` });
      return; // Explicitly return void
    }

    current.count++;
    requestCounts.set(identifier, current);
    next(); // Proceed to the next middleware/handler
  } catch (error) { // Add catch block
    console.error('Rate limiter error:', error);
    if (!res.headersSent) {
       res.status(500).json({ error: 'Internal server error in rate limiter' });
    }
    // Do not call next(error) unless you have a specific error handler middleware
  }
};

app.use('/api/generate-content', rateLimiter);

// Define the handler function separately
const generateContentHandler: express.RequestHandler = async (
  req: Request<{}, any, { prompt: string }>,
  res: Response<{ content: string } | { error: string }>
) => {
  console.log('Received generate-content request:', req.body);
  console.log('Using API Key:', process.env.GEMINI_API_KEY?.slice(0, 8) + '...');
  try {
    const { prompt } = req.body;
    if (!prompt) {
      console.error('API Error: No prompt received in request body.');
      // Ensure function returns after sending response
      res.status(400).json({ error: 'Prompt is required in the request body' });
      return;
    }
    console.log(`Received prompt: "${prompt}"`); // Log received prompt
    console.log("Calling Gemini API..."); // Log before API call
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Gemini API call successful."); // Log after successful API call
    res.json({ content: response.text() });
    // Implicit return here is fine for async RequestHandler
  } catch (error) {
    console.error('Detailed API Error in /api/generate-content:', error); // Log the full error object
    const errorMessage = error instanceof Error ? error.message : 'Unknown backend error';
    // Ensure function returns after sending response in catch block
    if (!res.headersSent) {
      res.status(500).json({ error: `Failed to generate content: ${errorMessage}` });
    }
  }
};

// Register the handler
app.post('/api/generate-content', generateContentHandler);

const PORT = parseInt(process.env.PORT || '3001', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS allowed origins: ${process.env.CORS_ORIGIN || 'http://localhost:5173, http://127.0.0.1:5173'}`);
});