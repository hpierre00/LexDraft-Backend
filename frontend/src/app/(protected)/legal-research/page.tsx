"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Search,
  MessageSquare,
  BookOpen,
  Copy,
  CheckCircle,
  Download,
  FileText,
  History,
  Trash2,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  researchApi,
  ResearchResponse,
  ResearchHistoryItem,
  ResearchHistoryDetail,
  ResearchHistoryList,
} from "@/api/research";
import { useAuth } from "@/providers/auth-provider";
import { authService } from "@/api/auth";

interface ClarifyingQuestion {
  id: string;
  question: string;
  answer: string;
}

export default function LegalResearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [researchResult, setResearchResult] = useState<ResearchResponse | null>(
    null
  );
  const [clarifyingQuestions, setClarifyingQuestions] = useState<
    ClarifyingQuestion[]
  >([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentResearchId, setCurrentResearchId] = useState<string | null>(
    null
  );

  // History state
  const [researchHistory, setResearchHistory] = useState<ResearchHistoryItem[]>(
    []
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const parseQuestionsFromResult = (result: string): string[] => {
    const lines = result.split("\n");
    const questions: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\./)) {
        questions.push(trimmed.replace(/^\d+\.\s*/, ""));
      }
    }

    return questions;
  };

  const handleInitialResearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResearchResult(null);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const data = await researchApi.conductResearch(
        {
          query,
          save_to_history: true,
          research_id: currentResearchId || undefined,
        },
        token
      );

      setCurrentResearchId(data.research_id || null);

      if (data.success) {
        // Check if the result contains clarifying questions
        if (data.result.includes("Clarifying Questions:")) {
          const [questionsSection, preliminaryReport] = data.result.split(
            "### Preliminary Research Report:"
          );
          const questionText = questionsSection
            .replace("### Clarifying Questions:", "")
            .trim();
          const questions = parseQuestionsFromResult(questionText);

          setClarifyingQuestions(
            questions.map((q, index) => ({
              id: `q${index}`,
              question: q,
              answer: "",
            }))
          );
          setShowQuestions(true);
          setResearchResult({ ...data, result: preliminaryReport.trim() });
        } else {
          setResearchResult(data);
        }

        // Reload history if visible
        if (showHistory) {
          loadResearchHistory(historyPage);
        }
      } else {
        setError(data.message || "Research failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocusedResearch = async () => {
    if (clarifyingQuestions.some((q) => !q.answer.trim())) {
      setError("Please answer all clarifying questions before proceeding");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const clarifyingAnswers = clarifyingQuestions.reduce((acc, q) => {
        acc[q.question] = q.answer;
        return acc;
      }, {} as Record<string, string>);

      const token = authService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const data = await researchApi.conductResearch(
        {
          query,
          clarifying_answers: clarifyingAnswers,
          save_to_history: true,
          research_id: currentResearchId || undefined,
        },
        token
      );

      if (data.success) {
        setResearchResult(data);
        setShowQuestions(false);

        // Reload history if visible
        if (showHistory) {
          loadResearchHistory(historyPage);
        }
      } else {
        setError(data.message || "Focused research failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnswer = (id: string, answer: string) => {
    setClarifyingQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, answer } : q))
    );
  };

  const resetResearch = () => {
    setQuery("");
    setResearchResult(null);
    setClarifyingQuestions([]);
    setShowQuestions(false);
    setError(null);
    setCopied(false);
    setCurrentResearchId(null);
  };

  const copyToClipboard = async () => {
    if (!researchResult?.result) return;

    try {
      await navigator.clipboard.writeText(researchResult.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const downloadAsText = () => {
    if (!researchResult?.result) return;

    const element = document.createElement("a");
    const file = new Blob([researchResult.result], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `legal-research-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer for headings, bold, and lists
    const lines = text.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("### ")) {
        return (
          <h3
            key={index}
            className="text-lg font-semibold mt-6 mb-3 text-primary"
          >
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="text-xl font-semibold mt-8 mb-4 text-primary"
          >
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-2xl font-bold mt-8 mb-4 text-primary">
            {line.replace("# ", "")}
          </h1>
        );
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={index} className="font-semibold my-2">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <div key={index} className="my-1 ml-4">
            <span className="font-medium text-primary">
              {line.match(/^\d+\./)?.[0]}
            </span>
            <span className="ml-2">{line.replace(/^\d+\.\s*/, "")}</span>
          </div>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <div key={index} className="my-1 ml-4 flex items-start">
            <span className="text-primary mr-2">•</span>
            <span>{line.replace(/^[-*]\s*/, "")}</span>
          </div>
        );
      }
      if (line.trim() === "") {
        return <div key={index} className="my-2"></div>;
      }
      return (
        <p key={index} className="my-2 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  // History management functions
  const loadResearchHistory = async (page: number = 1) => {
    setHistoryLoading(true);
    try {
      const token = authService.getToken();
      if (!token) return;

      const historyData = await researchApi.getResearchHistory(page, 10, token);
      setResearchHistory(historyData.items);
      setHistoryTotal(historyData.total);
      setHistoryPage(page);
    } catch (err) {
      console.error("Failed to load research history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadResearchFromHistory = async (researchId: string) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const research = await researchApi.getResearchHistoryDetail(
        researchId,
        token
      );

      // Load the research data
      setQuery(research.query);
      setCurrentResearchId(research.id);

      if (
        research.status === "questions_pending" &&
        research.clarifying_questions
      ) {
        // Load preliminary result and questions
        if (research.preliminary_result) {
          setResearchResult({
            result: research.preliminary_result,
            success: true,
            research_id: research.id,
          });
        }

        setClarifyingQuestions(
          research.clarifying_questions.map((q, index) => ({
            id: `q${index}`,
            question: q,
            answer: research.clarifying_answers?.[q] || "",
          }))
        );
        setShowQuestions(true);
      } else if (research.final_result) {
        // Load final result
        setResearchResult({
          result: research.final_result,
          success: true,
          research_id: research.id,
        });
      } else if (research.preliminary_result) {
        // Load preliminary result
        setResearchResult({
          result: research.preliminary_result,
          success: true,
          research_id: research.id,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load research");
    }
  };

  const deleteResearchFromHistory = async (researchId: string) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      await researchApi.deleteResearchHistory(researchId, token);

      // Reload history
      await loadResearchHistory(historyPage);

      // If we deleted the current research, reset
      if (currentResearchId === researchId) {
        resetResearch();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete research"
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 transition-colors">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        );
      case "questions_pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 transition-colors">
            <MessageSquare className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border hover:bg-accent transition-colors">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
    }
  };

  // Load history on component mount and when showHistory changes
  useEffect(() => {
    if (showHistory) {
      loadResearchHistory();
    }
  }, [showHistory]);

  // Auto-load history when component mounts if user exists
  useEffect(() => {
    if (user) {
      setShowHistory(true); // Auto-show history sidebar
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex gap-6">
          {/* History Sidebar */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              showHistory ? "w-80" : "w-14"
            }`}
          >
            <div className="sticky top-6 space-y-4">
              <Button
                variant={showHistory ? "default" : "outline"}
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className={`w-full flex items-center gap-2 transition-all duration-300 ${
                  showHistory
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    : "border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <History className="h-4 w-4" />
                {showHistory && <span>Hide History</span>}
              </Button>

              {showHistory && (
                <Card className="h-[600px] overflow-hidden backdrop-blur-sm bg-background/95 border-0 shadow-xl ring-1 ring-border/50">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <History className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                          Research Archive
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {historyTotal > 0
                            ? `${historyTotal} research sessions`
                            : "No research yet"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[460px]">
                      {historyLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                          <div className="relative">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <div className="absolute inset-0 h-6 w-6 animate-pulse bg-primary/20 rounded-full"></div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Loading research history...
                          </p>
                        </div>
                      ) : researchHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                          <div className="p-3 bg-muted rounded-full">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-foreground">
                              No research history yet
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Start your first research to build your archive
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {researchHistory.map((item, index) => (
                            <Card
                              key={item.id}
                              className={`group cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] border-0 ring-1 ring-border/50 hover:ring-primary/30 ${
                                currentResearchId === item.id
                                  ? "ring-2 ring-primary shadow-md bg-gradient-to-r from-primary/5 to-primary/10"
                                  : "hover:bg-accent/80"
                              }`}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm leading-tight text-foreground truncate">
                                      {item.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {item.query}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteResearchFromHistory(item.id);
                                    }}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(item.status)}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {new Date(
                                        item.created_at
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      loadResearchFromHistory(item.id)
                                    }
                                    className="h-6 px-2 text-xs bg-primary/10 hover:bg-primary/20 text-primary font-medium opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Load
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    {historyTotal > 10 && (
                      <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadResearchHistory(historyPage - 1)}
                          disabled={historyPage <= 1}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {historyPage} of {Math.ceil(historyTotal / 10)}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadResearchHistory(historyPage + 1)}
                          disabled={historyPage * 10 >= historyTotal}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Hero Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-2xl"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-md">
                          <BookOpen className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-primary/50 to-primary/30 rounded-xl blur-md opacity-30"></div>
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-foreground">
                          Legal Research
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1 w-8 bg-gradient-to-r from-primary to-primary/60 rounded-full"></div>
                          <span className="text-base font-medium text-primary">
                            Assistant
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                      Harness the power of advanced AI for comprehensive legal
                      research. Our intelligent system asks clarifying questions
                      to deliver
                      <span className="font-semibold text-foreground">
                        {" "}
                        precise, focused results
                      </span>{" "}
                      tailored to your needs.
                    </p>
                  </div>
                  <div className="hidden lg:flex flex-col items-end space-y-2">
                    <Badge className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20 px-3 py-1.5 text-sm font-medium">
                      <Zap className="h-3 w-3 mr-1.5" />
                      Powered by GPT-4 Turbo
                    </Badge>
                    {currentResearchId && (
                      <Badge className="bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 px-2.5 py-1">
                        <FileText className="h-3 w-3 mr-1" />
                        Research Loaded
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Research Query Section */}
            <Card className="border-0 shadow-xl ring-1 ring-border/50 backdrop-blur-sm bg-background/95">
              <CardHeader className="pb-4 bg-gradient-to-r from-accent/20 to-accent/10 rounded-t-lg border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-sm">
                    <Search className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      Research Query
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-0.5">
                      Describe your legal research needs in detail for optimal
                      results
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="query"
                    className="text-base font-semibold text-foreground flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    Your Research Question
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="query"
                      placeholder="Example: What are the procedural requirements and deadlines for filing a motion to compel discovery in federal court under Rule 37? Include any recent case law developments and jurisdiction-specific considerations..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[120px] text-base resize-none border-2 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg transition-all duration-200 p-3 bg-background"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          query.length > 450
                            ? "text-red-600 border-red-200"
                            : query.length > 300
                            ? "text-amber-600 border-amber-200"
                            : "text-muted-foreground border-border"
                        }`}
                      >
                        {query.length}/500
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="p-1 bg-blue-100 rounded-md mt-0.5">
                        <MessageSquare className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          💡 Pro Tips for Better Results
                        </p>
                        <ul className="text-xs text-blue-700 space-y-0.5">
                          <li>
                            • Include specific jurisdiction (federal, state, or
                            local court)
                          </li>
                          <li>
                            • Mention relevant statutes, rules, or case law if
                            known
                          </li>
                          <li>
                            • Specify the legal area (civil procedure, criminal
                            law, etc.)
                          </li>
                          <li>
                            • Include factual context or case type when relevant
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleInitialResearch}
                    disabled={!query.trim() || isLoading}
                    className="flex-1 sm:flex-none h-11 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-200 text-base font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Researching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        <span>Start Deep Research</span>
                      </>
                    )}
                  </Button>
                  {(researchResult || showQuestions) && (
                    <Button
                      variant="outline"
                      onClick={resetResearch}
                      className="h-11 px-4 border-2 border-border hover:border-border/80 hover:bg-accent transition-all duration-200"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      New Research
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Clarifying Questions */}
            {showQuestions && (
              <Card className="mb-4 border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <MessageSquare className="h-4 w-4" />
                    Clarifying Questions
                  </CardTitle>
                  <CardDescription className="text-orange-600 dark:text-orange-400">
                    Please answer these questions to help us provide more
                    focused and relevant research results.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {clarifyingQuestions.map((q, index) => (
                    <div
                      key={q.id}
                      className="space-y-2 p-3 bg-background rounded-lg border"
                    >
                      <Label
                        htmlFor={`answer-${q.id}`}
                        className="text-base font-medium"
                      >
                        <Badge
                          variant="outline"
                          className="mr-2 bg-primary text-primary-foreground"
                        >
                          Q{index + 1}
                        </Badge>
                        {q.question}
                      </Label>
                      <Textarea
                        id={`answer-${q.id}`}
                        placeholder="Please provide a detailed answer..."
                        value={q.answer}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        className="min-h-[70px] resize-none"
                      />
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3">
                    <p className="text-sm text-muted-foreground">
                      {
                        clarifyingQuestions.filter((q) => q.answer.trim())
                          .length
                      }{" "}
                      of {clarifyingQuestions.length} questions answered
                    </p>
                    <Button
                      onClick={handleFocusedResearch}
                      disabled={
                        isLoading ||
                        clarifyingQuestions.some((q) => !q.answer.trim())
                      }
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Continue Research
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Research Results */}
            {researchResult && (
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">
                          Research Results
                        </CardTitle>
                        <CardDescription className="text-base mt-0.5">
                          {showQuestions
                            ? "Preliminary research findings"
                            : "Comprehensive research analysis"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAsText}
                        className="flex items-center gap-1.5"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <div className="prose prose-base max-w-none text-foreground">
                      {renderMarkdown(researchResult.result)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
