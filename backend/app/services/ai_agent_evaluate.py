import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
# from docx import Document # Commented out as we'll handle content directly
# from PyPDF2 import PdfReader # Commented out as we'll handle content directly
import logging
from openai import OpenAI

# Configure logging
logger = logging.getLogger(__name__)

# Load API Key
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file")

# Initialize OpenAI client
client = OpenAI(api_key=openai_api_key)

# Initialize GPT-4.5 Turbo (This can be removed if not used elsewhere, but keeping for now)
llm = ChatOpenAI(model_name="gpt-4.5-turbo", temperature=0.5)

async def evaluate_legal_document(document_content: str, evaluation_criteria: str = "General legal review") -> str:
    """
    Evaluate a legal document using AI.

    Parameters:
    - document_content (str): The content of the document to be evaluated.
    - evaluation_criteria (str): Criteria to evaluate the document against.

    Returns:
    - str: AI evaluation and feedback.
    """
    try:
        system_message = "You are a legal document AI evaluator. Provide a concise and comprehensive evaluation of the legal document based on the given criteria. Focus on accuracy, completeness, and adherence to legal standards. Your response should be in a professional and clear format."
        user_message = f"""Evaluate the following legal document based on the criteria '{evaluation_criteria}':

Document Content:
{document_content}

Provide your evaluation and feedback, highlighting any strengths, weaknesses, or areas for improvement."""
        
        # Generate AI evaluation using OpenAI client
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # Using gpt-3.5-turbo as in generate_legal_document
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.5, # Kept original temperature for evaluation
            max_tokens=2000, # Adjusted max_tokens for evaluation, can be tuned
            presence_penalty=0.6,
            frequency_penalty=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error evaluating legal document: {str(e)}")
        raise RuntimeError(f"Failed to evaluate legal document: {str(e)}")
