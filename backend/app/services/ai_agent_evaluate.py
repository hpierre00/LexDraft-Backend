import os
import json
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
# from docx import Document # Commented out as we'll handle content directly
# from PyPDF2 import PdfReader # Commented out as we'll handle content directly
import logging
from openai import OpenAI
from app.models.schemas import DocumentEvaluationResponse # Import the new schema

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
llm = ChatOpenAI(model_name="gpt-4.1", temperature=0.5)

async def evaluate_legal_document(document_content: str, evaluation_criteria: str = "General legal review") -> DocumentEvaluationResponse:
    """
    Evaluate a legal document using AI.

    Parameters:
    - document_content (str): The content of the document to be evaluated.
    - evaluation_criteria (str): Criteria to evaluate the document against.

    Returns:
    - DocumentEvaluationResponse: AI evaluation and feedback in a structured format.
    """
    try:
        system_message = """You are a legal document AI evaluator. Your task is to provide a comprehensive and highly detailed evaluation of the legal document based on the given criteria. Analyze the document from different perspectives, identifying its strengths and weaknesses, potential loopholes, and strategic recommendations. You MUST return a JSON object conforming to the DocumentEvaluationResponse schema. Ensure all values in the 'metadata' field are strings, and 'parties' is a single comma-separated string. In addition to the existing fields, you must provide lists for 'weaknesses', 'strengths', 'recommendations_for_update', and 'strategies_for_update'."""
        user_message = f"""Evaluate the following legal document based on the criteria '{evaluation_criteria}':

Document Content:
{document_content}

Provide your evaluation and feedback as a JSON object with the following keys:
- 'risk_score' (High, Moderate, Low)
- 'loopholes' (list of strings detailing specific issues)
- 'strategy' (overall strategic recommendation)
- 'metadata' (dictionary with string values, e.g., parties: 'John Doe, Jane Smith', document_date: '2024-01-01', subject: 'Consulting Agreement')
- 'evaluation_summary' (a concise narrative summary of the evaluation findings)
- 'weaknesses' (list of strings outlining specific weak points in the document)
- 'strengths' (list of strings highlighting the strong points of the document)
- 'recommendations_for_update' (list of strings with concrete, actionable recommendations for improving the document)
- 'strategies_for_update' (list of strings with broader strategies or approaches for updating the document)"""
        
        # Generate AI evaluation using OpenAI client
        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.5,
            max_tokens=6000,
            presence_penalty=0.6,
            frequency_penalty=0.3,
            response_format={ "type": "json_object" } # Ensure JSON output
        )
        
        evaluation_data = json.loads(response.choices[0].message.content)
        return DocumentEvaluationResponse(**evaluation_data)
    except Exception as e:
        logger.error(f"Error evaluating legal document: {str(e)}")
        raise RuntimeError(f"Failed to evaluate legal document: {str(e)}")
