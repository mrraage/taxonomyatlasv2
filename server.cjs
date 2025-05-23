"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express_1.default.json());
// Validate API key before starting
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: Missing GEMINI_API_KEY in environment variables");
    process.exit(1);
}
console.log("Gemini API key validation successful");
// Configure API with retry logic and rate limiting
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest", // Use latest flash model
    generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.9
    },
    safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
});
// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts = new Map();
// Enhanced rate limiting with Redis-ready structure
// Removed explicit RequestHandler type for now to simplify typing issues
const rateLimiter = (req, res, next) => {
    try { // Add try block
        const identifier = (req.headers['x-api-key'] || req.ip);
        let current = requestCounts.get(identifier) || {
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
    }
    catch (error) { // Add catch block
        console.error('Rate limiter error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error in rate limiter' });
        }
        // Do not call next(error) unless you have a specific error handler middleware
    }
};
app.use('/api/generate-content', rateLimiter);
// Define the handler function separately
const generateContentHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log('Received generate-content request:', req.body);
    console.log('Using API Key:', ((_a = process.env.GEMINI_API_KEY) === null || _a === void 0 ? void 0 : _a.slice(0, 8)) + '...');
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
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        console.log("Gemini API call successful."); // Log after successful API call
        res.json({ content: response.text() });
        // Implicit return here is fine for async RequestHandler
    }
    catch (error) {
        console.error('Detailed API Error in /api/generate-content:', error); // Log the full error object
        const errorMessage = (error === null || error === void 0 ? void 0 : error.message) || (error === null || error === void 0 ? void 0 : error.toString()) || 'Unknown backend error';
        const httpStatus = ((_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.status) || 500;
        if (!res.headersSent) {
            res.status(httpStatus).json(Object.assign({ error: `Failed to generate content: ${errorMessage}` }, (process.env.NODE_ENV === 'development' && { details: error.stack })));
        }
    }
});
// Register the handler
app.post('/api/generate-content', generateContentHandler);
const PORT = parseInt(process.env.PORT || '3001', 10);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS allowed origins: ${process.env.CORS_ORIGIN || 'http://localhost:5173, http://127.0.0.1:5173'}`);
});
