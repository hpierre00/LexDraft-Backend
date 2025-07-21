import json
from typing import List, Optional

from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage, messages_from_dict, messages_to_dict

from app.models.database import supabase

class SupabaseChatMessageHistory(BaseChatMessageHistory):
    """
    A chat message history implementation that stores messages in Supabase.

    This class is designed to work with LangChain's memory modules, providing
    a persistent, user-specific storage layer for conversations.
    """

    def __init__(self, session_id: str, user_id: str, title: Optional[str] = None):
        self.session_id = session_id
        self.user_id = user_id
        self.title = title or "New Chat"

    @property
    def messages(self) -> List[BaseMessage]:
        """Retrieve messages from Supabase."""
        response = (
            supabase.from_("chat_histories")
            .select("history")
            .eq("session_id", self.session_id)
            .eq("user_id", self.user_id)
            .maybe_single()
            .execute()
        )

        # Defensive: response could be None, or .data could be None, or .data could be a dict without 'history'
        if not response or not getattr(response, 'data', None):
            return []
        if not isinstance(response.data, dict) or not response.data.get("history"):
            return []
        return messages_from_dict(response.data["history"])

    def add_messages(self, messages: List[BaseMessage]) -> None:
        """Append new messages to the existing history in Supabase."""
        current_messages = self.messages
        # The LangChain memory objects manage the list, so we just need to save the new total list.
        # We combine the retrieved messages with the new ones.
        updated_messages = current_messages + messages
        self._upsert_history(updated_messages)

    def _upsert_history(self, messages: List[BaseMessage]) -> None:
        """
        Saves the complete list of messages to the Supabase table,
        overwriting any existing history for the session.
        """
        history_dict = messages_to_dict(messages)
        
        # Generate intelligent title if this is the first message
        if not self._session_exists() and messages and len(messages) > 0:
            self.title = self._generate_title_from_messages(messages)
        
        # Use upsert to work with existing unique constraint
        try:
            supabase.from_("chat_histories").upsert(
                {
                    "session_id": self.session_id,
                    "user_id": self.user_id,
                    "title": self.title,
                    "history": history_dict,
                },
                on_conflict="session_id,user_id"  # Use the existing unique constraint
            ).execute()
        except Exception as e:
            # Fallback to insert if upsert fails
            print(f"Upsert failed, trying insert: {e}")
            supabase.from_("chat_histories").insert({
                "session_id": self.session_id,
                "user_id": self.user_id,
                "title": self.title,
                "history": history_dict,
            }).execute()

    def _session_exists(self) -> bool:
        """Check if the session already exists in the database."""
        response = (
            supabase.from_("chat_histories")
            .select("id")
            .eq("session_id", self.session_id)
            .eq("user_id", self.user_id)
            .maybe_single()
            .execute()
        )
        return response and response.data is not None

    def _generate_title_from_messages(self, messages: List[BaseMessage]) -> str:
        """Generate an intelligent title from the first user message."""
        if not messages:
            return "New Chat"
        
        # Find the first human/user message
        for message in messages:
            if hasattr(message, 'type') and message.type == 'human':
                content = message.content[:50]  # First 50 characters
                # Clean up the content for use as a title
                title = content.strip().replace('\n', ' ').replace('\r', '')
                if len(title) > 47:
                    title = title[:47] + "..."
                return title or "New Chat"
        
        return "New Chat"

    def update_title(self, new_title: str) -> None:
        """Update the title of the chat session."""
        self.title = new_title
        supabase.from_("chat_histories").update(
            {"title": new_title}
        ).eq("session_id", self.session_id).eq("user_id", self.user_id).execute()

    def clear(self) -> None:
        """Clear all messages from the history in Supabase."""
        supabase.from_("chat_histories").delete().eq("session_id", self.session_id).eq(
            "user_id", self.user_id
        ).execute()