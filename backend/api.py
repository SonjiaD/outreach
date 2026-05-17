from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from flintreach import research_district, generate_outreach_package

app = FastAPI(title="FlintReach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

@app.get("/health")
def health():
    return {"status": "ok"}
