"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Send,
  PlusCircle,
  Paperclip,
  Download,
  Edit,
  Save,
  MessageSquare,
  Sparkles,
  FileText,
  XCircle,
} from "lucide-react";
import { Logo } from "@/components/logo";

import { agentService, ChatSession } from "@/api/agent";
import { documentService } from "@/api/documents";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

// --- Type Definitions ---
interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  isEditing?: boolean;
  documentId?: string; // To link a message to a downloadable/editable document
  data?: any; // For displaying structured JSON data from tools
}

// --- Main Chat Page Component ---
export default function ChatPage() {
  const { user, isAuthInitialized } = useAuth();
  const { toast } = useToast();

  // State Management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // File Upload Context
  const [fileContext, setFileContext] = useState<string | undefined>();
  const [fileContextName, setFileContextName] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data Fetching Effects ---

  // Fetch all chat sessions on initial load
  useEffect(() => {
    if (!isAuthInitialized || !user) return;

    const fetchSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const fetchedSessions = await agentService.listSessions();
        setSessions(fetchedSessions);
      } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
        toast({
          title: "Could not load chats",
          description:
            "Failed to fetch your past conversations. This feature requires a backend update.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [isAuthInitialized, user, toast]);

  // Effect to scroll to the bottom of the chat only when sending new messages
  useEffect(() => {
    // Only auto-scroll when not loading history and we have messages
    // Also scroll when sending a message (isSending becomes false after getting response)
    if (!isLoadingHistory && messages.length > 0 && activeSessionId) {
      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoadingHistory, activeSessionId]);

  // --- Event Handlers ---

  const handleNewChat = () => {
    const newSessionId = uuidv4();
    setActiveSessionId(newSessionId);
    setMessages([]); // This won't trigger auto-scroll since isLoadingHistory will be false and messages will be empty
    setFileContext(undefined);
    setFileContextName(undefined);
    setSessions((prev) => [
      {
        session_id: newSessionId,
        user_id: user!.id,
        title: "New Chat",
        updated_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === activeSessionId) return;

    setActiveSessionId(sessionId);
    setIsLoadingHistory(true);
    setMessages([]);

    try {
      console.log(`Loading chat history for session: ${sessionId}`);
      const history = await agentService.getChatHistory(sessionId);

      console.log("Received chat history:", history);

      // Convert LangChain history format to our Message format
      const convertedMessages: Message[] = [];

      if (history.history && Array.isArray(history.history)) {
        console.log(`Converting ${history.history.length} messages`);

        for (let i = 0; i < history.history.length; i++) {
          const msg = history.history[i];
          console.log(`Processing message ${i}:`, msg);

          // Extract content safely
          let content = "";
          if (typeof msg.content === "string") {
            content = msg.content;
          } else if (msg.content && typeof msg.content === "object") {
            // Handle different content formats
            const contentObj = msg.content as any;
            if (contentObj.text) {
              content = contentObj.text;
            } else if (contentObj.content) {
              content = contentObj.content;
            } else {
              content = JSON.stringify(msg.content);
            }
          } else {
            content = String(msg.content || "");
          }

          console.log(`Extracted content: "${content}"`);

          if (msg.type === "human" || msg.type === "user") {
            convertedMessages.push({
              id: uuidv4(),
              sender: "user",
              content: content || "[Empty message]",
            });
          } else if (msg.type === "ai" || msg.type === "assistant") {
            convertedMessages.push({
              id: uuidv4(),
              sender: "ai",
              content: content || "[Empty response]",
            });
          } else {
            console.warn(`Unknown message type: ${msg.type}`, msg);
            // Still try to extract content for unknown types
            if (content) {
              convertedMessages.push({
                id: uuidv4(),
                sender: "ai", // Default to AI for unknown types
                content: content,
              });
            }
          }
        }
      } else {
        console.log(
          "No history array found or history is not an array:",
          history
        );
      }

      console.log(`Converted ${convertedMessages.length} messages`);
      setMessages(convertedMessages);

      // Update session title if available
      if (history.title) {
        setSessions((prev) =>
          prev.map((session) =>
            session.session_id === sessionId
              ? { ...session, title: history.title }
              : session
          )
        );
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      toast({
        title: "Error",
        description: `Failed to load chat history: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isSending || !activeSessionId) return;

    const userMessage: Message = {
      id: uuidv4(),
      sender: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    if (fileContextName) {
      setFileContextName(undefined);
    }

    try {
      const response = await agentService.chat({
        sessionId: activeSessionId,
        message: userMessage.content,
        contractText: fileContext,
      });

      const docIdRegex = /document ID is: ([a-fA-F0-9-]+)/;
      const match =
        typeof response.response === "string"
          ? response.response.match(docIdRegex)
          : null;

      const aiMessage: Message = {
        id: uuidv4(),
        sender: "ai",
        content:
          typeof response.response === "string"
            ? response.response
            : JSON.stringify(response.response, null, 2),
        documentId: match ? match[1] : undefined,
        data:
          typeof response.response !== "string" ? response.response : undefined,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the agent.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      setFileContext(undefined);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({ title: "Uploading...", description: `Reading ${file.name}...` });
    try {
      const response = await agentService.uploadForContext(file);
      setFileContext(response.contract_text);
      setFileContextName(file.name);
      toast({
        title: "File Ready",
        description: `${file.name} is loaded and will be sent with your next message.`,
      });
    } catch (error) {
      console.error("Failed to upload file for context:", error);
      toast({
        title: "File Upload Failed",
        description: "Could not read the uploaded file.",
        variant: "destructive",
      });
    }
    // Reset file input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (
    documentId: string,
    docType: "pdf" | "docx"
  ) => {
    toast({
      title: "Preparing Download...",
      description: `Your document is being prepared.`,
    });
    try {
      if (docType === "docx") {
        await documentService.downloadDocx(documentId);
      } else {
        await documentService.download(documentId);
      }
    } catch (error) {
      console.error(`Failed to download document ${documentId}`, error);
      toast({
        title: "Download Failed",
        description: "There was an error while downloading your file.",
        variant: "destructive",
      });
    }
  };

  const toggleEditMode = (messageId: string) => {
    setMessages((msgs) =>
      msgs.map((m) =>
        m.id === messageId ? { ...m, isEditing: !m.isEditing } : m
      )
    );
  };

  const handleContentChange = (messageId: string, newContent: string) => {
    setMessages((msgs) =>
      msgs.map((m) => (m.id === messageId ? { ...m, content: newContent } : m))
    );
  };

  const handleSaveChanges = async (message: Message) => {
    if (!message.documentId) return;
    toast({ title: "Saving...", description: "Your changes are being saved." });
    try {
      await documentService.update(message.documentId, {
        content: message.content,
      });
      toast({
        title: "Success!",
        description: "Document updated successfully.",
      });
      toggleEditMode(message.id);
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your changes to the document.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gradient-to-br from-background to-secondary/20">
      {/* Sidebar */}
      <aside className="w-80 bg-card/95 backdrop-blur-xl border-r border-primary/10 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Lawverra Chat
              </h1>
              <p className="text-xs text-muted-foreground">
                AI Legal Assistant
              </p>
            </div>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleNewChat}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>

        {/* Chat Sessions */}
        <ScrollArea className="flex-1">
          {isLoadingSessions ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-secondary/30 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="p-4 space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => handleSelectSession(session.session_id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl transition-all duration-200 group hover:scale-[1.02]",
                    activeSessionId === session.session_id
                      ? "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 shadow-lg"
                      : "hover:bg-secondary/50 border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-2 transition-colors",
                        activeSessionId === session.session_id
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium truncate text-sm",
                          activeSessionId === session.session_id
                            ? "text-primary"
                            : "text-foreground"
                        )}
                      >
                        {session.title || "New Conversation"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(session.updated_at).toLocaleDateString()} •{" "}
                        {new Date(session.updated_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No conversations yet.
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-primary/10">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Secure & Private
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your conversations are encrypted
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full">
        {activeSessionId ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-card/50 backdrop-blur-xl border-b border-primary/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo size="md" />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {sessions.find((s) => s.session_id === activeSessionId)
                        ?.title || "Chat Session"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      AI Legal Assistant • Always here to help
                    </p>
                  </div>
                </div>
                {fileContextName && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg border border-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">
                      {fileContextName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFileContext(undefined);
                        setFileContextName(undefined);
                      }}
                      className="h-6 w-6 p-0 hover:bg-destructive/20"
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area - Fixed Height with Scrolling */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {isLoadingHistory && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading conversation...
                        </span>
                      </div>
                    )}
                    {messages.map((msg, index) => {
                      console.log(`Rendering message ${index}:`, msg);
                      return (
                        <ChatMessage
                          key={msg.id}
                          message={msg}
                          user={user}
                          onDownload={handleDownload}
                          onToggleEdit={() => toggleEditMode(msg.id)}
                          onContentChange={(newContent) =>
                            handleContentChange(msg.id, newContent)
                          }
                          onSaveChanges={() => handleSaveChanges(msg)}
                        />
                      );
                    })}
                    {isSending && <ThinkingMessage />}
                  </div>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Chat Input - Fixed at bottom */}
            <div className="flex-shrink-0 border-t border-primary/10">
              <ChatInput
                input={input}
                setInput={setInput}
                isSending={isSending}
                onSendMessage={handleSendMessage}
                onFileUploadClick={() => fileInputRef.current?.click()}
                fileContextName={fileContextName}
                onClearFileContext={() => {
                  setFileContext(undefined);
                  setFileContextName(undefined);
                }}
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.docx,.txt"
            />
          </>
        ) : (
          <WelcomeScreen onNewChat={handleNewChat} />
        )}
      </main>
    </div>
  );
}

// --- Sub-components ---

const ChatMessage = ({
  message,
  user,
  onDownload,
  onToggleEdit,
  onContentChange,
  onSaveChanges,
}: {
  message: Message;
  user: any;
  onDownload: (id: string, type: "pdf" | "docx") => void;
  onToggleEdit: () => void;
  onContentChange: (newContent: string) => void;
  onSaveChanges: () => void;
}) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn("flex items-start gap-4 group", isUser && "justify-end")}
    >
      {!isUser && (
        <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-lg">
          <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold">
            AI
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[75%] space-y-2", isUser && "text-right")}>
        <Card
          className={cn(
            "relative overflow-hidden transition-all duration-200 group-hover:shadow-lg",
            isUser
              ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-primary/20 shadow-lg"
              : "bg-card/80 backdrop-blur-xl border-primary/10 shadow-md hover:shadow-xl"
          )}
        >
          <CardContent className="p-4">
            {message.isEditing ? (
              <Textarea
                value={message.content}
                onChange={(e) => onContentChange(e.target.value)}
                className="bg-background/50 text-foreground min-h-[200px] border-primary/20"
                rows={10}
              />
            ) : (
              <div className="text-base whitespace-pre-wrap leading-relaxed">
                {message.content || "[No content]"}
              </div>
            )}

            {message.data && (
              <Card className="mt-4 bg-secondary/20 border-primary/10">
                <CardContent className="p-3">
                  <pre className="text-xs whitespace-pre-wrap text-muted-foreground font-mono">
                    {JSON.stringify(message.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Message Actions */}
            {!isUser && (
              <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {message.isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSaveChanges}
                    className="h-8 text-xs hover:bg-primary/10"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleEdit}
                    className="h-8 text-xs hover:bg-primary/10"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}

                {message.documentId && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(message.documentId!, "pdf")}
                      className="h-8 text-xs hover:bg-primary/10"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(message.documentId!, "docx")}
                      className="h-8 text-xs hover:bg-primary/10"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      DOCX
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {isUser && (
        <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-lg">
          <AvatarFallback className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground font-semibold">
            {user?.full_name?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              "U"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

const ThinkingMessage = () => (
  <div className="flex items-start gap-4">
    <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-lg">
      <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold">
        AI
      </AvatarFallback>
    </Avatar>
    <Card className="bg-card/80 backdrop-blur-xl border-primary/10 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Lawverra is thinking...
          </span>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ChatInput = ({
  input,
  setInput,
  isSending,
  onSendMessage,
  onFileUploadClick,
  fileContextName,
  onClearFileContext,
}: {
  input: string;
  setInput: (value: string) => void;
  isSending: boolean;
  onSendMessage: () => void;
  onFileUploadClick: () => void;
  fileContextName?: string;
  onClearFileContext: () => void;
}) => (
  <div className="p-6 bg-card/50 backdrop-blur-xl border-t border-primary/10">
    <div className="max-w-4xl mx-auto">
      {fileContextName && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Document attached: {fileContextName}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFileContext}
            className="ml-auto h-6 w-6 p-0 hover:bg-destructive/20"
          >
            <XCircle className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          placeholder="Ask Lawverra anything, or describe a document you want to create..."
          className="py-6 pr-32 pl-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary bg-background/50 backdrop-blur-xl shadow-lg text-base"
          disabled={isSending}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-3 top-1/2 -translate-y-1/2 hover:bg-primary/10"
          onClick={onFileUploadClick}
          disabled={isSending}
        >
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button
          type="submit"
          size="icon"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl w-12 h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={onSendMessage}
          disabled={isSending || !input.trim()}
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  </div>
);

const WelcomeScreen = ({ onNewChat }: { onNewChat: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center mb-6 shadow-2xl">
      <MessageSquare className="h-12 w-12 text-primary-foreground" />
    </div>
    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
      Welcome to Lawverra Chat
    </h2>
    <p className="text-muted-foreground max-w-md mb-8 text-lg leading-relaxed">
      Your AI-powered legal assistant is ready to help. Start a conversation or
      select from your previous chats.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl">
      <Card className="p-4 bg-card/50 border-primary/10 hover:shadow-lg transition-all duration-200">
        <FileText className="h-8 w-8 text-primary mb-2" />
        <h3 className="font-semibold mb-1">Generate Documents</h3>
        <p className="text-sm text-muted-foreground">
          Create legal documents from scratch
        </p>
      </Card>
      <Card className="p-4 bg-card/50 border-primary/10 hover:shadow-lg transition-all duration-200">
        <Sparkles className="h-8 w-8 text-primary mb-2" />
        <h3 className="font-semibold mb-1">Legal Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Get insights on existing documents
        </p>
      </Card>
      <Card className="p-4 bg-card/50 border-primary/10 hover:shadow-lg transition-all duration-200">
        <MessageSquare className="h-8 w-8 text-primary mb-2" />
        <h3 className="font-semibold mb-1">Ask Questions</h3>
        <p className="text-sm text-muted-foreground">
          Get legal guidance and advice
        </p>
      </Card>
    </div>
    <Button
      onClick={onNewChat}
      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-8 py-3"
    >
      <PlusCircle className="mr-2 h-5 w-5" />
      Start New Conversation
    </Button>
  </div>
);
