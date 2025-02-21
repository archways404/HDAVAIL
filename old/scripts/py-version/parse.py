import json
from icalendar import Calendar
from datetime import datetime
import re

# Function to parse an ICS file and extract event details
def parse_ics_file(file_path):
  events = []

  # Open and read the ICS file
  with open(file_path, 'r', encoding='utf-8') as ics_file:
    calendar = Calendar.from_ical(ics_file.read())

  # Loop through the components in the ICS file
  for component in calendar.walk():
    if component.name == "VEVENT":
      event = {}
      event['uid'] = component.get('UID')
      summary = component.get('SUMMARY')

      # Extract 'Moment' from summary
      moment_match = re.search(r"Moment: (\w+)", summary)
      event['moment'] = moment_match.group(1) if moment_match else 'N/A'
      event['location'] = component.get('LOCATION')
      
      # Separate date and time for start and end
      start_datetime = component.get('DTSTART').dt
      end_datetime = component.get('DTEND').dt
      event['date'] = start_datetime.strftime("%Y-%m-%d")
      event['start_time'] = start_datetime.strftime("%H:%M:%S")
      event['end_time'] = end_datetime.strftime("%H:%M:%S")
      
      # Calculate the duration in hours
      event['hours'] = round((end_datetime - start_datetime).total_seconds() / 3600, 1)
      
      # Separate date and time for created and last modified
      created_datetime = component.get('CREATED').dt
      last_modified_datetime = component.get('LAST-MODIFIED').dt
      event['created_date'] = created_datetime.strftime("%Y-%m-%d")
      event['created_time'] = created_datetime.strftime("%H:%M:%S")
      event['last_modified_date'] = last_modified_datetime.strftime("%Y-%m-%d")
      event['last_modified_time'] = last_modified_datetime.strftime("%H:%M:%S")

      # Format UID by removing the prefix
      uid_match = re.search(r"BokningsId_(\d+_\d+)", event['uid'])
      event['uid'] = uid_match.group(1) if uid_match else event['uid']

      # Filter for "Moment: ledig"
      if event['moment'].lower() == 'ledig':
        events.append(event)
      
  return events

# Function to save events as JSON to a new file
def save_events_to_json(events, file_path):
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(events, file, ensure_ascii=False, indent=2)

# Current date
current_date = datetime.now().date()

# Format the date as YYYY-MM-DD
formatted_date = current_date.strftime("%Y-%m-%d")

# Example usage
ics_file_path = f"files/{formatted_date}.ics"
filtered_events = parse_ics_file(ics_file_path)

# Save the filtered events to a JSON file
output_file_path = f"files/{formatted_date}_filtered.json"
save_events_to_json(filtered_events, output_file_path)
print(f"Filtered events saved to {output_file_path}")
