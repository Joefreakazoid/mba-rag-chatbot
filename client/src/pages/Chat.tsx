import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Send,
  Loader2,
  BookOpen,
  Linkedin,
  ArrowLeft,
  Settings,
  MessageSquare,
} from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    documentId?: number;
    documentName?: string;
    excerpt?: string;
  }>;
  createdAt?: Date;
}

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [sessionId, setSessionId] = useState<string>("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get or create session
  const getSessionQuery = trpc.chat.getOrCreateSession.useQuery(
    { sessionId: sessionId || undefined },
    { enabled: sessionInitialized && !conversationId }
  );

  const getHistoryQuery = trpc.chat.getHistory.useQuery(
    { conversationId: conversationId || 0 },
    { enabled: !!conversationId }
  );

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Initialize session on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("chatSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
    setSessionInitialized(true);
  }, []);

  // Handle session query result
  useEffect(() => {
    if (getSessionQuery.data) {
      setSessionId(getSessionQuery.data.sessionId);
      setConversationId(getSessionQuery.data.conversationId || null);
      localStorage.setItem("chatSessionId", getSessionQuery.data.sessionId);
    }
  }, [getSessionQuery.data]);

  // Load conversation history
  useEffect(() => {
    if (getHistoryQuery.data) {
      setMessages(getHistoryQuery.data as Message[]);
    }
  }, [getHistoryQuery.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your question. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Rebecca</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  {isAuthenticated ? (
                    <>
                      <p className="font-semibold text-slate-900">Logged in as {user?.name}</p>
                      <p className="text-sm text-slate-600">{user?.email}</p>
                    </>
                  ) : (
                    <a href={getLoginUrl()} className="text-sm text-blue-600 hover:underline">
                      Admin sign in
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button size="sm" variant="outline">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <a
                    href="https://www.linkedin.com/in/freakazoid"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Start a Conversation</h2>
              <p className="text-slate-600 max-w-md">
                Ask any question about your MBA coursework. I'll search through your class notes and
                provide answers with citations.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-2xl ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                        : "bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm"
                    } p-4`}
                  >
                    {message.role === "assistant" ? (
                      <div className="space-y-4">
                        <Streamdown className="text-slate-900">
                          {message.content}
                        </Streamdown>

                        {/* Source Citations */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="border-t border-slate-200 pt-4 mt-4">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                              📚 Sources
                            </p>
                            <div className="space-y-2">
                              {message.sources.map((source, sourceIdx) => (
                                <div
                                  key={sourceIdx}
                                  className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                                >
                                  <div className="flex items-start gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-slate-900 text-sm">
                                        {source.documentName}
                                      </p>
                                      {source.excerpt && (
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                          "{source.excerpt}..."
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-white">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-slate-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white sticky bottom-0">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your MBA courses..."
              disabled={isLoading}
              className="flex-1 rounded-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-full bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* LinkedIn CTA in Chat */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Linkedin className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-slate-900">
                Found this helpful? Connect on LinkedIn for more MBA insights
              </p>
            </div>
            <a
              href="https://www.linkedin.com/in/freakazoid"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="gap-2">
                Follow
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
