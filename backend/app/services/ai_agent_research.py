import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import logging
from openai import OpenAI
from typing import Optional, List, Dict

# Load API Key
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file")

# Initialize OpenAI client
client = OpenAI(api_key=openai_api_key)

# Using a powerful model for research tasks
llm = ChatOpenAI(model_name="gpt-4-turbo", temperature=0.3)

async def conduct_deep_research(query: str, clarifying_answers: Optional[Dict[str, str]] = None) -> str:
    """
    Conducts deep legal research on a given query.
    First, it generates clarifying questions. If answers are not provided, it proceeds with the initial query.
    If answers are provided, it uses them to conduct more focused research.
    """
    
    clarifying_prompt = f"""
    You are a legal research assistant. Your task is to generate a list of clarifying questions to better understand the user's research query.
    The goal is to gather more context to provide a comprehensive and accurate legal analysis.
    Based on the following query, generate up to 5 critical clarifying questions.

    Query: "{query}"

    Return the questions as a numbered list.
    """

    clarifying_questions_response = await llm.ainvoke(clarifying_prompt)
    clarifying_questions = clarifying_questions_response.content

    if not clarifying_answers:
        # Initial research phase without answers to clarifying questions
        research_prompt = f"""
        You are a highly skilled legal research AI. Your task is to conduct a thorough legal analysis of the following query.
        Since you don't have answers to clarifying questions yet, provide a broad overview of the legal landscape, identify key issues, and mention areas where more specific information would be needed.

        Initial Query: "{query}"
        
        To help you get started, here are some clarifying questions you might have asked:
        {clarifying_questions}

        Provide a preliminary research report based on the initial query. Structure your response with clear headings and detailed explanations.
        """
        initial_research_report = await llm.ainvoke(research_prompt)
        
        # We return the questions and the preliminary report to the user.
        return f"### Clarifying Questions:\n{clarifying_questions}\n\n### Preliminary Research Report:\n{initial_research_report.content}"

    # Focused research phase with answers to clarifying questions
    qa_string = "\n".join([f"Q: {q}\nA: {a}" for q, a in clarifying_answers.items()])

    focused_research_prompt = f"""
    You are a highly skilled legal research AI. You have previously asked clarifying questions and received answers from the user.
    Your task is to conduct a deep and focused legal analysis using this new information.

    Initial Query: "{query}"

    Clarifying Questions and Answers:
    {qa_string}

    Based on the initial query and the provided answers, conduct a comprehensive legal research and provide a detailed report.
    The report should be well-structured, citing relevant (though potentially placeholder) statutes, case law, and legal principles.
    """
    
    focused_research_report = await llm.ainvoke(focused_research_prompt)

    return focused_research_report.content 