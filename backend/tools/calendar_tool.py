from crewai.tools import BaseTool
import os.path
import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from pydantic import Field
from dotenv import load_dotenv

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/calendar']

class CalendarUpdateTool(BaseTool):
    name: str = "Update Workout Calendar"
    description: str = "Updates the user's Google Calendar with the final workout plan. Input should be the summary of the workout and the duration in minutes."

    def _run(self, summary: str, duration_minutes: int) -> str:
        """Updates the calendar event."""
        # Simple implementation for now to ensure stability
        return f"Simulated Calendar Update: {summary} for {duration_minutes} mins"
