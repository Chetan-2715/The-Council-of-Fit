# 🏛️ The Council of Fit
### *Human-in-the-Loop AI Decision Support System*

![Status](https://img.shields.io/badge/Status-Active-success) ![Tech](https://img.shields.io/badge/React-Vite-blue) ![AI](https://img.shields.io/badge/AI-Gemini_3_Flash-orange)

**The Council of Fit** is not just a workout generator. It is a **Reasoning Engine** that simulates a board of directors for your physical health. Using a sophisticated multi-agent system, it evaluates your biometrics, mood, and constraints to negotiate the optimal decision for *today*.

---

## 1. 🧠 System Architecture

The system uses a highly optimized **Two-Step Agentic Flow** designed for stability and depth.

### **Phase 1: The Panel (Parallel Reasoning)**
A single, high-throughput API call summons six independent advisors. They act purely within their domains and do not see each other's outputs to prevent groupthink.

| Agent | Archetype | Focus |
| --- | --- | --- |
| **Body Safety Advisor** | 🛡️ The Physio | Pain signals, injury history, joint safety. |
| **Energy & Recovery** | 🔋 The Sleep Coach | Sleep debt, fatigue management, readiness. |
| **Health & Stress** | ❤️ The Doctor | HRV (proxy), mental stress, burnout prevention. |
| **Equipment Advisor** | 🏋️ The Logistics Chief | Assessing available gear and environment. |
| **Goal Optimizer** | 🎯 The Head Coach | Aligning immediate action with long-term goals. |
| **Motivation Advisor** | 🔥 The Hype Man | Habit sustainability and mental momentum. |

### **Phase 2: The Resolver (Synthesis)**
A second, distinct API call takes the structured output from The Panel.
*   **Role**: **Risk & Conflict Resolver** (The Judge).
*   **Task**: Detects contradictions (e.g., *Head Coach* says "Push Hard" vs *Physio* says "Rest"), identifies missing data gaps, and issues a final, synthesized verdict.
*   **Output**: A structured markdown report with specific "Safe Options".

---

## 2. ✨ Key Features

### **Dual-Client Engine**
To handle the cognitive load and rate limits, the app instantiates **two separate Gemini Clients** (`geminiPrimaryClient` and `geminiSecondaryClient`), ensuring the heavy lifting of the Panel doesn't block the critical synthesis of the Resolver.

### **Dynamic UI/UX**
*   **"LightRays" Ambient Background**: A custom WebGL shader (using `ogl`) creates a subtle, premium deep-space atmosphere that reacts to time.
*   **Glassmorphism**: Dark, frosted-glass cards with neon accents (#00f2ea cyan & #ff0055 pink) for high contrast and readability.
*   **Collapsible Intelligence**:
    *   **✅ Action Plan**: The "What to do" is shown instantly at the top.
    *   **⚖️ Discussion Summary**: A synthesized report of agreements/disagreements (Collapsible).
    *   **🗣️ Individual Opinions**: Full transcripts of every agent's reasoning (Collapsible 3-column grid).

### **Smart Alerts**
*   **⚠ Disagreement Detection**: Visual badges appear if agents gave conflicting advice.
*   **⚠ Missing Data**: Warns if confidence is low due to empty biometric inputs.

---

## 3. 🚀 Quick Start

### **Prerequisites**
*   Node.js installed.
*   **Google Gemini API Key(s)**.

### **Setup**
1.  Navigate to the frontend:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your Environment Variables:
    Create a `.env` file in `frontend/` and add your keys (supports dual keys for load distribution):
    ```ini
    VITE_GOOGLE_API_KEY1=your_primary_key
    VITE_GOOGLE_API_KEY2=your_secondary_key
    # Or just use VITE_GOOGLE_API_KEY as fallback
    ```
4.  Run the App:
    ```bash
    npm run dev
    ```

---

## 4. 📸 Implementation Details
*   **Frontend**: React, Vite
*   **Styling**: Vanilla CSS (Variables + Flex/Grid)
*   **Graphics**: `ogl` for WebGL shaders.
*   **AI Orchestration**: Custom sequential promise chain (Panel -> JSON -> Resolver -> Markdown).

---

**Built with ❤️ by Chetan**
