import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const askGroqModel = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "user", content: prompt }
      ],
     temperature: 0.3,                
      max_completion_tokens: 800,     
      reasoning_effort: "low",   
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error Details:", error);
    throw new Error("Failed to generate AI response from Groq.");
  }
};