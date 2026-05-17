import os
import json
import re
import time
from datetime import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

client = genai.Client(api_key=os.environ["GEMINI_API"])

RESEARCH_MODEL = "gemini-2.5-flash"
GENERATE_MODEL = "gemini-2.5-flash"

# Hardcoded lookup — no API call needed, removes these fields from the research prompt entirely
STATE_NAME_TO_ABBR = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
    "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
    "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
    "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
    "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
    "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
}

STATE_PRIVACY_LAWS = {
    "AL": ("Alabama Student Data Privacy Act", "protects student PII from commercial use"),
    "AZ": ("Arizona Student Data Privacy Act", "restricts commercial use of student information"),
    "CA": ("California SOPIPA", "restricts use of K-12 student data for non-educational purposes"),
    "CO": ("Colorado Student Data Transparency Act", "mandates security plans and data inventories"),
    "CT": ("Connecticut Student Data Privacy Act", "limits vendor use of student data"),
    "DE": ("Delaware Student Data Privacy Act", "prohibits targeted advertising using student data"),
    "FL": ("Florida SOPPA", "restricts commercial use of student data, requires annual notification"),
    "GA": ("Georgia Student Data Privacy Act", "limits vendor use of student data to educational purposes"),
    "ID": ("Idaho Student Data Privacy Act", "restricts third-party use of student data"),
    "IL": ("Illinois SOPPA", "prohibits vendors from selling or using student data for targeted advertising"),
    "IN": ("Indiana Student Data Privacy Act", "requires transparency and limits data sharing"),
    "IA": ("Iowa Student Data Privacy Act", "restricts commercial exploitation of student data"),
    "LA": ("Louisiana Student Data Privacy Act", "limits use of student PII by vendors"),
    "ME": ("Maine Student Privacy Act", "prohibits targeted advertising using student data"),
    "MD": ("Maryland Student Data Privacy Act", "restricts use and disclosure of student data"),
    "MA": ("Massachusetts Student Data Privacy Law", "limits collection and commercial use of student data"),
    "MI": ("Michigan Student Data Privacy Act", "prohibits targeted advertising and data selling"),
    "MN": ("Minnesota Student Data Privacy Act", "restricts commercial use of student data"),
    "MT": ("Montana Student Data Privacy Act", "limits commercial use of student information"),
    "NE": ("Nebraska Student Data Privacy Act", "restricts vendor use of student data"),
    "NV": ("Nevada Student Data Privacy Act", "prohibits selling student data"),
    "NH": ("New Hampshire Student Data Privacy Act", "limits collection and use of student PII"),
    "NJ": ("New Jersey Student Data Privacy Act", "requires data security agreements with vendors"),
    "NM": ("New Mexico Student Data Privacy Act", "restricts commercial exploitation of student data"),
    "NY": ("New York Education Law 2-d", "requires strict data security and limits third-party sharing"),
    "NC": ("North Carolina Student Data Privacy Act", "limits collection and use of student PII"),
    "OH": ("Ohio Student Privacy Act", "limits data sharing beyond educational purposes"),
    "OK": ("Oklahoma Student Data Privacy Act", "restricts commercial use of student data"),
    "OR": ("Oregon Student Data Privacy Act", "prohibits targeted advertising using student data"),
    "PA": ("Pennsylvania Student Data Privacy Act", "protects against commercial use of student data"),
    "RI": ("Rhode Island Student Data Privacy Act", "limits vendor access to student data"),
    "SC": ("South Carolina Student Privacy Act", "restricts unauthorized sharing of student data"),
    "TN": ("Tennessee Student Data Privacy Act", "limits commercial use of student data"),
    "TX": ("Texas SCOPE Act", "requires districts to vet vendor data practices before contracting"),
    "UT": ("Utah Student Data Protection Act", "restricts commercial exploitation of student data"),
    "VT": ("Vermont Student Privacy Act", "limits collection and commercial use of student data"),
    "VA": ("Virginia Student Data Privacy Act", "restricts vendor use of covered information"),
    "WA": ("Washington Student Data Privacy Act", "requires transparency in data collection and use"),
    "WI": ("Wisconsin Student Privacy Law", "restricts vendor use of student data"),
    "DC": ("DC Student Data Privacy Act", "limits vendor use of student data"),
}

def get_state_privacy_law(state_abbr: str) -> tuple:
    return STATE_PRIVACY_LAWS.get((state_abbr or "").upper(), ("FERPA", "federal baseline student data privacy law"))

def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)

def _gemini_call(fn, label="", max_retries=3):
    for attempt in range(max_retries):
        try:
            return fn()
        except Exception as e:
            if 'RESOURCE_EXHAUSTED' in str(e) or '429' in str(e):
                if attempt < max_retries - 1:
                    wait = 60
                    log(f"  Rate limit hit{' on ' + label if label else ''} (attempt {attempt + 1}/{max_retries}). Waiting {wait}s...")
                    time.sleep(wait)
                else:
                    raise RuntimeError("Gemini free tier rate limit hit. Wait a minute and try again.") from e
            else:
                raise

def get_response_text(response) -> str:
    """Extract final text from a Gemini response, skipping thinking parts."""
    try:
        parts = response.candidates[0].content.parts
        text_parts = [
            p.text for p in parts
            if hasattr(p, 'text') and p.text and not getattr(p, 'thought', False)
        ]
        if text_parts:
            return '\n'.join(text_parts)
    except (IndexError, AttributeError):
        pass
    return getattr(response, 'text', '') or ''

def extract_json(text: str, label="") -> dict:
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'```\s*$', '', text, flags=re.MULTILINE)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    log(f"  Parse failed{' (' + label + ')' if label else ''} — raw preview: {text[:200]!r}")
    return {}

# ---------------------------------------------------------------------------
# Phase 1: Research — trimmed to 11 fields, state privacy law from lookup
# ---------------------------------------------------------------------------

def research_district(district: str, contact_name: str, contact_title: str) -> dict:
    log(f"Phase 1 — Research: {district} / {contact_name}, {contact_title}")
    log(f"  Model: {RESEARCH_MODEL} + Google Search grounding")

    # State privacy law is looked up locally — no need to ask Gemini
    prompt = f"""
Research this public school district and administrator. Return a JSON object with ONLY these fields:

District: {district}
Contact: {contact_name}, {contact_title}

{{
  "district_name": "full official district name",
  "state": "state full name",
  "state_abbreviation": "2-letter state code",
  "enrollment": total student count as integer,
  "num_schools": number of schools as integer,
  "title_one_status": true or false,
  "ell_percentage": "ELL student percentage as string e.g. '18%'",
  "demographics": "1-sentence demographic summary",
  "ai_policy_status": "ban / cautious / neutral / supportive / unknown",
  "contact_background": "2-3 sentence background on {contact_name}",
  "district_pain_points": ["pain point 1", "pain point 2"],
  "best_flint_angle": "1 sentence: strongest reason Flint fits this district"
}}

Return only the JSON. No markdown, no explanation.
"""
    t0 = time.time()
    log(f"  Calling Gemini...")
    response = _gemini_call(
        lambda: client.models.generate_content(
            model=RESEARCH_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                max_output_tokens=4096,
            )
        ),
        label="research"
    )
    log(f"  Responded in {time.time() - t0:.1f}s")

    profile = extract_json(get_response_text(response), label="research")

    if not profile:
        log(f"  Using fallback profile")
        profile = {
            "district_name": district,
            "state": "Unknown", "state_abbreviation": "??",
            "enrollment": 0, "num_schools": 0,
            "title_one_status": False, "ell_percentage": "unknown",
            "demographics": "diverse student population",
            "ai_policy_status": "unknown",
            "contact_background": f"{contact_name} is the {contact_title} of {district}.",
            "district_pain_points": ["personalized learning at scale", "teacher workload"],
            "best_flint_angle": "Flint provides privacy-first AI tutoring that adapts to every student.",
        }

    # Enrich with hardcoded state privacy law — zero extra API calls
    law_name, law_detail = get_state_privacy_law(profile.get("state_abbreviation", ""))
    profile["state_privacy_law"] = law_name
    profile["state_privacy_law_detail"] = law_detail

    log(f"  OK — {profile.get('state')}, {profile.get('enrollment')} students, law: {law_name}")
    return profile

# ---------------------------------------------------------------------------
# Phase 2: Three focused generation calls — each gets only what it needs
# ---------------------------------------------------------------------------

_EMAIL_SYSTEM = """You write personalized outreach emails for Flint (flintk12.com), an AI tutoring platform for K-12 schools.
Flint is FERPA/COPPA compliant, SOC 2 certified, does not train on student data, and supports students under 13.
Pricing starts free (up to 80 users) and $1.08/user/month for districts.
Proof point: Dwight-Englewood School (NJ) piloted Jan 2024 and extended through the full 2025-26 year.
Tone: Human, warm, specific. 150-200 words. No em dashes. No buzzwords. No "Furthermore" or "Moreover".
Vary sentence length. Open with something district-specific. Name one pain point. One proof point. One CTA.
Output valid JSON only. No markdown."""

_ONE_PAGER_SYSTEM = """You write compliance one-pagers for Flint (flintk12.com), an AI tutoring platform for K-12.
Flint credentials: FERPA compliant, COPPA compliant, SOC 2 Type II certified, does not train AI on student data.
Pricing: Free up to 80 users. District licensing from $1.08/user/month. Free trial available.
Output valid JSON only. No markdown."""

_DEMO_SYSTEM = """You design sample Flint (flintk12.com) demo activities for K-12 administrators.
Flint is an AI tutor that scaffolds learning — it guides students with questions, never just gives answers.
Teachers see full transcripts and per-student insights in the dashboard.
Output valid JSON only. No markdown."""

def _generate_email(profile: dict, contact_name: str, contact_title: str) -> dict:
    log(f"  [Email] Generating...")
    slim = {
        "district_name": profile.get("district_name"),
        "state": profile.get("state"),
        "enrollment": profile.get("enrollment"),
        "ell_percentage": profile.get("ell_percentage"),
        "title_one_status": profile.get("title_one_status"),
        "state_privacy_law": profile.get("state_privacy_law"),
        "contact_background": profile.get("contact_background"),
        "primary_pain_point": (profile.get("district_pain_points") or ["personalized learning at scale"])[0],
        "best_flint_angle": profile.get("best_flint_angle"),
    }
    prompt = f"""District context: {json.dumps(slim)}
Contact: {contact_name}, {contact_title}

Return JSON with exactly these two keys:
{{"email_subject": "under 60 chars, district-specific", "email_body": "150-200 word email, sign off as: The Flint Team | flintk12.com"}}"""

    t0 = time.time()
    response = _gemini_call(
        lambda: client.models.generate_content(
            model=GENERATE_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=_EMAIL_SYSTEM,
                max_output_tokens=2048,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            )
        ),
        label="email"
    )
    log(f"  [Email] Done in {time.time() - t0:.1f}s")
    return extract_json(get_response_text(response), label="email")

def _generate_one_pager(profile: dict, contact_name: str, contact_title: str) -> dict:
    log(f"  [One-Pager] Generating...")
    slim = {
        "district_name": profile.get("district_name"),
        "state": profile.get("state"),
        "state_abbreviation": profile.get("state_abbreviation"),
        "state_privacy_law": profile.get("state_privacy_law"),
        "state_privacy_law_detail": profile.get("state_privacy_law_detail"),
        "title_one_status": profile.get("title_one_status"),
        "enrollment": profile.get("enrollment"),
    }
    prompt = f"""District context: {json.dumps(slim)}
Contact: {contact_name}, {contact_title}

Return JSON with exactly this key:
{{"one_pager_bullets": {{"what_flint_is": "2 sentences tailored to this district", "student_data_privacy": "compliance statement citing {profile.get('state_privacy_law', 'FERPA')}", "compliance_credentials": ["FERPA compliant", "COPPA compliant", "SOC 2 Type II certified", "Does not train AI on student data", "one district-specific item"], "comparable_proof_point": "1-2 sentences about a comparable school or district", "pricing": "Free up to 80 users. District licensing from $1.08/user/month. Free trial available.", "next_step": "specific CTA for this district"}}}}"""

    t0 = time.time()
    response = _gemini_call(
        lambda: client.models.generate_content(
            model=GENERATE_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=_ONE_PAGER_SYSTEM,
                max_output_tokens=1024,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            )
        ),
        label="one-pager"
    )
    log(f"  [One-Pager] Done in {time.time() - t0:.1f}s")
    return extract_json(get_response_text(response), label="one-pager")

def _generate_demo_activity(profile: dict) -> dict:
    log(f"  [Demo] Generating...")
    slim = {
        "district_name": profile.get("district_name"),
        "enrollment": profile.get("enrollment"),
        "ell_percentage": profile.get("ell_percentage"),
        "demographics": profile.get("demographics"),
        "title_one_status": profile.get("title_one_status"),
        "pain_points": profile.get("district_pain_points"),
    }
    prompt = f"""District context: {json.dumps(slim)}

Return JSON with exactly this key:
{{"demo_activity": {{"title": "activity title", "grade_level": "grade level", "subject": "subject area", "context": "1 sentence why this grade/subject fits this district", "teacher_setup_prompt": "2-3 sentence prompt a teacher enters into Flint", "student_interaction": [{{"speaker": "Student", "text": "..."}}, {{"speaker": "Flint", "text": "scaffolds, asks guiding question"}}, {{"speaker": "Student", "text": "..."}}, {{"speaker": "Flint", "text": "deepens learning"}}, {{"speaker": "Student", "text": "..."}}, {{"speaker": "Flint", "text": "affirms, extends thinking"}}], "teacher_dashboard_insight": "what teacher sees in Flint dashboard after session"}}}}"""

    t0 = time.time()
    response = _gemini_call(
        lambda: client.models.generate_content(
            model=GENERATE_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=_DEMO_SYSTEM,
                max_output_tokens=3072,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            )
        ),
        label="demo"
    )
    log(f"  [Demo] Done in {time.time() - t0:.1f}s")
    return extract_json(get_response_text(response), label="demo")

def generate_outreach_package(profile: dict, contact_name: str, contact_title: str) -> dict:
    log(f"Phase 2 — Generate (3 focused calls): {contact_name} at {profile.get('district_name', '?')}")
    email = _generate_email(profile, contact_name, contact_title)
    one_pager = _generate_one_pager(profile, contact_name, contact_title)
    demo = _generate_demo_activity(profile)

    result = {**email, **one_pager, **demo}
    log(f"  Package complete — subject: \"{result.get('email_subject', '?')}\"")
    return result

# ---------------------------------------------------------------------------
# Hardcoded seed conferences by region — always shown even if search is sparse
# ---------------------------------------------------------------------------

_SEED_CONFERENCES = {
    "national": [
        {"name": "ISTE Conference & Expo", "date_range": "June 2026", "location": "San Antonio, TX", "description": "Largest K-12 edtech conference in the US, 10,000+ attendees", "relevance": "Prime venue for demoing Flint to curriculum directors and tech leads"},
        {"name": "AASA National Conference on Education", "date_range": "February 2026", "location": "Nashville, TN", "description": "Annual gathering of 5,000+ superintendents and district leaders", "relevance": "Direct access to decision-makers who control district purchasing"},
        {"name": "SXSW EDU", "date_range": "March 2026", "location": "Austin, TX", "description": "Education innovation track at SXSW, attracts forward-thinking administrators", "relevance": "Ideal for districts with supportive AI policy stance"},
    ],
    "northeast": ["CT", "ME", "MA", "NH", "NJ", "NY", "PA", "RI", "VT", "DE", "MD"],
    "southeast": ["AL", "AR", "FL", "GA", "KY", "LA", "MS", "NC", "SC", "TN", "VA", "WV"],
    "midwest": ["IL", "IN", "IA", "KS", "MI", "MN", "MO", "NE", "ND", "OH", "SD", "WI"],
    "southwest": ["AZ", "NM", "OK", "TX"],
    "west": ["AK", "CA", "CO", "HI", "ID", "MT", "NV", "OR", "UT", "WA", "WY"],
}

_REGIONAL_CONFERENCES = {
    "northeast": {"name": "NYSCATE Annual Conference", "date_range": "November 2025", "location": "Rochester, NY", "description": "Northeast education technology leaders conference", "relevance": "Strong overlap with NY/NJ district administrators"},
    "southeast": {"name": "FETC — Future of Education Technology Conference", "date_range": "January 2026", "location": "Orlando, FL", "description": "Southeast-focused edtech conference, 4,000+ attendees", "relevance": "High concentration of Title I district leaders from FL, GA, NC"},
    "midwest": {"name": "METC — Midwest Education Technology Community", "date_range": "February 2026", "location": "St. Louis, MO", "description": "Regional edtech conference for midwest administrators", "relevance": "Strong Illinois/Missouri district superintendent presence"},
    "southwest": {"name": "TCEA Annual Convention", "date_range": "February 2026", "location": "Austin, TX", "description": "Texas Computer Education Association — 10,000+ attendees", "relevance": "Largest state edtech conference; Texas has 1,000+ districts"},
    "west": {"name": "CUE Annual Conference", "date_range": "March 2026", "location": "Palm Springs, CA", "description": "California-focused edtech conference for K-12 educators and admins", "relevance": "Deep reach into CA/WA/OR district leadership"},
}

def _get_region(state_abbr: str) -> str:
    for region, states in _SEED_CONFERENCES.items():
        if isinstance(states, list) and state_abbr.upper() in states:
            return region
    return "national"

def _discover_people(scope: str) -> list:
    """Single focused call: find real administrators at large K-12 districts."""
    log(f"  [People] Searching for administrators in {scope}...")
    prompt = f"""You are a JSON API. Respond with ONLY a JSON array. No prose, no markdown, no explanation.
First character must be [ and last character must be ].

Find the current superintendents, chief academic officers, and curriculum/technology directors at the 8 largest public K-12 school districts in {scope}.
Use Google Search to verify current names and titles. Include districts of varying sizes — large urban and mid-size suburban.

Return a JSON array where every element has exactly these fields:
[
  {{
    "name": "full name of current administrator",
    "title": "their exact current title",
    "district": "full official district name",
    "city": "city where district HQ is located",
    "state_abbreviation": "2-letter state code",
    "enrollment": integer total student count or null,
    "title_one": true or false,
    "ell_percentage": "X%" or null,
    "ai_policy_status": "ban" or "cautious" or "neutral" or "supportive" or "unknown",
    "why_target": "one sentence: specific reason an AI tutoring platform fits this district"
  }}
]

IMPORTANT: Return ONLY the JSON array. Start your response with [ and end with ].
"""
    t0 = time.time()
    response = _gemini_call(
        lambda: client.models.generate_content(
            model=RESEARCH_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                max_output_tokens=4096,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            )
        ),
        label="people"
    )
    elapsed = time.time() - t0
    text = get_response_text(response)
    log(f"  [People] Responded in {elapsed:.1f}s — preview: {text[:80]!r}")

    # Try to extract JSON array
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'```\s*$', '', text, flags=re.MULTILINE)
    text = text.strip()
    try:
        result = json.loads(text)
        if isinstance(result, list):
            log(f"  [People] Found {len(result)} people")
            return result
        if isinstance(result, dict) and "people" in result:
            return result["people"]
    except json.JSONDecodeError:
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            try:
                result = json.loads(match.group())
                if isinstance(result, list):
                    log(f"  [People] Extracted {len(result)} people from response")
                    return result
            except json.JSONDecodeError:
                pass
    log(f"  [People] Parse failed — no valid JSON array found")
    return []

def _discover_conferences(scope: str) -> list:
    """Single focused call: find real upcoming K-12 education conferences."""
    log(f"  [Conferences] Searching for conferences in {scope}...")
    prompt = f"""You are a JSON API. Respond with ONLY a JSON array. No prose, no markdown, no explanation.
First character must be [ and last character must be ].

Find 3-4 real upcoming K-12 education or school administrator conferences happening in or near {scope} in 2025 or 2026.
Include state-level administrator associations and regional edtech events.

Return a JSON array where every element has exactly these fields:
[
  {{
    "name": "official conference name",
    "date_range": "Month Year (e.g. October 2025)",
    "location": "City, State",
    "description": "one sentence describing the conference",
    "relevance": "one sentence: why an AI tutoring startup should exhibit here"
  }}
]

IMPORTANT: Return ONLY the JSON array. Start with [ and end with ].
"""
    t0 = time.time()
    response = _gemini_call(
        lambda: client.models.generate_content(
            model=RESEARCH_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                max_output_tokens=2048,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            )
        ),
        label="conferences"
    )
    elapsed = time.time() - t0
    text = get_response_text(response)
    log(f"  [Conferences] Responded in {elapsed:.1f}s — preview: {text[:80]!r}")

    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'```\s*$', '', text, flags=re.MULTILINE)
    text = text.strip()
    try:
        result = json.loads(text)
        if isinstance(result, list):
            log(f"  [Conferences] Found {len(result)} conferences")
            return result
        if isinstance(result, dict) and "conferences" in result:
            return result["conferences"]
    except json.JSONDecodeError:
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            try:
                result = json.loads(match.group())
                if isinstance(result, list):
                    log(f"  [Conferences] Extracted {len(result)} conferences from response")
                    return result
            except json.JSONDecodeError:
                pass
    log(f"  [Conferences] Parse failed — will use seed conferences only")
    return []

# ---------------------------------------------------------------------------
# Discovery: find conferences + administrators for a state/city
# ---------------------------------------------------------------------------

def discover_targets(state: str, city: str = None) -> dict:
    scope = f"{city}, {state}" if city else state
    state_abbr = STATE_NAME_TO_ABBR.get(state, "")
    log(f"=== Discovery: {scope} ({state_abbr}) ===")

    people = _discover_people(scope)
    conferences = _discover_conferences(scope)

    # Seed with known conferences so the list is never empty
    region = _get_region(state_abbr)
    seed_confs = list(_SEED_CONFERENCES["national"])
    if region in _REGIONAL_CONFERENCES:
        seed_confs.insert(0, _REGIONAL_CONFERENCES[region])

    existing_names = {c.get("name", "").lower() for c in conferences}
    for conf in seed_confs:
        if conf["name"].lower() not in existing_names:
            conferences.append(conf)

    result = {"conferences": conferences, "people": people}

    if not people:
        log(f"  WARNING: No people found for {scope} — showing fallback notice")
        result["people_fallback"] = True

    log(f"=== Discovery complete: {len(people)} people, {len(conferences)} conferences ===")
    return result

# ---------------------------------------------------------------------------
# Generate email + demo for a pre-discovered person (no research call needed)
# ---------------------------------------------------------------------------

def generate_email_for_person(person: dict) -> dict:
    log(f"Generate for person — {person.get('name')} at {person.get('district', '?')}")

    state_abbr = person.get("state_abbreviation", "")
    law_name, law_detail = get_state_privacy_law(state_abbr)

    profile = {
        "district_name": person.get("district"),
        "state": person.get("city", "") + (f", {state_abbr}" if state_abbr else ""),
        "state_abbreviation": state_abbr,
        "enrollment": person.get("enrollment"),
        "num_schools": None,
        "ell_percentage": person.get("ell_percentage"),
        "title_one_status": person.get("title_one", False),
        "state_privacy_law": law_name,
        "state_privacy_law_detail": law_detail,
        "contact_background": f"{person.get('name')} is the {person.get('title')} of {person.get('district')}.",
        "district_pain_points": [person.get("why_target", "personalized learning at scale"), "teacher workload"],
        "best_flint_angle": person.get("why_target", "Flint provides privacy-first AI tutoring that adapts to every student."),
        "demographics": f"District in {person.get('city', state_abbr)}, serving {person.get('enrollment', 'thousands of')} students",
        "ai_policy_status": person.get("ai_policy_status", "unknown"),
    }

    email = _generate_email(profile, person.get("name", ""), person.get("title", ""))
    demo = _generate_demo_activity(profile)

    result = {**email, "demo_activity": demo}
    log(f"  Done — subject: \"{result.get('email_subject', '?')}\"")
    return result
