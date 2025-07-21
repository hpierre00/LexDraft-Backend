import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# Load API Key from .env
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file")

# Initialize GPT-4.5 using LangChain
llm = ChatOpenAI(model_name="gpt-4.1", temperature=0.7)

def generate_response(prompt: str):
    try:
        response = llm.predict(prompt)
        return response
    except Exception as e:
        raise RuntimeError(f"Error generating response: {str(e)}")
