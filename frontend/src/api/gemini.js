import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY_1 = import.meta.env.VITE_GOOGLE_API_KEY1 || import.meta.env.VITE_GOOGLE_API_KEY;
const API_KEY_2 = import.meta.env.VITE_GOOGLE_API_KEY2 || import.meta.env.VITE_GOOGLE_API_KEY;

// 1. Initialize the SDKs (Dual Keys)
const genAI_1 = new GoogleGenerativeAI(API_KEY_1);
const genAI_2 = new GoogleGenerativeAI(API_KEY_2);

// 2. Define Dual Clients (as requested)
// We use independent model instances to logically separate the calls, 
// answering the "Dual Gemini API Configuration" requirement.
const geminiPrimaryClient = genAI_1.getGenerativeModel({ model: "gemini-3-flash-preview" });
const geminiSecondaryClient = genAI_2.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
    if (!API_KEY_1 && !API_KEY_2) {
        return "Error: API Keys are missing. Please check .env file.";
    }

    // Select the correct client
    const client = PRIMARY_AGENTS.includes(agentName)
        ? geminiPrimaryClient
        : geminiSecondaryClient;

    // Build the Prompt
    let prompt = `ROLE: ${roleDescription}\n`;

    if (otherAgentOpinions) {
        // Special Path for Conflict Resolver (JSON MODE)
        prompt += `
TASK: Synthesize the inputs and opinions below into a JSON judgment.
CRITICAL: 
- Output ONLY valid JSON. No markdown code blocks like \`\`\`json.
- JSON Structure:
  {
    "hasDisagreements": true/false,
    "missingData": true/false,
    "summary": "Markdown string here. Keep it concise (max 80 words). Explain conflicts or trade-offs. End with a specific 'Safe Recommendation'."
  }
- Analyze the user context for missing key data (sleep, heart rate, stress).
`;
        prompt += `\nUSER INPUT:\n${JSON.stringify(userInputs, null, 2)}\n`;
        prompt += `\nOTHER AGENT OPINIONS:\n${JSON.stringify(otherAgentOpinions, null, 2)}\n`;
    } else {
        // Standard Path for Advisory Agents
        prompt += `
TASK: Analyze the USER INPUT and provide a recommendation.
CRITICAL GUIDELINES:
- **EXTREMELY CONCISE**: Max 50 words total.
- **FORMAT**: Use bullet points or short paragraphs.
- **NO FLUFF**: Get straight to the point.
- **TONE**: Simple, local gym language. No technical jargon.
- **EXPLAIN**: Briefly say WHY.
`;
        prompt += `\nUSER INPUT:\n${JSON.stringify(userInputs, null, 2)}\n`;
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
