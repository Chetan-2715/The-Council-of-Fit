from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from tools.calendar_tool import CalendarUpdateTool
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv

load_dotenv()
os.environ["OPENAI_API_KEY"] = "NA"

# Setup LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    verbose=True,
    temperature=0.7,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# Force OpenAI Key to exist to bypass validation checks
os.environ["OPENAI_API_KEY"] = "sk-proj-dummy-key-to-bypass-validation"

class FitAgents:
    def drill_sergeant(self):
        return Agent(
            role='Drill Sergeant',
            goal='Maximize consistency and training intensity.',
            backstory="Hardened military fitness instructor.",
            verbose=True,
            allow_delegation=False,
            llm=llm
        )

    def zen_master(self):
        return Agent(
            role='Zen Master',
            goal='Minimize injury and burnout.',
            backstory="Wise yoga and recovery expert.",
            verbose=True,
            allow_delegation=False,
            llm=llm
        )

    def head_coach(self):
        return Agent(
            role='Head Coach',
            goal='Balance performance and recovery.',
            backstory="Pragmatic head coach.",
            verbose=True,
            allow_delegation=False,
            tools=[CalendarUpdateTool()],
            llm=llm,
            function_calling_llm=llm 
        )

class FitTasks:
    def propose_intensity(self, agent, user_input):
        return Task(
            description=f"Propose intensity for {user_input}",
            agent=agent,
            expected_output="Intensity proposal"
        )

    def propose_recovery(self, agent, user_input):
        return Task(
            description=f"Propose recovery for {user_input}",
            agent=agent,
            expected_output="Recovery proposal"
        )

    def critique_recovery(self, agent, context):
        return Task(
            description="Critique recovery",
            agent=agent,
            context=context,
            expected_output="Critique"
        )

    def critique_intensity(self, agent, context):
        return Task(
            description="Critique intensity",
            agent=agent,
            context=context,
            expected_output="Critique"
        )

    def final_decision(self, agent, context, user_input):
        return Task(
            description="Final decision. Return JSON.",
            agent=agent,
            context=context,
            expected_output="JSON string",
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
            memory=False
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
