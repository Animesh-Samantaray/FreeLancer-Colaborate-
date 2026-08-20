import OpenAI from "openai";
import fs from "fs";
import path from "path";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});


export const askGroqModel = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_completion_tokens: 800,
      reasoning_effort: "low",
    });

    return completion.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Groq API Error Details:", error);
    throw new Error("Failed to generate AI response from Groq.");
  }
};

const askToAI = async (question) => {
  try {
    if (!question || !question.trim()) {
      throw new Error("Question is required.");
    }

    const currentDirectory = process.cwd();

    const promptPath = path.join(
      currentDirectory,
      "docs",
      "PromptGuide.txt"
    );

    const documentationPath = path.join(
      currentDirectory,
      "docs",
      "doc.txt"
    );


    if (!fs.existsSync(promptPath)) {
      throw new Error("AI prompt file not found.");
    }

    if (!fs.existsSync(documentationPath)) {
      throw new Error("Website documentation file not found.");
    }

    const promptTemplate = fs.readFileSync(
      path.join(process.cwd(), "docs", "prompt.txt"),
      "utf-8"
    );

    const websiteDocumentation = fs.readFileSync(
      path.join(process.cwd(), "docs", "doc.txt"),
      "utf-8"
    );


    const finalPrompt = `
${promptTemplate}

==================================================
WEBSITE DOCUMENTATION
==================================================

${websiteDocumentation}

==================================================
USER QUESTION
==================================================

${question.trim()}

==================================================
INSTRUCTIONS
==================================================

Answer the user's question using the provided website
documentation and instructions.


If the user is asking how to navigate somewhere,
provide the appropriate navigation information according
to the navigation rules in the prompt.

Return a clear, concise and helpful answer.
`;

    const answer = await askGroqModel(finalPrompt);

    return answer;
  } catch (error) {
    console.error("askToAI Error:", error);
    throw error;
  }
};