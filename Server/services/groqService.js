const { AppError } = require("../utils/errorBuilder");

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

if (!GROQ_API_KEY) {
  throw new AppError("GROQ_API_KEY is not set in environment variables", 500);
}

// Rate limiting: Track request counts per minute
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 20; // Max requests per minute

/**
 * Check and enforce rate limiting
 */
const checkRateLimit = () => {
  const now = Date.now();
  const clientId = "global";

  if (!rateLimitStore.has(clientId)) {
    rateLimitStore.set(clientId, { count: 0, resetTime: now + RATE_LIMIT_WINDOW });
  }

  const { count, resetTime } = rateLimitStore.get(clientId);

  // Reset if window has passed
  if (now > resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return;
  }

  // Check if limit exceeded
  if (count >= RATE_LIMIT_MAX_REQUESTS) {
    const waitTime = Math.ceil((resetTime - now) / 1000);
    throw new AppError(
      `Rate limit exceeded. Please try again in ${waitTime} seconds.`,
      429
    );
  }

  // Increment counter
  rateLimitStore.set(clientId, { count: count + 1, resetTime });
};

/**
 * Make API call to Groq with retry logic and timeout
 * @param {string} prompt - The prompt to send to Groq
 * @param {number} retries - Number of retries (default: 2)
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<string>} - The response from Groq
 */
const callGroq = async (prompt, retries = 2, timeout = 30000) => {
  if (!prompt || typeof prompt !== "string") {
    throw new AppError("Invalid prompt: must be a non-empty string", 400);
  }

  // Check rate limiting
  checkRateLimit();

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            model: GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 2000,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new AppError(
            `Groq API error (${response.status}): ${
              error.error?.message || "Unknown error"
            }`,
            response.status
          );
        }

        const data = await response.json();

        // Validate response structure
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          throw new AppError("Invalid response structure from Groq API", 500);
        }

        const content = data.choices[0].message?.content?.trim();

        if (!content) {
          throw new AppError("Empty response content from Groq API", 500);
        }

        return content;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
          throw new AppError(
            `Groq API call timed out after ${timeout}ms`,
            504
          );
        }
        throw error;
      }
    } catch (error) {
      lastError = error;

      // Don't retry on validation or rate limit errors
      if (error.statusCode === 400 || error.statusCode === 429) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === retries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // If we get here, all retries failed
  const errorMessage = lastError?.message || "Failed to call Groq API";
  throw new AppError(
    `Groq API error after ${retries + 1} attempts: ${errorMessage}`,
    500
  );
};

/**
 * Generate interview questions based on parameters
 * @param {object} params - Parameters for question generation
 * @returns {Promise<object>} - Object with questions array
 */
const generateQuestions = async (params) => {
  const {
    jobRole,
    experienceLevel,
    interviewType,
    difficultyLevel,
    numberOfQuestions = 5,
  } = params;

  if (!jobRole || !experienceLevel || !interviewType || !difficultyLevel) {
    throw new AppError(
      "Missing required parameters for question generation",
      400
    );
  }

  const prompt = `You are an expert technical interviewer. Generate ${numberOfQuestions} interview questions based on the following criteria:

Job Role: ${jobRole}
Experience Level: ${experienceLevel}
Interview Type: ${interviewType}
Difficulty Level: ${difficultyLevel}

Return ONLY a valid JSON object with this exact structure (no additional text):
{
  "questions": ["question1", "question2", "question3", ...]
}

Ensure:
- Each question is specific to the job role
- Questions match the difficulty and experience level
- Interview type questions (technical, behavioral, or mixed)
- Questions are clear and well-formatted`;

  try {
    const response = await callGroq(prompt);
    const parsed = parseGroqResponse(response);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new AppError("Invalid response format from Groq", 500);
    }

    if (parsed.questions.length !== numberOfQuestions) {
      throw new AppError(
        `Expected ${numberOfQuestions} questions, got ${parsed.questions.length}`,
        500
      );
    }

    return parsed;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new AppError(`Failed to generate questions: ${error.message}`, 500);
  }
};

/**
 * Evaluate a single answer
 * @param {object} params - Parameters for evaluation
 * @returns {Promise<object>} - Evaluation feedback
 */
const evaluateAnswer = async (params) => {
  const {
    question,
    answer,
    jobRole,
    experienceLevel,
    difficultyLevel,
  } = params;

  if (!question || !answer || !jobRole) {
    throw new AppError("Missing required parameters for evaluation", 400);
  }

  const prompt = `You are an expert technical interviewer evaluating a candidate's response.

Job Role: ${jobRole}
Experience Level: ${experienceLevel || "mid"}
Difficulty Level: ${difficultyLevel || "medium"}

Question: ${question}
Candidate's Answer: ${answer}

Provide a detailed evaluation and return ONLY a valid JSON object with this exact structure (no additional text):
{
  "score": number (0-10),
  "strengths": "key strengths of the answer",
  "weaknesses": "areas for improvement",
  "suggestions": "specific suggestions to improve the answer",
  "modelAnswer": "a concise ideal answer to the question"
}`;

  try {
    const response = await callGroq(prompt);
    const parsed = parseGroqResponse(response);

    if (
      typeof parsed.score !== "number" ||
      parsed.score < 0 ||
      parsed.score > 10
    ) {
      throw new AppError("Invalid score from Groq response", 500);
    }

    return {
      score: parsed.score,
      strengths: parsed.strengths || "",
      weaknesses: parsed.weaknesses || "",
      suggestions: parsed.suggestions || "",
      modelAnswer: parsed.modelAnswer || "",
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new AppError(`Failed to evaluate answer: ${error.message}`, 500);
  }
};

/**
 * Generate comprehensive final evaluation
 * @param {object} params - Parameters for final evaluation
 * @returns {Promise<object>} - Complete evaluation with tips
 */
const generateFinalEvaluation = async (params) => {
  const {
    jobRole,
    experienceLevel,
    interviewType,
    questionsAndAnswers = [],
    scores = [],
  } = params;

  if (!jobRole || questionsAndAnswers.length === 0) {
    throw new AppError(
      "Missing required parameters for final evaluation",
      400
    );
  }

  const averageScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const formattedQA = questionsAndAnswers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join("\n\n");

  const prompt = `You are an expert technical interviewer conducting a comprehensive final evaluation.

Job Role: ${jobRole}
Experience Level: ${experienceLevel}
Interview Type: ${interviewType}
Average Score: ${averageScore}/10

Interview Q&A:
${formattedQA}

Provide a comprehensive final evaluation and return ONLY a valid JSON object with this exact structure (no additional text):
{
  "score": number (0-100),
  "strengths": "overall key strengths across all answers",
  "weaknesses": "overall areas needing improvement",
  "suggestions": "specific actionable suggestions for improvement",
  "interviewTips": "tips for succeeding in future interviews for this role"
}

Ensure the score is a whole number between 0-100.`;

  try {
    const response = await callGroq(prompt);
    const parsed = parseGroqResponse(response);

    if (
      typeof parsed.score !== "number" ||
      parsed.score < 0 ||
      parsed.score > 100
    ) {
      throw new AppError("Invalid final score from Groq response", 500);
    }

    return {
      score: parsed.score,
      strengths: parsed.strengths || "",
      weaknesses: parsed.weaknesses || "",
      suggestions: parsed.suggestions || "",
      interviewTips: parsed.interviewTips || "",
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new AppError(
      `Failed to generate final evaluation: ${error.message}`,
      500
    );
  }
};

/**
 * Safely parse Groq response JSON
 * @param {string} response - The response string from Groq
 * @returns {object} - Parsed JSON object
 */
const parseGroqResponse = (response) => {
  try {
    // Extract JSON from response (handles cases where Groq might add extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError("No JSON found in Groq response", 500);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new AppError(
      `Failed to parse Groq response as JSON: ${error.message}`,
      500
    );
  }
};

/**
 * Determine adaptive difficulty based on previous score
 * @param {number} previousScore - Score from previous interview (0-100)
 * @param {string} currentDifficulty - Current difficulty level
 * @returns {string} - New difficulty level
 */
const getAdaptiveDifficulty = (previousScore, currentDifficulty) => {
  if (!previousScore) return "medium";

  if (previousScore >= 70) {
    return "hard";
  } else if (previousScore >= 40) {
    return "medium";
  } else {
    return "easy";
  }
};

module.exports = {
  callGroq,
  generateQuestions,
  evaluateAnswer,
  generateFinalEvaluation,
  parseGroqResponse,
  getAdaptiveDifficulty,
};
