import os
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import logging
from openai import OpenAI

# Load API Key
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file")

# Initialize OpenAI client
client = OpenAI(api_key=openai_api_key)

# Initialize GPT-4.5 Turbo
llm = ChatOpenAI(model_name="gpt-4.5-turbo", temperature=0.7)

def generate_legal_document(
    prompt: str,
    user_id: str,
    title: str,
    template_content: str = None,
    state_name: str = None,
    document_type: str = None
) -> str:
    """
    Generate a legal document using AI with optional template context.
    
    Args:
        prompt: User's prompt for document generation
        user_id: ID of the user requesting the document
        title: Title of the document
        template_content: Content of the template to use as context (optional)
        state_name: Name of the state for the document (optional)
        document_type: Type of document being generated (optional)
    """
    try:
        # Construct system message with template context if available
        if template_content and state_name and document_type:
            system_message = f"""You are a legal document generator. Use the following template as context for generating a {document_type} for {state_name}.

Template Content:
{template_content}

IMPORTANT FORMATTING RULES:
1. Use proper legal document structure:
   - Title (centered, bold, all caps)
   - Parties section (numbered)
   - Recitals/Whereas clauses (if applicable)
   - Main body (numbered sections)
   - Signature blocks (properly formatted)
   - Notary section (if required)

2. Formatting requirements:
   - Use consistent indentation
   - Number all sections and subsections
   - Use proper legal terminology
   - Include proper spacing between sections
   - Use proper paragraph breaks
   - Format dates as "Month Day, Year"
   - Use proper legal citations if needed

3. Content requirements:
   - Follow the template's structure exactly
   - Maintain all essential legal clauses
   - Ensure state-specific compliance
   - Include proper definitions
   - Add clear section headers
   - Use proper legal language

4. Document sections must include:
   - Title and date
   - Parties' information
   - Recitals (if applicable)
   - Definitions
   - Main terms and conditions
   - Signatures and dates
   - Notary section (if required)

Follow the structure and key clauses from the template while incorporating the user's specific requirements.
Ensure the generated document complies with {state_name} laws and regulations."""
        else:
            system_message = """You are a legal document generator. Generate a comprehensive legal document based on the user's requirements.

IMPORTANT FORMATTING RULES:
1. Use proper legal document structure:
   - Title (centered, bold, all caps)
   - Parties section (numbered)
   - Recitals/Whereas clauses (if applicable)
   - Main body (numbered sections)
   - Signature blocks (properly formatted)
   - Notary section (if required)

2. Formatting requirements:
   - Use consistent indentation
   - Number all sections and subsections
   - Use proper legal terminology
   - Include proper spacing between sections
   - Use proper paragraph breaks
   - Format dates as "Month Day, Year"
   - Use proper legal citations if needed

3. Content requirements:
   - Include all essential legal clauses
   - Use proper legal language
   - Add clear section headers
   - Include proper definitions
   - Ensure comprehensive coverage of the subject matter

4. Document sections must include:
   - Title and date
   - Parties' information
   - Recitals (if applicable)
   - Definitions
   - Main terms and conditions
   - Signatures and dates
   - Notary section (if required)

Generate a professional legal document that is clear, comprehensive, and legally sound."""

        # Construct user message with specific requirements
        user_message = f"""Please generate a legal document with the following requirements:
Title: {title}
Specific Requirements: {prompt}

Ensure proper formatting and structure as specified in the system message."""

        # Call OpenAI API with increased max_tokens for proper formatting
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=4000,  # Increased for better formatting
            presence_penalty=0.6,  # Encourage more structured output
            frequency_penalty=0.3  # Reduce repetition
        )

        # Post-process the generated content to ensure proper formatting
        content = response.choices[0].message.content
        
        # Ensure proper spacing and formatting
        content = content.replace("\n\n\n", "\n\n")  # Remove excessive newlines
        content = content.replace("  ", " ")  # Remove double spaces
        
        # Ensure proper section numbering
        lines = content.split("\n")
        formatted_lines = []
        section_number = 1
        subsection_number = 1
        
        for line in lines:
            if line.strip().startswith("Section") or line.strip().startswith("ARTICLE"):
                formatted_lines.append(f"\n{line.strip()}")
            elif line.strip().startswith(("1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.")):
                formatted_lines.append(f"\n{line.strip()}")
            else:
                formatted_lines.append(line.strip())
        
        content = "\n".join(formatted_lines)
        
        return content

    except Exception as e:
        logging.error(f"Error generating legal document: {str(e)}")
        raise Exception(f"Failed to generate legal document: {str(e)}")
