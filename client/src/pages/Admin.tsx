import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Upload, Trash2, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { getLoginUrl } from "@/const";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries and mutations
  const documentsQuery = trpc.documents.list.useQuery();
  const uploadMutation = trpc.documents.upload.useMutation();
  const deleteMutation = trpc.documents.delete.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">You must be signed in to access the admin panel.</p>
          <a href={getLoginUrl()}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
          </a>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Only</h2>
          <p className="text-slate-600 mb-6">Only the owner can access the admin panel.</p>
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isValidType = file.type === "application/pdf" || file.type === "text/plain";
    if (!isValidType) {
      setUploadStatus("error");
      setUploadMessage("Please upload a PDF or text file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage("File size must be less than 10MB");
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage("Uploading and processing document...");

    try {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      const result = await uploadMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type === "application/pdf" ? "pdf" : "text",
        fileBuffer: base64,
      });

      setUploadStatus("success");
      setUploadMessage(
        `Document uploaded successfully! Created ${result.chunkCount} chunks for RAG processing.`
      );

      // Refresh documents list
      documentsQuery.refetch();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(
        error instanceof Error ? error.message : "Failed to upload document. Please try again."
      );
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await deleteMutation.mutateAsync({ documentId });
      documentsQuery.refetch();
    } catch (error) {
      alert("Failed to delete document");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Admin Panel - Document Management</h1>
          <div className="text-sm text-slate-600">{user?.name}</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Upload Section */}
        <Card className="p-8 mb-8 border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
          <div className="text-center">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload MBA Class Notes</h2>
            <p className="text-slate-600 mb-6">
              Upload PDF or text files containing your MBA class notes. These will be processed and
              indexed for the RAG system.
            </p>

            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileSelect}
                disabled={uploadStatus === "uploading"}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadStatus === "uploading"}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {uploadStatus === "uploading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Choose File
                  </>
                )}
              </Button>
            </div>

            {/* Upload Status */}
            {uploadStatus !== "idle" && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  uploadStatus === "success"
                    ? "bg-green-50 border border-green-200"
                    : uploadStatus === "error"
                      ? "bg-red-50 border border-red-200"
                      : "bg-blue-50 border border-blue-200"
                }`}
              >
                {uploadStatus === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : uploadStatus === "error" ? (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                ) : (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                )}
                <p
                  className={
                    uploadStatus === "success"
                      ? "text-green-800"
                      : uploadStatus === "error"
                        ? "text-red-800"
                        : "text-blue-800"
                  }
                >
                  {uploadMessage}
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500 mt-4">
              Supported formats: PDF, TXT • Maximum file size: 10MB
            </p>
          </div>
        </Card>

        {/* Documents List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Uploaded Documents</h2>

          {documentsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : documentsQuery.data && documentsQuery.data.length > 0 ? (
            <div className="space-y-4">
              {documentsQuery.data.map((doc) => (
                <Card key={doc.id} className="p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{doc.fileName}</h3>
                      <div className="flex gap-4 text-sm text-slate-600 mt-1">
                        <span>{doc.chunkCount} chunks</span>
                        <span>
                          {doc.fileSizeBytes ? `${(doc.fileSizeBytes / 1024).toFixed(1)} KB` : "Unknown size"}
                        </span>
                        <span>
                          {doc.createdAt
                            ? new Date(doc.createdAt).toLocaleDateString()
                            : "Unknown date"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleteMutation.isPending}
                    className="gap-2"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No documents uploaded yet. Upload your first MBA class notes above.</p>
            </Card>
          )}
        </div>

        {/* Info Section */}
        <Card className="mt-8 p-6 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-slate-900 mb-2">How it works</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>
              • <strong>Upload:</strong> Add your MBA class notes as PDF or text files
            </li>
            <li>
              • <strong>Processing:</strong> Documents are automatically chunked and embedded for RAG
            </li>
            <li>
              • <strong>Retrieval:</strong> When users ask questions, relevant chunks are retrieved
            </li>
            <li>
              • <strong>Generation:</strong> The LLM generates answers with source citations
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
