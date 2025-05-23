import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from docx import Document
from PyPDF2 import PdfReader

# Load API Key
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file")

# Initialize GPT-4.5 Turbo
llm = ChatOpenAI(model_name="gpt-4.5-turbo", temperature=0.5)

def read_file(file_path: str) -> str:
    """
    Read content from DOCX or PDF file.

    Parameters:
    - file_path (str): Path to the uploaded file.

    Returns:
    - str: Extracted file content.
    """
    _, file_extension = os.path.splitext(file_path)

    if file_extension == ".docx":
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])

    elif file_extension == ".pdf":
        pdf_reader = PdfReader(file_path)
        return "\n".join([page.extract_text() for page in pdf_reader.pages])

    else:
        raise ValueError("Unsupported file format. Only .docx and .pdf are supported.")

def evaluate_legal_document(file_path: str, evaluation_criteria: str = "General legal review") -> str:
    """
    Evaluate a legal document using AI.

    Parameters:
    - file_path (str): Path to the uploaded file (DOCX or PDF).
    - evaluation_criteria (str): Criteria to evaluate the document against.

    Returns:
    - str: AI evaluation and feedback.
    """
    try:
        # Extract document content
        document_text = read_file(file_path)
        prompt = f"Evaluate the following legal document based on '{evaluation_criteria}':\n{document_text}"
        
        # Generate AI evaluation
        response = llm.predict(prompt)
        return response
    except Exception as e:
        raise RuntimeError(f"Error evaluating legal document: {str(e)}")
