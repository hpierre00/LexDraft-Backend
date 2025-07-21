"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { templateService, type CreateTemplateData } from "@/api/templates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface FileWithPreview extends File {
  preview?: string;
  state?: string;
  document_type?: string;
  error?: string;
}

// Mock data - replace with actual API calls
const states = [
  { id: "1", name: "California" },
  { id: "2", name: "New York" },
  { id: "3", name: "Texas" },
  { id: "4", name: "Florida" },
];

const documentTypes = [
  { id: "1", name: "Contract" },
  { id: "2", name: "Agreement" },
  { id: "3", name: "Legal Notice" },
  { id: "4", name: "Form" },
];

export function TemplateUpload() {
  const { toast } = useToast();
  const router = useRouter();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMode, setUploadMode] = useState<"single" | "multiple">("single");

  // Single upload form state
  const [singleFormData, setSingleFormData] = useState({
    state: "",
    document_type: "",
    file: null as File | null,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          state: "",
          document_type: "",
        })
      );

      if (uploadMode === "single") {
        setFiles(newFiles.slice(0, 1));
        setSingleFormData((prev) => ({ ...prev, file: newFiles[0] || null }));
      } else {
        setFiles((prev) => [...prev, ...newFiles]);
      }
    },
    [uploadMode]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    multiple: uploadMode === "multiple",
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    if (uploadMode === "single") {
      setSingleFormData((prev) => ({ ...prev, file: null }));
    }
  };

  const updateFileMetadata = (index: number, field: string, value: string) => {
    const newFiles = [...files];
    newFiles[index] = { ...newFiles[index], [field]: value };
    setFiles(newFiles);
  };

  const handleSingleUpload = async () => {
    if (
      !singleFormData.file ||
      !singleFormData.state ||
      !singleFormData.document_type
    ) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields and select a file.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadData: CreateTemplateData = {
        state: singleFormData.state,
        document_type: singleFormData.document_type,
        file: singleFormData.file,
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await templateService.create(uploadData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "Template uploaded successfully",
        description: "Your template has been added to the library.",
      });

      // Reset form
      setSingleFormData({ state: "", document_type: "", file: null });
      setFiles([]);

      // Redirect to templates page
      setTimeout(() => {
        router.push("/templates");
      }, 1000);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          "There was an error uploading your template. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleMultipleUpload = async () => {
    const validFiles = files.filter((file) => file.state && file.document_type);

    if (validFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No valid files",
        description:
          "Please ensure all files have state and document type selected.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Build templatesData array with metadata for each file
      const templatesData = validFiles.map((file) => ({
        state: file.state,
        document_type: file.document_type,
        template_name: file.name, // ensure backend can match file to metadata
      }));

      // Build FormData correctly for FastAPI
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("templates_data", JSON.stringify(templatesData));

      // Debug: log FormData keys and values
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90));
      }, 300);

      await templateService.uploadMultiple(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "Templates uploaded successfully",
        description: `${validFiles.length} templates have been added to the library.`,
      });

      // Reset form
      setFiles([]);

      // Redirect to templates page
      setTimeout(() => {
        router.push("/templates");
      }, 1000);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          "There was an error uploading your templates. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const canUpload =
    uploadMode === "single"
      ? singleFormData.file &&
        singleFormData.state &&
        singleFormData.document_type
      : files.length > 0 &&
        files.every((file) => file.state && file.document_type);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upload Templates</h1>
          <p className="text-muted-foreground">
            Add new templates to your library
          </p>
        </div>
      </div>

      {/* Upload Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Mode</CardTitle>
          <CardDescription>
            Choose whether to upload a single template or multiple templates at
            once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={uploadMode === "single" ? "default" : "outline"}
              onClick={() => {
                setUploadMode("single");
                setFiles([]);
                setSingleFormData({ state: "", document_type: "", file: null });
              }}
            >
              Single Upload
            </Button>
            <Button
              variant={uploadMode === "multiple" ? "default" : "outline"}
              onClick={() => {
                setUploadMode("multiple");
                setFiles([]);
                setSingleFormData({ state: "", document_type: "", file: null });
              }}
            >
              Multiple Upload
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>
            {uploadMode === "single" ? "Upload Template" : "Upload Templates"}
          </CardTitle>
          <CardDescription>
            Drag and drop your files here, or click to browse. Supported
            formats: PDF, DOC, DOCX, TXT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  {uploadMode === "single"
                    ? "Select one file to upload"
                    : "Select multiple files to upload"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Single Upload Form */}
      {uploadMode === "single" && files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Provide details for your template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{files[0].name}</p>
                <p className="text-sm text-muted-foreground">
                  {(files[0].size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeFile(0)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={singleFormData.state}
                  onValueChange={(value) =>
                    setSingleFormData((prev) => ({ ...prev, state: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type</Label>
                <Select
                  value={singleFormData.document_type}
                  onValueChange={(value) =>
                    setSingleFormData((prev) => ({
                      ...prev,
                      document_type: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multiple Upload Form */}
      {uploadMode === "multiple" && files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Provide details for each template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select
                        value={file.state || ""}
                        onValueChange={(value) =>
                          updateFileMetadata(index, "state", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.id}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <Select
                        value={file.document_type || ""}
                        onValueChange={(value) =>
                          updateFileMetadata(index, "document_type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Validation Status */}
                  <div className="mt-3 flex items-center space-x-2">
                    {file.state && file.document_type ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready to upload
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Missing information
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">
                  Uploading {uploadMode === "single" ? "template" : "templates"}
                  ...
                </span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {uploadProgress}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {files.length > 0 && !isUploading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Ready to upload {files.length}{" "}
                  {files.length === 1 ? "template" : "templates"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {uploadMode === "multiple" &&
                    `${
                      files.filter((f) => f.state && f.document_type).length
                    } of ${files.length} files are ready`}
                </p>
              </div>
              <Button
                onClick={
                  uploadMode === "single"
                    ? handleSingleUpload
                    : handleMultipleUpload
                }
                disabled={!canUpload}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload {uploadMode === "single" ? "Template" : "Templates"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
