from typing import List, Dict, Optional
from pydantic import BaseModel
from ..config import settings
import os
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import logging
from openai import OpenAI
import json
from fastapi import HTTPException

# Load API Key
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file")

# Initialize OpenAI client
client = OpenAI(api_key=openai_api_key)

# Initialize GPT-4.5 Turbo
llm = ChatOpenAI(model_name="gpt-4.5-turbo", temperature=0.7)

# Configure logging
logger = logging.getLogger(__name__)

class ComplianceCheckResults(BaseModel):
    formatting: str
    required_clauses: List[str]
    jurisdiction_fit: str

async def check_document_compliance(
    document_content: str,
    jurisdiction: Optional[str] = None,
    document_type: Optional[str] = None
) -> ComplianceCheckResults:
    """
    Analyzes a document for compliance with legal formatting, required clauses,
    and jurisdiction-specific requirements using an AI agent.
    """
    try:
        # Construct system message for the compliance agent
        system_message = f"""You are a highly specialized legal compliance agent. Your primary goal is to analyze legal documents for adherence to specified formatting rules, identification of required clauses, and overall fit for a given jurisdiction. You must provide your analysis in a structured JSON format.

    Your output MUST be a JSON object with the following keys:
    - 'formatting': A string indicating the overall formatting status (e.g., "Pass", "Fail", "Needs Review").
    - 'required_clauses': A list of strings. If clauses are missing, list them. If no clauses are missing or if this check is not applicable, provide a suitable message (e.g., "All required clauses present" or "N/A").
    - 'jurisdiction_fit': A string indicating how well the document fits the specified jurisdiction (e.g., "Good", "Needs Review", "Poor").

    Consider the following aspects in your analysis:
    - **Formatting**: Adherence to standard legal document formatting (e.g., proper headings, spacing, bolding, capitalization, signature blocks, certificates of service).
    - **Required Clauses**: Presence of essential legal clauses based on the document type and jurisdiction. If a specific template was used during generation, refer to common clauses for that document type.
    - **Jurisdiction Fit**: How well the document's content and structure align with the legal standards and common practices of the specified jurisdiction. Look for jurisdictional-specific terminology, citations, and court naming conventions.

    If no specific jurisdiction or document type is provided, perform a general compliance check based on common legal document standards.

    Example Output:
    ```json
    {{
    "formatting": "Pass",
    "required_clauses": ["All required clauses present"],
    "jurisdiction_fit": "Good"
    }}
    ```

    Another Example (with issues):
    ```json
    {{
    "formatting": "Fail",
    "required_clauses": ["Missing indemnification clause", "No force majeure clause"],
    "jurisdiction_fit": "Needs Review"
    }}
    ```

    Strictly adhere to the JSON format. Do not include any additional text or explanations outside the JSON object."""

        # Construct user message
        user_message_parts = [
            "Please analyze the following legal document for compliance.",
            f"Document Content:\n\n{document_content}"
        ]
        if jurisdiction:
            user_message_parts.append(f"Jurisdiction: {jurisdiction}")
        if document_type:
            user_message_parts.append(f"Document Type: {document_type}")
        
        user_message = "\n".join(user_message_parts)

        logger.info("Calling OpenAI for compliance check...")
        response = client.chat.completions.create(
            model="gpt-4.1",  # Using gpt-4.1 as per generate agent
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3, # Lower temperature for more factual, less creative output
            max_tokens=1000,
            response_format={ "type": "json_object" }
        )

        raw_response_content = response.choices[0].message.content
        # Removed debug logging

        # Parse the JSON response
        compliance_data = json.loads(raw_response_content)
        
        return ComplianceCheckResults(**compliance_data)

    except json.JSONDecodeError as e:
        logger.error(f"JSON decoding error in compliance agent response: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse compliance check response from AI.")
    except Exception as e:
        logger.error(f"Error during compliance check: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to perform compliance check: {str(e)}") 