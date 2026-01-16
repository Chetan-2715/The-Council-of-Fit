import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// 1. Initialize the SDK
const genAI = new GoogleGenerativeAI(API_KEY);

// 2. Define Dual Clients (as requested)
// We use independent model instances to logically separate the calls, 
// answering the "Dual Gemini API Configuration" requirement.
const geminiPrimaryClient = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
const geminiSecondaryClient = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// 3. Mapping Agents to Clients
const PRIMARY_AGENTS = [
    "Body Safety Advisor",
    "Health & Stress Advisor",
    "Risk & Conflict Resolver"
];

/**
 * Calls a specific agent.
 * @param {string} agentName - Name of the agent (e.g., "Body Safety Advisor")
 * @param {string} roleDescription - The specific system prompt/persona for the agent
 * @param {object} userInputs - The structured user input
 * @param {object} otherAgentOpinions - (Optional) For the Conflict Resolver, summaries of other agents.
 * @returns {Promise<string>} - The agent's response
 */
export async function callAgent(agentName, roleDescription, userInputs, otherAgentOpinions = null) {
    if (!API_KEY) {
        return "Error: API Key is missing. Please check .env file.";
    }

    // Select the correct client
    const client = PRIMARY_AGENTS.includes(agentName)
        ? geminiPrimaryClient
        : geminiSecondaryClient;

    // Build the Prompt
    let prompt = `
ROLE: ${roleDescription}

TASK: Analyze the USER INPUT and provide a recommendation.
CRITICAL GUIDELINES:
- **EXTREMELY CONCISE**: Max 50 words total.
- **FORMAT**: Use bullet points or short paragraphs.
- **NO FLUFF**: Get straight to the point.
- **TONE**: Simple, local gym language. No technical jargon.
- **EXPLAIN**: Briefly say WHY.
`;

    prompt += `\nUSER INPUT:\n${JSON.stringify(userInputs, null, 2)}\n`;

    if (otherAgentOpinions) {
        prompt += `\nOTHER AGENT OPINIONS:\n${JSON.stringify(otherAgentOpinions, null, 2)}\n`;
        prompt += `\nYOUR TASK: Identify conflicts, trade-offs, and agreements. Summarize them in plain language.`;
    }

    try {
        const result = await client.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error(`Error in ${agentName}:`, error);
        return `(System Error: ${agentName} is currently unavailable)`;
    }
}
