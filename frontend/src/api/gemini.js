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
const PRIMARY_PANEL_MODEL = geminiPrimaryClient;
const SECONDARY_RESOLVER_MODEL = geminiSecondaryClient; // Explicit Separation

/**
 * 1. CALL ONE: THE PANEL
 * Runs all 6 advisors in a single API call to ensure strict alignment and speed.
 */
export async function callPanel(userInputs) {
    if (!API_KEY_1) return { error: "Missing API Key" };

    try {
        // Import dynamically or pass as arg to avoid circular deps if needed, 
        // but assuming prompts.js is clean.
        const { PANEL_PROMPT } = await import('../agents/prompts');

        const finalPrompt = PANEL_PROMPT.replace('{{USER_INPUT}}', JSON.stringify(userInputs, null, 2));

        const result = await PRIMARY_PANEL_MODEL.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (e) {
        console.error("PANEL CALL FAILED:", e);
        return { error: "The Panel is currently unavailable." };
    }
}

/**
 * 2. CALL TWO: THE RESOLVER
 * Synthesizes the Panel's JSON output into the final advice.
 */
export async function callResolver(userInputs, panelOutput) {
    if (!API_KEY_2) return "System Error: Secondary API Key missing.";

    try {
        const { RESOLVER_PROMPT } = await import('../agents/prompts');

        let finalPrompt = RESOLVER_PROMPT
            .replace('{{USER_INPUT}}', JSON.stringify(userInputs, null, 2))
            .replace('{{PANEL_OUTPUT}}', JSON.stringify(panelOutput, null, 2));

        const result = await SECONDARY_RESOLVER_MODEL.generateContent(finalPrompt);
        const response = await result.response;
        return response.text();

    } catch (e) {
        console.error("RESOLVER CALL FAILED:", e);
        return "Error: The High Council could not reach a verdict. Please rely on the individual advisor notes above.";
    }
}
