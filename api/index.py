from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- Responsibility: CORS Handling ---
# This ensures the Chrome Extension (which runs on any URL) can talk to your server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you might restrict this to your extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Responsibility: Interface Contract ---
# Define exactly what data you expect from the Frontend Engineer
class PageContent(BaseModel):
    url: str
    text_content: str

class FilterInput(BaseModel):
    labels: list[str]

# --- Responsibility: Secure API Key Management ---
# Initialize Gemini using the environment variable, keeping keys off the client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

@app.get("/")
def home():
    return {"status": "Backend is live. Send POST requests to /api/process-page"}

@app.post("/api/process-page")
def process_page(data: PageContent):
    try:
        # --- Responsibility: Prompt Strategy (TL;DR + Clean Content) ---
        # Combining Feature 1 & 2 into a single call for low latency
        prompt = f"""
        You are an assistive reading assistant.
        
        GOAL 1: Create a "Clean View" version of the text. Remove ads, navigation, and fluff. Keep the core meaning but simplify complex sentences.
        GOAL 2: Create a "TL;DR" summary with EXACTLY 3 bullet points. Each point should be concise (1-2 sentences max).
        
        IMPORTANT: You MUST return exactly 3 summary points in the summary_points array. No more, no less.
        
        INPUT TEXT:
        {data.text_content[:15000]} 
        """

        # Call Gemini (using Flash model for speed)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json", # Enforces strict JSON response
                response_schema={
                    "type": "object",
                    "properties": {
                        "summary_points": {
                            "type": "array",
                            "items": {"type": "string"},
                            "minItems": 3,
                            "maxItems": 3
                        },
                        "clean_text": {"type": "string"}
                    },
                    "required": ["summary_points", "clean_text"]
                }
            )
        )

        return response.parsed

    except Exception as e:
        # Reliability: Return a clear error so the frontend handles it gracefully
        raise HTTPException(status_code=500, detail=f"Error processing page: {str(e)}")

@app.post("/api/filter-actions")
def filter_actions(data: FilterInput):
    try:
        # --- Responsibility: AI-Powered Action Curation ---
        # Using Gemini to filter out noise (ads, tracking, footer links) from action list
        prompt = f"""
        You are a UI/UX expert. I will provide a list of button labels from a webpage.
        Your goal is to identify the 'Useful' actions and filter out 'Noise'.
        
        USEFUL: Navigation (Home, About, Dashboard), Functional (Login, Sign Up, Submit, Pay, Search, Download), Content Interaction (Play, Pause, Watch, Read More, Add to Cart, Buy Now), User Actions (Edit, Delete, Save, Cancel, Share, Like).
        
        NOISE: Ads (AdChoices, Sponsor, Advertisement, Promoted), Social Share spam (Tweet this, Share on Facebook, Pin it), Footer clutter (Privacy Policy, Terms of Service, Cookie Settings, Legal, Copyright), Tracking/Analytics buttons, Empty/Nonsense text, Duplicate generic links.
        
        Return a JSON object with a single key 'valid_indices' containing an integer array of the positions (0-indexed) of useful items in the original list.
        
        BUTTON LABELS:
        {data.labels}
        """

        # Call Gemini for intelligent filtering
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "object",
                    "properties": {
                        "valid_indices": {
                            "type": "array",
                            "items": {"type": "integer"}
                        }
                    },
                    "required": ["valid_indices"]
                }
            )
        )

        return response.parsed

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error filtering actions: {str(e)}")