import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Brain, MessageSquare, Sparkles, Linkedin } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const linkedinUrl = "https://www.linkedin.com/in/freakazoid";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Rebecca</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600">Welcome, {user?.name}</span>
                <Link href="/chat">
                  <Button size="sm">Go to Chat</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* LinkedIn CTA Banner - Prominent placement */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 border-b border-blue-800">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Linkedin className="w-5 h-5" />
            <div>
              <p className="font-semibold">Connect on LinkedIn</p>
              <p className="text-sm text-blue-100">Follow for more MBA insights and updates</p>
            </div>
          </div>
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Let's Connect
            </Button>
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-8">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Powered by AI & RAG Technology</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Your Personal{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              MBA Study Companion
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Meet Rebecca — your AI-powered study companion, built by an MBA alumni who knows the grind. Ask questions about your coursework and get instant, well-sourced answers from your class materials.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {isAuthenticated ? (
              <Link href="/chat">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  Start Chatting
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            )}
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Linkedin className="w-4 h-4" />
                Connect with Me
              </Button>
            </a>
          </div>

          {/* Hero Image / Illustration */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 border border-slate-700 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-white text-left">
                  <MessageSquare className="w-8 h-8 text-blue-400 mb-3" />
                  <p className="font-semibold mb-2">Natural Questions</p>
                  <p className="text-sm text-slate-300">Ask anything about your courses</p>
                </div>
                <div className="text-white text-left">
                  <Brain className="w-8 h-8 text-blue-400 mb-3" />
                  <p className="font-semibold mb-2">Smart Answers</p>
                  <p className="text-sm text-slate-300">Powered by advanced AI</p>
                </div>
                <div className="text-white text-left">
                  <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
                  <p className="font-semibold mb-2">Cited Sources</p>
                  <p className="text-sm text-slate-300">Know where answers come from</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
              Why Use Rebecca?
            </h2>
            <p className="text-lg text-slate-600 text-center mb-16">
              Transform how you learn and retain MBA concepts
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Answers</h3>
                <p className="text-slate-600">
                  Get immediate responses to your questions without searching through notes manually.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Source Citations</h3>
                <p className="text-slate-600">
                  Every answer includes references to the specific documents and sections used.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Deep Understanding</h3>
                <p className="text-slate-600">
                  Understand concepts better with contextual explanations from your course materials.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Conversation History</h3>
                <p className="text-slate-600">
                  Keep track of all your questions and answers in one organized conversation thread.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Master Your MBA Coursework?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start asking questions and get intelligent answers backed by your class materials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/chat">
                <Button size="lg" className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
                  Start Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            )}
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white text-white hover:bg-blue-700"
              >
                <Linkedin className="w-4 h-4" />
                Connect with Me
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">Rebecca</span>
            </div>
            <div className="flex gap-6">
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>© 2026 Rebecca. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
