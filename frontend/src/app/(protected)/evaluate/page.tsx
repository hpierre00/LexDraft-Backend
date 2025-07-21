"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { documentService, type Document } from "@/api/documents"
import type { ComplianceCheckResult, DocumentEvaluationResponse } from "@/lib/types"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Shield,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Target,
  Lightbulb,
  AlertCircle,
  Upload,
  Eye,
} from "lucide-react"

export default function EvaluateDocumentPage() {
  const [documentContent, setDocumentContent] = useState<string>("")
  const [evaluationResult, setEvaluationResult] = useState<DocumentEvaluationResponse | null>(null)
  const [complianceResult, setComplianceResult] = useState<ComplianceCheckResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleEvaluate = async () => {
    setIsLoading(true)
    setError(null)
    setEvaluationResult(null)
    setComplianceResult(null)

    try {
      if (!selectedFile) {
        throw new Error("Please upload a document file to evaluate.")
      }

      const uploadResponse: Document = await documentService.upload(selectedFile)

      if (uploadResponse.content) {
        setDocumentContent(uploadResponse.content)
      } else {
        setDocumentContent("No preview available for this file type or content extraction failed.")
      }

      if (uploadResponse.evaluation_response) {
        setEvaluationResult(uploadResponse.evaluation_response)
      }

      if (uploadResponse.compliance_check_results) {
        setComplianceResult(uploadResponse.compliance_check_results)
      }
    } catch (err) {
      console.error("Evaluation failed:", err)
      setError((err as Error).message || "Failed to evaluate document. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskScoreColor = (riskScore: string) => {
    switch (riskScore?.toLowerCase()) {
      case "low":
        return "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      case "moderate":
        return "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30"
      case "high":
        return "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getRiskIcon = (riskScore: string) => {
    switch (riskScore?.toLowerCase()) {
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "moderate":
        return <AlertTriangle className="h-5 w-5 text-primary" />
      case "high":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getComplianceColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pass":
      case "good":
        return "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      case "warning":
      case "moderate":
        return "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30"
      case "fail":
      case "poor":
        return "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Document Intelligence Hub
        </h1>
        <p className="text-muted-foreground text-lg">AI-powered document evaluation and compliance checking</p>
      </div>

      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-secondary/50 to-accent/30">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Upload Your Document</CardTitle>
          <CardDescription className="text-base">
            Upload a document (PDF, DOCX) to receive comprehensive AI evaluation and compliance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setSelectedFile(file)
                  setDocumentContent("")
                  setEvaluationResult(null)
                  setComplianceResult(null)
                  setError(null)
                }
              }}
              className="flex-grow"
              accept=".pdf,.docx,.doc"
            />
            <Button
              onClick={handleEvaluate}
              disabled={isLoading || !selectedFile}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Evaluate Document
                </>
              )}
            </Button>
          </div>
          {selectedFile && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {documentContent && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>Document Preview</CardTitle>
            </div>
            <CardDescription>Extracted content from your uploaded document</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea value={documentContent} className="min-h-[200px] font-mono text-sm" readOnly />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {(evaluationResult || complianceResult) && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Analysis Results</h2>
            <p className="text-muted-foreground">Comprehensive evaluation and compliance assessment</p>
          </div>

          {/* Risk Score Overview */}
          {evaluationResult && (
            <Card className="border-2 bg-gradient-to-br from-secondary/30 to-accent/20">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  {getRiskIcon(evaluationResult.risk_score)}
                  <CardTitle className="text-2xl">Risk Assessment</CardTitle>
                </div>
                <div className="flex justify-center">
                  <Badge className={`text-lg px-6 py-2 ${getRiskScoreColor(evaluationResult.risk_score)}`}>
                    {evaluationResult.risk_score} Risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground text-lg">{evaluationResult.evaluation_summary}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Evaluation Results */}
            {evaluationResult && (
              <div className="space-y-6">
                <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <CardTitle className="text-green-700 dark:text-green-300">Strengths</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {evaluationResult.strengths?.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 dark:border-l-red-400">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <CardTitle className="text-red-700 dark:text-red-300">Weaknesses</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {evaluationResult.weaknesses?.map((weakness, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      <CardTitle className="text-primary">Potential Loopholes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {evaluationResult.loopholes?.map((loophole, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{loophole}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Compliance Results */}
            {complianceResult && (
              <div className="space-y-6">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle className="text-primary">Compliance Status</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Formatting</span>
                      <Badge className={getComplianceColor(complianceResult.formatting)}>
                        {complianceResult.formatting}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Jurisdiction Fit</span>
                      <Badge className={getComplianceColor(complianceResult.jurisdiction_fit)}>
                        {complianceResult.jurisdiction_fit}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <span className="font-medium">Required Clauses</span>
                      <ul className="space-y-1">
                        {complianceResult.required_clauses?.map((clause, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{clause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {evaluationResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <CardTitle className="text-primary">Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {evaluationResult.recommendations_for_update?.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle className="text-primary">Strategic Actions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <p className="text-sm font-medium text-primary mb-2">Primary Strategy</p>
                      <p className="text-sm text-foreground">{evaluationResult.strategy}</p>
                    </div>
                    <ul className="space-y-2">
                      {evaluationResult.strategies_for_update?.map((strategy, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Document Metadata */}
          {evaluationResult?.metadata && (
            <Card className="bg-gradient-to-r from-secondary/30 to-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Document Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Parties</p>
                      <p className="text-sm font-medium">{evaluationResult.metadata.parties}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Subject</p>
                      <p className="text-sm font-medium">{evaluationResult.metadata.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{evaluationResult.metadata.document_date}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
