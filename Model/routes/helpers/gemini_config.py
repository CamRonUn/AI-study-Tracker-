import os
from dotenv import load_dotenv
from google import genai 

# The client is now inside 'genai'
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

async def generate_chat_response(prompt: str):
    try:
        # Note: In the latest SDK, it's client.models.generate_content
        response = client.models.generate_content(
            model="gemma-4-26b-a4b-it", 
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Gemini SDK Error: {e}")
        return "I'm having trouble thinking right now."