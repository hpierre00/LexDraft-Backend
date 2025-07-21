import os
from dotenv import load_dotenv
from openai import OpenAI
from typing import Optional

# Load API Key
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file")

# Initialize OpenAI client
client = OpenAI(api_key=openai_api_key)

def enhance_document_with_ai(content: str, instructions: Optional[str] = None) -> str:
    """
    Enhance a document using OpenAI (or other LLM) based on optional instructions.
    """
    # Enhanced prompt with persona, context, and clear instructions
    prompt = """
    You are a meticulous and experienced paralegal AI assistant specializing in contract law. Your task is to enhance the following legal document.

    **Document Analysis and Enhancement Guidelines:**

    1.  **Clarity and Conciseness:** Review the document for ambiguous or convoluted language. Suggest rephrasing to improve clarity and conciseness without altering the legal meaning.
    2.  **Consistency:** Check for inconsistencies in terminology, definitions, and obligations throughout the document.
    3.  **Completeness:** Identify any missing standard clauses that are typically found in a document of this nature (e.g., Confidentiality, Force Majeure, Governing Law).
    4.  **Risk Identification:** Flag any clauses that could pose a potential risk, such as one-sided indemnification or ambiguous liability limitations.
    5.  **Formatting and Structure:** Ensure proper formatting, including consistent numbering and clause cross-referencing.

    **User Instructions:**
    """
    if instructions:
        prompt += f"{instructions}\n\n"
    else:
        prompt += "No specific user instructions provided. Follow the general guidelines above.\n\n"

    prompt += f"**Original Document:**\n```legal\n{content}\n```\n\n**Enhanced Document:**"

    response = client.chat.completions.create(
        model="gpt-4-turbo",  # Use the same model as generate agent
        messages=[
            {"role": "system", "content": "You are a helpful legal document assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
        max_tokens=2048,
        presence_penalty=0.4,
        frequency_penalty=0.2
    )
    enhanced_content = response.choices[0].message.content
    return enhanced_content