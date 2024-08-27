import requests
from datetime import datetime
from dateutil.relativedelta import relativedelta

# Date
current_date = datetime.now().date()
formatted_date = current_date.strftime("%Y-%m-%d")

# Construct the URL
viewLink = f"https://schema.mau.se/setup/jsp/Schema.jsp?sprak=SV&sokMedAND=true&intervallAntal=1&startDatum={formatted_date}&intervallTyp=a&resurser=s.HDledig"

fileLink = f"https://schema.mau.se/setup/jsp/SchemaICAL.ics?sprak=SV&sokMedAND=true&intervallAntal=1&startDatum={formatted_date}&intervallTyp=a&resurser=s.HDledig"

headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
}

# GET request
response = requests.get(fileLink, headers=headers)

# Check if the response contains data and save it
if response.status_code == 200 and len(response.content) > 0:
  filename = f"files/{formatted_date}.ics"
  with open(filename, "wb") as file:
    file.write(response.content)
  print(f"File saved as {filename} in the current directory.")
else:
  print(f"Failed to download file or file is empty. Status code: {response.status_code}")
