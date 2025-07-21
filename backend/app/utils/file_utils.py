import os
from fastapi import UploadFile
from PyPDF2 import PdfReader
from docx import Document

async def save_and_parse_file(file: UploadFile, upload_dir: str = "uploads") -> str:
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    ext = file.filename.lower().split(".")[-1]
    if ext == "pdf":
        reader = PdfReader(file_path)
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    elif ext == "docx":
        doc = Document(file_path)
        text = "\n".join([p.text for p in doc.paragraphs])
    elif ext == "txt":
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        raise ValueError("Unsupported file type")
    return text
