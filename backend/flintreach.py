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
