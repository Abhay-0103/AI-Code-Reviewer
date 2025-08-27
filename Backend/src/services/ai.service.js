// aiService.js
// -----------------------------------------------------------------------------
// Gemini AI Service - Production Grade
// -----------------------------------------------------------------------------
// Responsibilities:
//  - Initialize Google Generative AI client once per process
//  - Provide a safe, reliable wrapper around Gemini's `generateContent`
//  - Enforce best practices: env validation, retries, error handling
//  - Keep future developers in mind: clear, documented, maintainable
// -----------------------------------------------------------------------------

"use strict";

const { GoogleGenerativeAI } = require("@google/generative-ai");

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_KEY) {
  throw new Error("❌ Configuration Error: Missing GEMINI_API_KEY in environment variables");
}

const MODEL_NAME = "gemini-2.5-flash";

// Retry policy: exponential backoff
const RETRY_ATTEMPTS = 3;
const INITIAL_DELAY_MS = 500;

// -----------------------------------------------------------------------------
// Initialize Gemini Client (singleton)
// -----------------------------------------------------------------------------

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  systemInstruction: `
AI Senior Code Reviewer (Polyglot, 50+ Years Experience)
🎯 Responsibilities

You are a highly experienced senior engineer tasked with reviewing and improving code.
Your focus spans across:

• Code Quality — Clean, modular, future-proof.
• Best Practices — Align with language & industry standards.
• Performance — Optimized algorithms, memory, and runtime.
• Error Detection — Identify hidden bugs & logical flaws.
• Security — Guard against injections, overflows, unsafe patterns.
• Scalability — Extensible and maintainable structures.
• Readability — Easy for others to follow and extend.

📏 Guidelines
- Provide constructive feedback, always explaining "why".
- Suggest improved or refactored code where relevant.
- Optimize redundant or inefficient logic.
- Enforce security and input safety.
- Promote DRY, SOLID, and KISS principles.
- Recommend modern practices where appropriate.

🗣️ Tone & Approach
- Professional, precise, and actionable.
- Supportive and constructive; highlight strengths as well as weaknesses.
`
});

// -----------------------------------------------------------------------------
// Utility: Exponential Backoff with Retries
// -----------------------------------------------------------------------------

async function withRetry(taskFn, retries = RETRY_ATTEMPTS, delay = INITIAL_DELAY_MS) {
  try {
    return await taskFn();
  } catch (err) {
    if (retries <= 0) throw err;

    console.warn(
      `⚠️ AI Service transient error: ${err.message}. ` +
      `Retries remaining: ${retries}. Next attempt in ${delay}ms`
    );

    await new Promise(res => setTimeout(res, delay));
    return withRetry(taskFn, retries - 1, delay * 2); // exponential backoff
  }
}

// -----------------------------------------------------------------------------
// Public API: aiService(prompt)
// -----------------------------------------------------------------------------

/**
 * Generate AI response for a given prompt
 * @param {string} prompt - The developer prompt to review or analyze.
 * @returns {Promise<string>} - Resolved AI text response.
 * @throws {Error} - If the service fails after retries.
 */
async function aiService(prompt) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("❌ Invalid input: Prompt must be a non-empty string");
  }

  return withRetry(async () => {
    const response = await model.generateContent(prompt);

    // Safely extract the text response
    const output = response?.response?.text?.();
    if (!output) {
      throw new Error("❌ AI Service Error: No valid text returned from Gemini");
    }

    return output.trim();
  });
}

module.exports = aiService;
