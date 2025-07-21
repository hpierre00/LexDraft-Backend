import os
import uuid
from typing import Type, Optional, Dict, Any

from pydantic import BaseModel, Field
from docx import Document

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import BaseTool
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage

# Import your database client and service functions
from app.models.database import supabase
from app.services.ai_agent_evaluate import evaluate_legal_document
from app.services.ai_agent_enhance import enhance_document_with_ai
from app.services.ai_agent_generate import generate_legal_document
from app.services.ai_agent_compliance import check_document_compliance
from app.services.ai_agent_research import conduct_deep_research
from app.services.supabase_chat_history import SupabaseChatMessageHistory
from app.utils.db_utils import get_profile, get_client_profile

# --- Configuration ---
AGENT_MODEL = "gpt-4-turbo"
GENERATED_DOCS_DIR = "generated_docs"
os.makedirs(GENERATED_DOCS_DIR, exist_ok=True)

# This will map a temporary agent-generated doc ID to a final Supabase doc ID
# A better solution would be to pass the Supabase ID directly, which we will do.
# document_path_map is no longer the source of truth; the DB is.

# --- Tool Input Schemas ---
class EvaluateToolInput(BaseModel):
    user_id: str = Field(description="The ID of the user who owns the document.")
    document_id: str = Field(description="The UUID of the document to evaluate from the database.")
    evaluation_criteria: str = Field(description="The specific criteria for evaluation.", default="General legal review")

class EnhanceToolInput(BaseModel):
    user_id: str = Field(description="The ID of the user who owns the document.")
    document_id: str = Field(description="The UUID of the document to enhance from the database.")
    instructions: Optional[str] = Field(description="Specific user instructions for the enhancement.")

class GenerateToolInput(BaseModel):
    user_id: str = Field(description="The ID of the user creating the document.")
    title: str = Field(description="The title for the new document.")
    notes: str = Field(description="Detailed notes or specific requirements from the user for the document's content.")
    document_type: str = Field(description="The type of document, e.g., 'Motion', 'Contract'. Must match an enum value from DocumentType.")
    area_of_law: str = Field(description="The relevant area of law, e.g., 'Family Law'. Must match an enum value from AreaOfLaw.")
    client_profile_id: Optional[str] = Field(None, description="The optional UUID of the client this document is for.")
    jurisdiction: Optional[str] = Field(None, description="The legal jurisdiction, e.g., 'Florida'.")

class ComplianceToolInput(BaseModel):
    user_id: str = Field(description="The ID of the user who owns the document.")
    document_id: str = Field(description="The UUID of the document to check for compliance from the database.")

class ResearchToolInput(BaseModel):
    user_id: str = Field(description="The ID of the user requesting the research.")
    query: str = Field(description="The legal research query or question to investigate.")
    clarifying_answers: Optional[Dict[str, str]] = Field(None, description="Optional dictionary of clarifying questions and their answers to focus the research.")

# --- Custom Database-Aware Asynchronous Tools ---
# Note: Each tool now takes a user_id to enforce ownership and permissions.

class GenerateTool(BaseTool):
    name: str = "generate_and_save_legal_document"
    description: str = "Generates and saves a new legal document to the user's account. Returns the new document's ID."
    args_schema: Type[BaseModel] = GenerateToolInput

    def _run(self, *args, **kwargs):
        raise NotImplementedError("This tool does not support synchronous execution.")

    user_id: Optional[str] = None

    def __init__(self, user_id=None, **kwargs):
        super().__init__(user_id=user_id, **kwargs)

    async def _arun(self, user_id: str = None, title: str = None, notes: str = None, document_type: str = None, area_of_law: str = None, client_profile_id: Optional[str] = None, jurisdiction: Optional[str] = None, **kwargs):
        try:
            # Inject user_id from tool context if not provided
            user_id = user_id or self.user_id
            user_profile_data = await get_profile(user_id)
            if not user_profile_data:
                return "Error: User profile not found."

            client_profile_data = None
            if client_profile_id:
                client_profile_data = await get_client_profile(user_id, client_profile_id)
            
            generated_content = await generate_legal_document(
                notes=notes,
                user_id=user_id,
                title=title,
                document_type=document_type,
                area_of_law=area_of_law,
                user_profile_data=user_profile_data,
                client_profile_id=client_profile_id,
                client_profile_data=client_profile_data,
                jurisdiction=jurisdiction,
                county=kwargs.get("county"),
                date_of_application=kwargs.get("date_of_application"),
                case_number=kwargs.get("case_number"),
            )
            
            insert_response = supabase.from_("documents").insert({
                "user_id": user_id,
                "title": title,
                "content": generated_content,
                "status": "draft",
                "client_profile_id": client_profile_id
            }).execute()

            if not insert_response.data:
                return "Error: Failed to save the generated document to the database. No data returned."
            
            new_doc_id = insert_response.data[0]['id']
            return f"Successfully generated and saved the document. The new document ID is: {new_doc_id}"
        except Exception as e:
            return f"An error occurred during document generation: {str(e)}"

class EnhanceTool(BaseTool):
    name: str = "enhance_existing_legal_document"
    description: str = "Enhances an existing legal document in the user's account based on instructions."
    args_schema: Type[BaseModel] = EnhanceToolInput

    def _run(self, *args, **kwargs):
        raise NotImplementedError("This tool does not support synchronous execution.")

    user_id: Optional[str] = None

    def __init__(self, user_id=None, **kwargs):
        super().__init__(user_id=user_id, **kwargs)

    async def _arun(self, user_id: str = None, document_id: str = None, instructions: Optional[str] = None):
        try:
            user_id = user_id or self.user_id
            doc_res = supabase.from_("documents").select("content").eq("id", document_id).eq("user_id", user_id).maybe_single().execute()
            if not doc_res.data:
                return f"Error: Document with ID {document_id} not found or you do not have permission to access it."

            enhanced_content = await enhance_document_with_ai(doc_res.data['content'], instructions)
            
            update_res = supabase.from_("documents").update({
                "content": enhanced_content,
                "status": "enhanced"
            }).eq("id", document_id).execute()

            if not update_res.data:
                return "Error: Failed to save the enhanced document. No data returned."

            return f"Successfully enhanced document {document_id}."
        except Exception as e:
            return f"An error occurred during enhancement: {str(e)}"

class EvaluateTool(BaseTool):
    name: str = "evaluate_and_update_legal_document"
    description: str = "Evaluates an existing legal document and saves the evaluation results to it."
    args_schema: Type[BaseModel] = EvaluateToolInput

    def _run(self, *args, **kwargs):
        raise NotImplementedError("This tool does not support synchronous execution.")

    user_id: Optional[str] = None

    def __init__(self, user_id=None, **kwargs):
        super().__init__(user_id=user_id, **kwargs)

    async def _arun(self, user_id: str = None, document_id: str = None, evaluation_criteria: str = "General legal review"):
        try:
            user_id = user_id or self.user_id
            doc_res = supabase.from_("documents").select("content").eq("id", document_id).eq("user_id", user_id).maybe_single().execute()
            if not doc_res.data:
                return f"Error: Document with ID {document_id} not found or you do not have permission to access it."
            
            evaluation_result = await evaluate_legal_document(doc_res.data['content'], evaluation_criteria)

            update_res = supabase.from_("documents").update({
                "evaluation_response": evaluation_result.dict()
            }).eq("id", document_id).execute()

            if not update_res.data:
                return "Error: Failed to save evaluation results. No data returned."

            return f"Successfully evaluated document {document_id}. The results have been saved. Here is a summary: {evaluation_result.evaluation_summary}"
        except Exception as e:
            return f"An error occurred during evaluation: {str(e)}"


class ComplianceTool(BaseTool):
    name: str = "check_and_update_document_compliance"
    description: str = "Checks the compliance of an existing legal document and saves the results to it."
    args_schema: Type[BaseModel] = ComplianceToolInput

    def _run(self, *args, **kwargs):
        raise NotImplementedError("This tool does not support synchronous execution.")
    
    user_id: Optional[str] = None

    def __init__(self, user_id=None, **kwargs):
        super().__init__(user_id=user_id, **kwargs)

    async def _arun(self, user_id: str = None, document_id: str = None):
        try:
            user_id = user_id or self.user_id
            doc_res = supabase.from_("documents").select("content, jurisdiction, document_type").eq("id", document_id).eq("user_id", user_id).maybe_single().execute()
            if not doc_res.data:
                return f"Error: Document with ID {document_id} not found or you do not have permission to access it."
            
            compliance_result = await check_document_compliance(
                document_content=doc_res.data['content'],
                jurisdiction=doc_res.data.get('jurisdiction'),
                document_type=doc_res.data.get('document_type')
            )
            
            update_res = supabase.from_("documents").update({
                "compliance_check_results": compliance_result.dict()
            }).eq("id", document_id).execute()
            
            if not update_res.data:
                return "Error: Failed to save compliance results. No data returned."

            return f"Successfully checked compliance for document {document_id}. The results have been saved."
        except Exception as e:
            return f"An error occurred during compliance check: {str(e)}"


class ResearchTool(BaseTool):
    name: str = "conduct_legal_research"
    description: str = "Conducts comprehensive legal research on a given query. Can ask clarifying questions to provide more focused research."
    args_schema: Type[BaseModel] = ResearchToolInput

    def _run(self, *args, **kwargs):
        raise NotImplementedError("This tool does not support synchronous execution.")
    
    user_id: Optional[str] = None

    def __init__(self, user_id=None, **kwargs):
        super().__init__(user_id=user_id, **kwargs)

    async def _arun(self, user_id: str = None, query: str = None, clarifying_answers: Optional[Dict[str, str]] = None):
        try:
            user_id = user_id or self.user_id
            
            # Verify user exists
            user_profile_data = await get_profile(user_id)
            if not user_profile_data:
                return "Error: User profile not found."
            
            research_result = await conduct_deep_research(query, clarifying_answers)
            
            return research_result
        except Exception as e:
            return f"An error occurred during legal research: {str(e)}"

# --- Core Agent Class ---
class ChatLawyerAgent:
    def __init__(self, openai_api_key: str, user_id: str, session_id: str, profile_data: dict = None):
        self.user_id = user_id
        self.profile_data = profile_data or {}
        self.llm = ChatOpenAI(model=AGENT_MODEL, temperature=0.2, openai_api_key=openai_api_key)
        
        # Initialize the persistent, user-specific chat history manager
        self.history = SupabaseChatMessageHistory(session_id=session_id, user_id=user_id)
        
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            chat_memory=self.history,
            return_messages=True
        )
        
        # Build system prompt with user context
        user_context = self._build_user_context()
        
        system_prompt = f"""
        You are Lawverra, a helpful and meticulous legal AI assistant.
        
        {user_context}
        
        Guidelines:
        - Before using any tool, first confirm with the user. Example: 'I can generate that document for you. Shall I proceed?'
        - If you need more information to use a tool, ask the user for the missing details.
        - When a tool successfully creates or modifies a document, inform the user of the document's ID.
        - You must operate on behalf of the authenticated user.
        - Use the user's profile information when relevant to provide personalized assistance.
        - Always address the user by their name when known.
        """
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        tools = [
            GenerateTool(user_id=self.user_id),
            EnhanceTool(user_id=self.user_id),
            EvaluateTool(user_id=self.user_id),
            ComplianceTool(user_id=self.user_id),
            ResearchTool(user_id=self.user_id)
        ]
        agent = create_openai_functions_agent(self.llm, tools, prompt)
        
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            memory=self.memory,
            verbose=True,
            handle_parsing_errors=True,
        )

    def _build_user_context(self) -> str:
        """Build user context string from profile data."""
        if not self.profile_data:
            return "User context: No profile information available."
        
        context_parts = []
        
        # Basic information
        if name := self.profile_data.get('full_name'):
            context_parts.append(f"User name: {name}")
        
        if role := self.profile_data.get('role'):
            role_desc = {
                'self': 'individual seeking legal assistance',
                'attorney': 'licensed attorney',
                'client': 'client of an attorney'
            }.get(role, role)
            context_parts.append(f"User role: {role_desc}")
        
        # Location information
        location_parts = []
        if city := self.profile_data.get('city'):
            location_parts.append(city)
        if state := self.profile_data.get('state'):
            location_parts.append(state)
        if location_parts:
            context_parts.append(f"User location: {', '.join(location_parts)}")
        
        # Contact information (for reference, don't include sensitive data)
        if phone := self.profile_data.get('phone_number'):
            context_parts.append(f"User has phone number on file")
        
        if not context_parts:
            return "User context: Profile setup incomplete."
        
        return "User context:\n" + "\n".join(f"- {part}" for part in context_parts)

    async def arun(self, message: str, contract_text: Optional[str] = None) -> Dict[str, Any]:
        full_input = message
        if contract_text:
            full_input = f"A document was provided by the user. Use it as context for this request:\n\n---\n{contract_text}\n---\n\nUser Request: {message}"

        # Only pass 'input' to the agent executor
        response = await self.agent_executor.ainvoke({
            "input": full_input
        })

        return response.get("output", "I'm sorry, I encountered an issue and couldn't process your request.")