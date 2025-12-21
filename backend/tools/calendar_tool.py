from crewai.tools import BaseTool
import datetime
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']

class CalendarUpdateTool(BaseTool):
    name: str = "Update Workout Calendar"
    description: str = "Updates the user's Google Calendar. Input must be a string with format: 'Activity Name | Duration in Minutes'."

    def _run(self, summary: str, duration_minutes: int = 30) -> str:
        """Updates the calendar event."""
        try:
            creds = None
            # The file token.json stores the user's access and refresh tokens.
            if os.path.exists('token.json'):
                creds = Credentials.from_authorized_user_file('token.json', SCOPES)
            
            # If there are no (valid) credentials available, let the user log in.
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    # You need credentials.json from Google Cloud Console
                    if not os.path.exists('credentials.json'):
                        return "Error: credentials.json not found. Cannot update Calendar."
                    
                    flow = InstalledAppFlow.from_client_secrets_file(
                        'credentials.json', SCOPES)
                    creds = flow.run_local_server(port=0)
                
                # Save the credentials for the next run
                with open('token.json', 'w') as token:
                    token.write(creds.to_json())

            service = build('calendar', 'v3', credentials=creds)

            # Schedule for tomorrow at 8 AM (Simulated logic)
            tomorrow = datetime.datetime.utcnow() + datetime.timedelta(days=1)
            start_time = tomorrow.replace(hour=8, minute=0, second=0, microsecond=0)
            end_time = start_time + datetime.timedelta(minutes=int(duration_minutes))

            event = {
                'summary': f"💪 {summary}",
                'description': 'Scheduled by The Council of Fit',
                'start': {
                    'dateTime': start_time.isoformat() + 'Z',
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_time.isoformat() + 'Z',
                    'timeZone': 'UTC',
                },
            }

            event = service.events().insert(calendarId='primary', body=event).execute()
            return f"Success: Event created: {event.get('htmlLink')}"

        except Exception as e:
            return f"Failed to update calendar: {str(e)}"