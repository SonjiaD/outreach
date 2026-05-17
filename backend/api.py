import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from flintreach import research_district, generate_outreach_package, discover_targets, generate_email_for_person

app = FastAPI(title="FlintReach API")

# ALLOWED_ORIGINS = comma-separated list, e.g. "https://flintreach.netlify.app,http://localhost:5173"
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    district: str
    contact_name: str
    contact_title: str

@app.post("/generate")
async def generate(body: GenerateRequest):
    try:
        profile = research_district(body.district, body.contact_name, body.contact_title)
        package = generate_outreach_package(profile, body.contact_name, body.contact_title)
        if not package:
            raise HTTPException(status_code=500, detail="Generation failed — empty response from model.")
        return {"research": profile, **package}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DiscoverRequest(BaseModel):
    state: str
    city: Optional[str] = None

class PersonRequest(BaseModel):
    person: dict

@app.post("/discover")
async def discover(body: DiscoverRequest):
    try:
        result = discover_targets(body.state, body.city)
        if not result:
            raise HTTPException(status_code=500, detail="Discovery failed — empty response from model.")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-for-person")
async def generate_for_person(body: PersonRequest):
    try:
        result = generate_email_for_person(body.person)
        if not result:
            raise HTTPException(status_code=500, detail="Generation failed — empty response from model.")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}
