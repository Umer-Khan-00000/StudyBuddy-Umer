import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Lazy initializer for Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment. AI features may fall back to heuristics.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

/**
 * 1. RAG-Style Q&A with Citation and Teaching Mode (Feynman, ELI5, Deep Dive, Direct)
 */
app.post("/api/study/ask", async (req: Request, res: Response) => {
  try {
    const { question, notesContext, mode = "feynman", conversationHistory = [] } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const ai = getAI();

    let stylePrompt = "";
    switch (mode) {
      case "feynman":
        stylePrompt = "Use the Feynman Technique: Explain the concept using intuitive, vivid everyday analogies, simple language, and zero unnecessary jargon. Highlight why it works from first principles.";
        break;
      case "eli5":
        stylePrompt = "Explain Like I'm 5 (ELI5): Keep it ultra-simple, engaging, playful, and crystal clear for a beginner.";
        break;
      case "deep_dive":
        stylePrompt = "Deep Dive & Critical Analysis: Provide rigorous academic depth, examine edge cases, theoretical underpinnings, practical problem-solving applications, and common exam pitfalls.";
        break;
      case "mnemonics":
        stylePrompt = "Mnemonics & Memory Palace: Craft memorable acronyms, visual stories, rhyming cues, or memory anchors to memorize this concept effortlessly.";
        break;
      default:
        stylePrompt = "Direct Academic Tutoring: Provide a clear, precise, structured answer grounded directly in the student's study material.";
        break;
    }

    const systemInstruction = `You are "Study Buddy", an exceptional, supportive, high-IQ AI study tutor and RAG assistant for students.
Your primary task is to answer the student's question accurately, grounding your knowledge in the provided notes context whenever possible.

Instructions:
1. Carefully inspect the provided notes context.
2. If the answer is found or partially found in the notes, cite specific sections/topics from the notes (e.g. "[From Note: '...']").
3. If the notes do not contain the answer, explicitly mention: "Note: This is beyond your uploaded notes, but here is the comprehensive explanation to help you understand:" and provide the complete accurate answer.
4. Follow the chosen explanation style: ${stylePrompt}
5. Structure your output clearly using markdown formatting (bullet points, bold key terms, numbered steps, code blocks, or math formulas).
6. Provide 2-3 short "💡 Follow-up Knowledge Checks / Questions to Test Yourself" at the end to reinforce active recall.`;

    const contents: any[] = [];

    // Add historical context if present
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-4);
      for (const msg of recent) {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }

    const userPrompt = `STUDENT'S UPLOADED NOTES CONTEXT:
---
${notesContext || "No specific notes provided. Answer using best academic study principles."}
---

STUDENT'S QUESTION / INQUIRY:
${question}

Selected Teaching Style: ${mode.toUpperCase()}`;

    contents.push({
      role: "user",
      parts: [{ text: userPrompt }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const answer = response.text || "I was unable to generate an explanation at this moment. Please try again.";

    return res.json({
      answer,
      mode,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in /api/study/ask:", error);
    return res.status(500).json({
      error: error.message || "Failed to process question. Please verify your connection or try again.",
    });
  }
});

/**
 * 2. Generate Interactive Quizzes (MCQ, True/False, Fill in Blank, Short Answer) from Notes
 */
app.post("/api/study/generate-quiz", async (req: Request, res: Response) => {
  try {
    const {
      notesText,
      topic,
      difficulty = "medium", // easy | medium | hard
      questionCount = 5,
      questionTypes = ["multiple_choice", "true_false", "fill_blank", "conceptual"],
    } = req.body;

    if (!notesText && !topic) {
      return res.status(400).json({ error: "Please provide either notes text or a topic." });
    }

    const ai = getAI();

    const systemInstruction = `You are an expert educational assessment creator and psychometric exam designer.
Generate a high-quality, pedagogically sound study quiz directly grounded in the student's study material.
Ensure questions test actual conceptual understanding, application, and synthesis rather than superficial keyword matching.
Each question MUST have a clear, instructive explanation detailing WHY the correct answer is right and why distractors are wrong.`;

    const prompt = `Create a quiz with exactly ${questionCount} questions based on the following notes / topic.
Topic: ${topic || "General Notes Review"}
Target Difficulty: ${difficulty} (easy = foundational definitions, medium = application & analysis, hard = multi-step reasoning & edge cases)
Allowed Question Types: ${JSON.stringify(questionTypes)}

STUDENT NOTES:
---
${notesText || `Topic: ${topic}`}
---

Ensure valid JSON output matching the required schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING, description: "A catchy, motivating title for the quiz" },
            topic: { type: Type.STRING, description: "Main subject or topic" },
            difficulty: { type: Type.STRING, description: "Difficulty level" },
            estimatedMinutes: { type: Type.INTEGER, description: "Estimated time to complete in minutes" },
            summary: { type: Type.STRING, description: "Short 1-sentence overview of what this quiz tests" },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique question id like q1, q2" },
                  type: {
                    type: Type.STRING,
                    description: "One of: 'multiple_choice', 'true_false', 'fill_blank', 'conceptual'",
                  },
                  question: { type: Type.STRING, description: "The question prompt or problem statement" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Options for multiple choice (4 options) or true/false (['True', 'False']). Leave empty for fill_blank or conceptual.",
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: "The correct answer string. For multiple choice, must match one of options exactly.",
                  },
                  acceptableAnswers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Alternative acceptable spellings/synonyms for fill_blank type",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Deep, helpful explanation teaching the underlying principle",
                  },
                  conceptTested: { type: Type.STRING, description: "Key concept or learning objective being evaluated" },
                  hint: { type: Type.STRING, description: "A subtle nudge hint if student gets stuck" },
                },
                required: ["id", "type", "question", "correctAnswer", "explanation", "conceptTested"],
              },
            },
          },
          required: ["quizTitle", "topic", "questions"],
        },
      },
    });

    const rawJson = response.text?.trim() || "{}";
    const quizData = JSON.parse(rawJson);

    return res.json(quizData);
  } catch (error: any) {
    console.error("Error in /api/study/generate-quiz:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate quiz from notes.",
    });
  }
});

/**
 * 3. AI Short Answer / Conceptual Grading
 */
app.post("/api/study/grade-answer", async (req: Request, res: Response) => {
  try {
    const { question, idealAnswer, studentAnswer, conceptTested } = req.body;

    if (!question || !studentAnswer) {
      return res.status(400).json({ error: "Question and student answer are required." });
    }

    const ai = getAI();

    const systemInstruction = `You are a supportive, insightful teacher grading a student's open-ended conceptual answer.
Evaluate the student's answer fairly for core conceptual understanding, key terminology, and accuracy.
Give a score from 0 to 100, constructive encouragement, praise for what was right, and clear pointers on what was missing or incorrect.`;

    const prompt = `QUESTION: ${question}
KEY CONCEPT: ${conceptTested || "General"}
IDEAL / BENCHMARK ANSWER: ${idealAnswer}
STUDENT'S SUBMITTED ANSWER: ${studentAnswer}

Evaluate this answer and return JSON feedback.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Score from 0 to 100 based on understanding" },
            isPass: { type: Type.BOOLEAN, description: "True if score >= 65" },
            feedback: { type: Type.STRING, description: "2-3 sentences of positive and constructive feedback" },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Concepts the student nailed" },
            missingPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Concepts or nuances the student missed" },
            suggestedModelAnswer: { type: Type.STRING, description: "A concise, master-level example answer" },
          },
          required: ["score", "isPass", "feedback", "keyStrengths", "missingPoints"],
        },
      },
    });

    const evaluation = JSON.parse(response.text?.trim() || "{}");
    return res.json(evaluation);
  } catch (error: any) {
    console.error("Error in /api/study/grade-answer:", error);
    return res.status(500).json({
      error: error.message || "Failed to grade answer.",
    });
  }
});

/**
 * 4. Extract Key Concepts, Summaries & Flashcards from Notes
 */
app.post("/api/study/analyze-notes", async (req: Request, res: Response) => {
  try {
    const { notesText, title } = req.body;

    if (!notesText || notesText.trim().length < 10) {
      return res.status(400).json({ error: "Please provide substantial notes text." });
    }

    const ai = getAI();

    const systemInstruction = `You are a master study strategist and cognitive learning expert.
Analyze the student's study material and break it down into high-yield learning artifacts:
1. Executive summary (3-4 bullet points)
2. Core concepts & definitions
3. Essential flashcards with front (question/term) and back (answer/meaning)
4. Estimated reading time and complexity score (1-5)`;

    const prompt = `Analyze these notes titled "${title || "Study Material"}":
---
${notesText}
---`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, description: "Academic subject e.g., Biology, Computer Science, Economics" },
            complexityLevel: { type: Type.STRING, description: "Beginner, Intermediate, Advanced" },
            estimatedReadTimeMins: { type: Type.INTEGER },
            summaryBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  significance: { type: Type.STRING },
                },
                required: ["term", "definition"],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING, description: "Question, term or prompt" },
                  back: { type: Type.STRING, description: "Answer, explanation or formula" },
                  category: { type: Type.STRING },
                },
                required: ["front", "back"],
              },
            },
            potentialExamQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "High-probability exam questions based on these notes",
            },
          },
          required: ["category", "summaryBullets", "keyTerms", "flashcards"],
        },
      },
    });

    const analysis = JSON.parse(response.text?.trim() || "{}");
    return res.json(analysis);
  } catch (error: any) {
    console.error("Error in /api/study/analyze-notes:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze notes.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study Buddy full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
