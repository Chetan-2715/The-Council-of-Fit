# 🏛️ The Council of Fit
### *AI-Powered Fitness Decision System*

![Status](https://img.shields.io/badge/Status-Active-success) ![Tech](https://img.shields.io/badge/React-Vite-blue) ![AI](https://img.shields.io/badge/AI-Gemini_3_Flash-orange)

---

## 1. 🔍 Overview
**The Council of Fit** is a **Human + Machine Decision Support System** that acts as your personal board of fitness advisors. Instead of a generic fitness app, it simulates a "Council" of AI agents, each representing a different philosophy (Safety, Gains, Recovery, etc.), to help you make the best decision for your workout today based on how you *actually* feel.

## 2. 🧠 Architecture (Client-Side Agents)

The system runs entirely in the browser using a **Multi-Agent Architecture** powered by **Google Gemini 3 Flash Preview**.

### **The Council Members:**
| Agent | Role | Focus |
| --- | --- | --- |
| **Body Safety Advisor** | 🛡️ The Physio | Prevents injury, manages pain signals. |
| **Energy & Recovery** | 🔋 The Sleep Coach | Balances intensity with current fatigue levels. |
| **Health & Stress** | ❤️ The Doctor | Monitors heart rate and mental stress. |
| **Equipment Advisor** | 🏋️ The Logistics Chief | Adapts the plan to your available gear. |
| **Goal Optimizer** | 🎯 The Coach | Ensures the workout aligns with your targets. |
| **Motivation Advisor** | 🔥 The Hype Man | Keeps you consistent long-term. |
| **Risk & Conflict Resolver** | ⚖️ The Judge | Weighs all opinions and issues the final verdict. |

---

## 3. 🚀 Quick Start

This project is a modern **React + Vite** application.

### **Prerequisites**
*   Node.js installed.
*   A Google Gemini API Key.

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
    Create a `.env` file in `frontend/` and add:
    ```ini
    VITE_GOOGLE_API_KEY=your_gemini_api_key_here
    ```
    *(Note: The system requires a valid API key to summon the Council.)*

4.  Run the App:
    ```bash
    npm run dev
    ```

---

## 4. 🌟 Key Features
*   **Dual-API Client**: Distributes agent requests across multiple client instances to manage rate limits effectively.
*   **Reactive UI**: "Glassmorphism" design with neon accents and smooth animations.
*   **Privacy First**: All data is processed locally in your session; no personal health data is stored on external servers.

---

**Built with ❤️ by Chetan**
