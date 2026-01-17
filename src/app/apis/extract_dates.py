import ollama
import json
import re

# Read the text file
with open('src/app/apis/userInput.txt', 'r', encoding='utf-8') as f:
    text = f.read()

if not text or text.strip() == "":
    error_response = {
        "events": [],
        "error": "No text provided",
        "reason": "The uploaded file was empty or contained no readable text."
    }
    print(json.dumps(error_response))
    with open('src/app/apis/calendar_events.json', 'w', encoding='utf-8') as f:
        json.dump(error_response, f, indent=2)
    exit(0)

# PRE-CHECK: Look for actual dates in the text before calling AI
def has_specific_dates(text):
    """Check if text contains specific calendar dates"""
    # Patterns for dates
    date_patterns = [
        r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s*,?\s*\d{4}\b',  # January 15, 2026
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2}\s*,?\s*\d{4}\b',  # Jan 15, 2026
        r'\b\d{1,2}/\d{1,2}/\d{4}\b',  # 01/15/2026
        r'\b\d{4}-\d{2}-\d{2}\b',  # 2026-01-15
        r'\b\d{1,2}-\d{1,2}-\d{4}\b',  # 1-15-2026
        r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\b',  # January 15th (without year but specific)
    ]
    
    for pattern in date_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def has_only_relative_dates(text):
    """Check if text only has relative dates like 'Week 1', 'next Monday'"""
    text_lower = text.lower()
    relative_patterns = ['week 1', 'week 2', 'week 3', 'week 4', 'week 5', 'week 6', 
                        'week 7', 'week 8', 'week 9', 'week 10', 'week 11', 'week 12',
                        'next week', 'this week', 'next month', 'this month',
                        'next monday', 'next tuesday', 'next wednesday', 'next thursday',
                        'next friday', 'next saturday', 'next sunday']
    
    return any(pattern in text_lower for pattern in relative_patterns)

# Check if text has actual dates
if not has_specific_dates(text):
    error_response = {"events": []}
    
    text_lower = text.lower()
    
    if has_only_relative_dates(text):
        error_response["error"] = "No specific dates found"
        error_response["reason"] = "The text contains relative time references (e.g., 'Week 1', 'next week') but no specific calendar dates. Please provide actual dates (e.g., January 15, 2026) for events to be added to the calendar."
    elif any(phrase in text_lower for phrase in ['tbd', 'to be determined', 'to be announced', 'tba']):
        error_response["error"] = "Dates not yet determined"
        error_response["reason"] = "The text indicates that dates are 'To Be Determined' or 'To Be Announced'. Please upload the document again once specific dates are available."
    else:
        error_response["error"] = "No dates found"
        error_response["reason"] = "The text does not contain any recognizable calendar dates. Events cannot be extracted without specific dates like 'January 15, 2026' or '01/15/2026'."
    
    print(json.dumps(error_response))
    with open('src/app/apis/calendar_events.json', 'w', encoding='utf-8') as f:
        json.dump(error_response, f, indent=2)
    exit(0)

# If we got here, there ARE specific dates - proceed with AI extraction

# Create VERY strict prompt for Ollama
prompt = f"""You are a JSON-only calendar event extraction system. You must ONLY output valid JSON, nothing else.

Extract ALL events and dates from this text: {text}

CRITICAL RULES:
1. ONLY extract events that have SPECIFIC CALENDAR DATES mentioned in the text
2. DO NOT make up or infer dates that aren't explicitly stated
3. DO NOT convert relative dates like "Week 1" or "next Monday" into specific dates
4. If a date is vague or unclear, DO NOT include that event

STRICT OUTPUT FORMAT:
{{
  "events": [
    {{
      "title": "string (max 100 chars, required)",
      "description": "string (max 500 chars, required)",
      "startDate": "YYYY-MM-DD (ISO format, MUST be from text)",
      "endDate": "YYYY-MM-DD (ISO format, MUST be from text)",
      "startTime": "HH:MM (24-hour) OR null",
      "endTime": "HH:MM (24-hour) OR null"
    }}
  ]
}}

EXTRACTION RULES:
1. Output ONLY valid JSON - no explanations, no markdown
2. Use the EXACT year mentioned in the text (default to 2026 ONLY if year is not specified but specific date is)
3. If event spans multiple days, set different start/end dates
4. Use null for missing times
5. Use 24-hour time format (00:00 to 23:59)
6. All dates MUST be dates that appear in the original text
7. DO NOT HALLUCINATE DATES - if a specific date isn't in the text, don't include that event

OUTPUT ONLY THE JSON - START WITH {{ and END WITH }}"""

try:
    # Call Ollama with stricter settings
    response = ollama.chat(
        model='llama3.2',
        messages=[
            {
                'role': 'system',
                'content': 'You are a strict date extraction system. You ONLY extract dates that are explicitly written in the text. You NEVER make up or infer dates. Output only valid JSON.'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ],
        options={
            'temperature': 0.0,  # Even lower - no creativity allowed
            'top_p': 0.8,
        }
    )

    result = response['message']['content'].strip()
    
    # Aggressive cleaning
    result = re.sub(r'```json\s*', '', result)
    result = re.sub(r'```\s*', '', result)
    
    if '{' in result:
        result = result[result.index('{'):]
    
    if '}' in result:
        result = result[:result.rindex('}')+1]
    
    # Parse JSON
    events_json = json.loads(result)
    
    # Validate structure
    if not isinstance(events_json, dict):
        raise ValueError("Response must be a JSON object")
    
    if 'events' not in events_json:
        if isinstance(events_json, list):
            events_json = {"events": events_json}
        else:
            raise ValueError("JSON must contain 'events' array")
    
    if not isinstance(events_json['events'], list):
        raise ValueError("'events' must be an array")
    
    # Validate and clean each event
    cleaned_events = []
    skipped_count = 0
    skip_reasons = []
    
    for idx, event in enumerate(events_json['events']):
        try:
            if 'title' not in event or not event['title']:
                skip_reasons.append(f"Event {idx+1}: Missing title")
                skipped_count += 1
                continue
            
            if 'startDate' not in event or not event['startDate']:
                skip_reasons.append(f"Event '{event.get('title', 'Unknown')}': Missing start date")
                skipped_count += 1
                continue
            
            cleaned_event = {
                'title': str(event['title'])[:100],
                'description': str(event.get('description', 'No description provided'))[:500],
                'startDate': event['startDate'],
                'endDate': event.get('endDate', event['startDate']),
                'startTime': event.get('startTime'),
                'endTime': event.get('endTime')
            }
            
            # Validate date format (YYYY-MM-DD)
            date_pattern = r'^\d{4}-\d{2}-\d{2}$'
            if not re.match(date_pattern, cleaned_event['startDate']):
                skip_reasons.append(f"Event '{cleaned_event['title']}': Invalid start date format")
                skipped_count += 1
                continue
            if not re.match(date_pattern, cleaned_event['endDate']):
                skip_reasons.append(f"Event '{cleaned_event['title']}': Invalid end date format")
                skipped_count += 1
                continue
            
            # Additional validation: Check if dates are reasonable (between 2020-2030)
            start_year = int(cleaned_event['startDate'].split('-')[0])
            end_year = int(cleaned_event['endDate'].split('-')[0])
            
            if start_year < 2020 or start_year > 2030 or end_year < 2020 or end_year > 2030:
                skip_reasons.append(f"Event '{cleaned_event['title']}': Date appears to be hallucinated (year {start_year})")
                skipped_count += 1
                continue
            
            # Validate time format (HH:MM) if provided
            time_pattern = r'^\d{2}:\d{2}$'
            if cleaned_event['startTime'] is not None:
                if not isinstance(cleaned_event['startTime'], str) or not re.match(time_pattern, cleaned_event['startTime']):
                    cleaned_event['startTime'] = None
            
            if cleaned_event['endTime'] is not None:
                if not isinstance(cleaned_event['endTime'], str) or not re.match(time_pattern, cleaned_event['endTime']):
                    cleaned_event['endTime'] = None
            
            cleaned_events.append(cleaned_event)
            
        except Exception as e:
            skip_reasons.append(f"Event {idx+1}: Error - {str(e)}")
            skipped_count += 1
            continue
    
    # Build final response
    final_json = {"events": cleaned_events}
    
    if len(cleaned_events) == 0:
        final_json["error"] = "No valid events extracted"
        final_json["reason"] = "While the text contains dates, no valid calendar events could be extracted. " + ("; ".join(skip_reasons) if skip_reasons else "The dates may be too vague or ambiguous.")
    elif skipped_count > 0:
        final_json["warning"] = f"Skipped {skipped_count} invalid events"
        final_json["skippedReasons"] = skip_reasons
    
    # Save to file
    with open('src/app/apis/calendar_events.json', 'w', encoding='utf-8') as f:
        json.dump(final_json, f, indent=2)
    
    print(f"Extracted {len(cleaned_events)} events")
    if skipped_count > 0:
        print(f"Skipped {skipped_count} invalid events")
    print("Saved to calendar_events.json")
    
except json.JSONDecodeError as e:
    error_response = {
        "events": [],
        "error": "Failed to parse AI response",
        "reason": f"The AI did not return valid JSON format. Error: {str(e)}"
    }
    print(f"JSON Parse Error: {e}")
    with open('src/app/apis/calendar_events.json', 'w', encoding='utf-8') as f:
        json.dump(error_response, f, indent=2)
    exit(1)
    
except Exception as e:
    error_response = {
        "events": [],
        "error": "Extraction failed",
        "reason": f"An unexpected error occurred: {str(e)}"
    }
    print(f"Error: {e}")
    with open('src/app/apis/calendar_events.json', 'w', encoding='utf-8') as f:
        json.dump(error_response, f, indent=2)
    exit(1)