from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from tools.calendar_tool import CalendarUpdateTool
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv

load_dotenv()

# Use "gemini-1.5-flash"
llm = ChatGoogleGenerativeAI(
    model="gemini-flash-latest",
    verbose=True,
    temperature=0.6,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

class FitAgents:
    def debate_moderator(self):
        return Agent(
            role='Debate Moderator',
            goal='Simulate a debate that is understandable to a beginner but uses real gym terminology.',
            backstory=(
                "You are the narrator of a fitness debate. "
                "You ensure the speakers use gym slang (like RPE, AMRAP, hypertrophy) but ALWAYS frame it "
                "so a beginner understands the vibe. "
                "The Drill Sergeant is intense. The Zen Master is calm."
            ),
            verbose=True,
            allow_delegation=False,
            llm=llm
        )

    def head_coach(self):
        return Agent(
            role='Head Coach',
            goal='Make a final decision that is actionable for a normal person.',
            backstory="Pragmatic coach. You translate technical debates into a clear, scheduled plan.",
            verbose=True,
            allow_delegation=False,
            tools=[CalendarUpdateTool()],
            llm=llm
        )

class FitTasks:
    def generate_debate(self, agent, user_input):
        history_context = user_input.get('recent_activity', 'No history')
        
        return Task(
            description=(
                f"User Stats: {user_input}\n"
                f"PAST HISTORY (The Brain): {history_context}\n\n"
                "Write a debate script between 'Drill Sergeant' and 'Zen Master'.\n"
                "CRITICAL INSTRUCTION: You MUST start the debate by referencing the PAST HISTORY.\n"
                "Examples:\n"
                "- 'I see you skipped yesterday! No excuses!'\n"
                "- 'You went heavy yesterday, soldier. Today we focus on form.'\n"
                "- If 'No previous history', say: 'Welcome to your first day, recruit!'\n\n"
                "Format EXACTLY like this:\n"
                "Drill Sergeant: [Opening line referencing history]\n"
                "Zen Master: [Counter-argument]\n"
                "Drill Sergeant: [Rebuttal]\n"
                "Zen Master: [Final point]"
            ),
            agent=agent,
            expected_output="A dialogue script string."
        )

    def final_decision(self, agent, context, user_input):
        return Task(
            description=(
                "Review the debate arguments above. Create a final actionable plan.\n"
                "Use the 'Update Workout Calendar' tool to schedule it.\n"
                "CRITICAL: You must return a JSON object with these EXACT keys:\n"
                "- final_plan (string, e.g. '30 Min HIIT')\n"
                "- duration_minutes (int)\n"
                "- reasoning (string, simple explanation)\n"
                "- confidence_score (float, 0.0 to 1.0)\n\n"
                "Do not include markdown formatting like ```json."
            ),
            agent=agent,
            context=context,
            expected_output="Valid JSON String only.",
        )

class FitCrew:
    def __init__(self, user_input):
        self.user_input = user_input
        self.agents = FitAgents()
        self.tasks = FitTasks()

    def run(self):
        moderator = self.agents.debate_moderator()
        coach = self.agents.head_coach()

        # 1. Generate the whole debate in ONE call
        task_debate = self.tasks.generate_debate(moderator, self.user_input)
        
        # 2. Make decision in ONE call
        task_verdict = self.tasks.final_decision(coach, [task_debate], self.user_input)

        crew = Crew(
            agents=[moderator, coach],
            tasks=[task_debate, task_verdict],
            verbose=True,
            process=Process.sequential,
            manager_llm=llm,
            memory=False,
        )

        final_output = crew.kickoff()

        # --- LOG PARSER ---
        debate_text = str(task_debate.output)
        parsed_logs = []
        
        for line in debate_text.split('\n'):
            clean_line = line.strip()
            if clean_line.startswith("Drill Sergeant:"):
                parsed_logs.append({"agent": "Drill Sergeant", "content": clean_line.replace("Drill Sergeant:", "").strip()})
            elif clean_line.startswith("Zen Master:"):
                parsed_logs.append({"agent": "Zen Master", "content": clean_line.replace("Zen Master:", "").strip()})
        
        parsed_logs.append({"agent": "Head Coach", "content": "I have reviewed the debate. Here is the actionable plan."})

        return {
            "final_decision": str(final_output),
            "logs": parsed_logs
        }