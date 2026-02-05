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

class ActionFinderInput(BaseModel):
    url: str
    text_content: str
    clickable_elements: list[str] | None = None  # Optional: list of button/link texts

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
        GOAL 2: Create a "TL;DR" summary with exactly 3 bullet points.
        
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
                            "items": {"type": "string"}
                        },
                        "clean_text": {"type": "string"}
                    }
                }
            )
        )

        return response.parsed

    except Exception as e:
        # Reliability: Return a clear error so the frontend handles it gracefully
        raise HTTPException(status_code=500, detail=f"Error processing page: {str(e)}")

@app.post("/api/find-action")
def find_action(data: ActionFinderInput):
    """
    Feature 3: Goal Action Finder
    Analyzes the page content to identify the most important action button.
    """
    try:
        # Build context about available actions if provided
        clickable_info = ""
        if data.clickable_elements:
            clickable_info = f"\n\nAVAILABLE CLICKABLE ELEMENTS: {', '.join(data.clickable_elements[:20])}"
        
        # --- Responsibility: Prompt Strategy (Action Finding) ---
        prompt = f"""
        You are an assistive browsing assistant helping users identify the primary action on a webpage.
        
        GOAL: Identify the SINGLE most important button or action the user should take on this page.
        Consider the page's main purpose (e.g., shopping → "Add to Cart", login page → "Sign In", form → "Submit").
        
        PAGE URL: {data.url}
        PAGE CONTENT:
        {data.text_content[:10000]}{clickable_info}
        
        Identify the most relevant action and explain why it's the primary goal.
        """

        # Call Gemini with structured output
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "object",
                    "properties": {
                        "recommended_action": {"type": "string"},
                        "reasoning": {"type": "string"}
                    },
                    "required": ["recommended_action", "reasoning"]
                }
            )
        )

        return response.parsed

    except Exception as e:
        # Reliability: Return a clear error so the frontend handles it gracefully
        raise HTTPException(status_code=500, detail=f"Error finding action: {str(e)}")