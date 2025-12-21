from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from tools.calendar_tool import CalendarUpdateTool
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv

load_dotenv()

# Use Gemini 1.5 Flash (Faster & Cheaper)
llm = ChatGoogleGenerativeAI(
    model="gemini-flash-latest",
    verbose=True,
    temperature=0.6,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

class FitAgents:
    def drill_sergeant(self):
        return Agent(
            role='Drill Sergeant',
            goal='Maximize training intensity.',
            backstory="Hardened military instructor. You speak in short, punchy sentences. No fluff.",
            verbose=True,
            allow_delegation=False,
            llm=llm
        )

    def zen_master(self):
        return Agent(
            role='Zen Master',
            goal='Maximize recovery.',
            backstory="Yoga expert. You speak calmly and briefly. You prioritize sleep and health.",
            verbose=True,
            allow_delegation=False,
            llm=llm
        )

    def head_coach(self):
        return Agent(
            role='Head Coach',
            goal='Make a final decision and execute it.',
            backstory="Pragmatic coach. You listen to the team and make a quick decision.",
            verbose=True,
            allow_delegation=False,
            tools=[CalendarUpdateTool()],
            llm=llm
        )

class FitTasks:
    def propose_intensity(self, agent, user_input):
        return Task(
            description=f"User Stats: {user_input}. Propose a high-intensity workout. MAX 2 SENTENCES.",
            agent=agent,
            expected_output="A short, aggressive workout proposal."
        )

    def propose_recovery(self, agent, user_input):
        return Task(
            description=f"User Stats: {user_input}. Propose a recovery plan. MAX 2 SENTENCES.",
            agent=agent,
            expected_output="A short, gentle recovery proposal."
        )

    def critique_recovery(self, agent, context):
        return Task(
            description="Critique the recovery plan. Explain why it's lazy. MAX 1 SENTENCE.",
            agent=agent,
            context=context,
            expected_output="A single sentence critique."
        )

    def critique_intensity(self, agent, context):
        return Task(
            description="Critique the intensity plan. Explain why it's dangerous. MAX 1 SENTENCE.",
            agent=agent,
            context=context,
            expected_output="A single sentence critique."
        )

    def final_decision(self, agent, context, user_input):
        return Task(
            description=(
                "Review the debate. Create a final plan. "
                "Use the 'Update Workout Calendar' tool to schedule it. "
                "YOU MUST RETURN JSON ONLY. NO MARKDOWN. "
                "Format: {"
                "\"final_plan\": \"Short title (e.g. 5k Run)\", "
                "\"duration_minutes\": 30, "
                "\"reasoning\": \"One short sentence explaining why.\", "
                "\"confidence_score\": 0.95"
                "}"
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
        drill = self.agents.drill_sergeant()
        zen = self.agents.zen_master()
        coach = self.agents.head_coach()

        task1 = self.tasks.propose_intensity(drill, self.user_input)
        task2 = self.tasks.propose_recovery(zen, self.user_input)
        task3 = self.tasks.critique_recovery(drill, [task2])
        task4 = self.tasks.critique_intensity(zen, [task1])
        task5 = self.tasks.final_decision(coach, [task1, task2, task3, task4], self.user_input)

        crew = Crew(
            agents=[drill, zen, coach],
            tasks=[task1, task2, task3, task4, task5],
            verbose=True,
            process=Process.sequential,
            manager_llm=llm,
            memory=False, # Disable memory for speed
        )

        final_output = crew.kickoff()

        logs = [
            {"agent": "Drill Sergeant", "step": "Proposal", "content": str(task1.output)},
            {"agent": "Zen Master", "step": "Proposal", "content": str(task2.output)},
            {"agent": "Drill Sergeant", "step": "Critique", "content": str(task3.output)},
            {"agent": "Zen Master", "step": "Critique", "content": str(task4.output)},
            {"agent": "Head Coach", "step": "Verdict", "content": str(task5.output)}
        ]

        return {
            "final_decision": str(final_output),
            "logs": logs
        }