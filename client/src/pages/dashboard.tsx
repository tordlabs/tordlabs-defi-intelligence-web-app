import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Key, Globe, ShieldCheck, Lock, Bot, Zap,
  Search, Image, MessageSquare, TrendingUp, Wallet, Menu, X,
  Home, ChevronRight, Settings, LogOut, Send, Loader2, Download, Copy, Check,
  ArrowUpDown, Minus, Plus, ChevronDown, Play, Pause, Trash2, Clock, Activity, AlertCircle, CheckCircle, Github
} from "lucide-react";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "ai-agent", label: "Tord AI Agent", icon: MessageSquare },
  { id: "deep-research", label: "Deep Research", icon: Search },
  { id: "image-generator", label: "Image Generator", icon: Image },
  { id: "token-analyzer", label: "Token Analyzer", icon: BarChart3 },
  { id: "free-api", label: "Free API Key", icon: Key },
  { id: "social-media", label: "AI Social Media", icon: Globe },
  { id: "futures", label: "Futures Trade", icon: TrendingUp },
  { id: "staking", label: "Staking", icon: Lock },
  { id: "ai-deploy", label: "AI Agent Deploy", icon: Bot },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "overview";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const { data: siteSettings } = useSiteSettings();

  const connectWallet = async () => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        alert("Please install MetaMask or a BSC-compatible wallet.");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts?.[0]) {
        setWalletAddress(accounts[0]);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-black/80 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "md:w-[72px]" : "md:w-64"
        } w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="px-3 h-16 border-b border-white/10 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 overflow-hidden">
              <img src="/logo.png" alt="Tord Labs" className="h-8 w-8 shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-display font-bold text-lg tracking-wider text-white whitespace-nowrap">
                  TORD <span className="text-primary">LABS</span>
                </span>
              )}
            </a>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-white">
            <X className="h-5 w-5" />
          </button>
          <button
            data-testid="btn-toggle-sidebar"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${sidebarCollapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                data-testid={`sidebar-${item.id}`}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-white/10 space-y-1">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-center gap-3 py-2">
              <a href={siteSettings?.twitter_url || "https://x.com/tordlabs"} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all shrink-0">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={siteSettings?.telegram_url || "https://t.me/TordLabs"} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all shrink-0">
                <Send className="h-3.5 w-3.5" />
              </a>
              <a href={siteSettings?.github_url || "https://github.com/tordlabs"} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all shrink-0">
                <Github className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
            <Settings className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && "Settings"}
          </button>
          <Link href="/">
            <a className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
              <LogOut className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && "Back to Home"}
            </a>
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "md:ml-[72px]" : "md:ml-64"}`}>
        <header className="sticky top-0 z-30 bg-black/50 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-muted-foreground hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-white">
              {sidebarItems.find(i => i.id === activeTab)?.label || "Dashboard"}
            </h1>
          </div>
          {walletAddress ? (
            <span className="text-xs text-green-400 font-mono bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          ) : (
            <Button data-testid="btn-header-connect-wallet" size="sm" onClick={connectWallet} className="bg-primary text-black hover:bg-primary/90 font-bold neon-snake-btn">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </header>

        {activeTab === "futures" ? (
          <FuturesTradePage />
        ) : (
          <div className="p-4 md:p-8">
            {activeTab === "overview" && <OverviewTab onNavigate={setActiveTab} />}
            {activeTab === "ai-agent" && <ChatPage />}
            {activeTab === "deep-research" && <DeepResearchPage />}
            {activeTab === "image-generator" && <ImageGeneratorPage />}
            {activeTab === "token-analyzer" && <TokenAnalyzerPage />}
            {activeTab === "free-api" && <FreeApiKeyPage walletAddress={walletAddress} onConnect={connectWallet} />}
            {activeTab === "social-media" && <SocialMediaPage />}
            {activeTab === "staking" && <StakingPage walletAddress={walletAddress} onConnect={connectWallet} tordContract={siteSettings?.tord_contract} stakingContract={siteSettings?.staking_contract} />}
            {activeTab === "ai-deploy" && <AgentDeployPage />}
          </div>
        )}
      </main>
    </div>
  );
}

function OverviewTab({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/40 p-5 glass-card">
          <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
          <p className="text-2xl font-display font-bold text-white">$0.00</p>
          <p className="text-xs text-primary mt-1">Connect wallet to view</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-5 glass-card">
          <p className="text-xs text-muted-foreground mb-1">$TORD Balance</p>
          <p className="text-2xl font-display font-bold text-white">0</p>
          <p className="text-xs text-muted-foreground mt-1">Hold tokens for benefits</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-5 glass-card">
          <p className="text-xs text-muted-foreground mb-1">API Credits</p>
          <p className="text-2xl font-display font-bold text-white">0 / day</p>
          <p className="text-xs text-muted-foreground mt-1">Hold $TORD to unlock</p>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-white mb-6">All Products</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <DashboardCard
            title="Tord AI Agent"
            description="AI agent that helps users matching tasks and AI model for best fit result"
            onClick={() => onNavigate("ai-agent")}
            large
          >
            <div className="bg-white/5 rounded-xl p-4 space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <img src="/logo.png" alt="Tord" className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-white">Tord Agent</span>
              </div>
              <p className="text-xs text-primary">🌙 Welcome to Tord AI. You're now talking to Tord.</p>
              <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                What's on your mind? Tord's here to chat...
              </div>
            </div>
          </DashboardCard>

          <div className="space-y-6">
            <DashboardCard
              title="Deep Research"
              description="Conduct deep research on your topics of interest from your prompt"
              onClick={() => onNavigate("deep-research")}
            >
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-xs text-primary font-mono mt-4">
                Deep Research
              </div>
            </DashboardCard>

            <DashboardCard
              title="Image Generator"
              description="Generate your styled image from your prompt"
              onClick={() => onNavigate("image-generator")}
            >
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-xs text-primary font-mono mt-4">
                Image Generation
              </div>
            </DashboardCard>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <DashboardIconCard icon={<BarChart3 className="h-6 w-6 text-primary" />} title="Token Analyzer" description="AI-powered token security analysis with sentiment, technical, and on-chain scores." onClick={() => onNavigate("token-analyzer")} />
          <DashboardIconCard icon={<Key className="h-6 w-6 text-primary" />} title="FREE API KEY" description="Get free AI API access by holding TORD tokens with daily credit limits." onClick={() => onNavigate("free-api")} />
          <DashboardIconCard icon={<TrendingUp className="h-6 w-6 text-primary" />} title="Futures Trade" description="Trade crypto futures with leverage, advanced charting, and AI-powered signals." onClick={() => onNavigate("futures")} />
          <DashboardIconCard icon={<Lock className="h-6 w-6 text-primary" />} title="Staking" description="Stake your tokens to earn passive rewards with competitive APY." onClick={() => onNavigate("staking")} />
          <DashboardIconCard icon={<Globe className="h-6 w-6 text-primary" />} title="AI Agent Social Media" description="Automate your social media presence with AI-powered posting, engagement, and growth strategies." onClick={() => onNavigate("social-media")} />
          <DashboardIconCard icon={<Bot className="h-6 w-6 text-primary" />} title="AI Agent" description="Deploy autonomous AI agents to automate tasks, trading, and portfolio management." onClick={() => onNavigate("ai-deploy")} />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, description, children, onClick, large }: { title: string, description: string, children?: React.ReactNode, onClick: () => void, large?: boolean }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-white/10 bg-black/40 p-6 cursor-pointer hover:border-primary/30 transition-all group glass-card ${large ? "row-span-2 flex flex-col justify-between" : ""}`}
      data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div>
        <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
      <div className="flex items-center gap-1 text-primary text-xs font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        Open <ChevronRight className="h-3 w-3" />
      </div>
    </div>
  );
}

function DashboardIconCard({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-black/40 p-6 cursor-pointer hover:border-primary/30 transition-all group glass-card"
      data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="flex items-center gap-1 text-primary text-xs font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        Open <ChevronRight className="h-3 w-3" />
      </div>
    </div>
  );
}

function DeepResearchPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/deep-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setResult("Error: " + data.error);
      } else {
        setResult(data.result);
      }
    } catch {
      setResult("Error: Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
        <h2 className="font-display text-2xl font-bold text-white mb-2">Deep Research</h2>
        <p className="text-muted-foreground text-sm mb-6">Enter a topic and get comprehensive AI-powered research analysis.</p>

        <div className="flex gap-3">
          <input
            data-testid="input-research-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResearch()}
            placeholder="e.g. Analyze the impact of AI on DeFi yield farming strategies..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <Button
            data-testid="btn-research"
            onClick={handleResearch}
            disabled={loading || !query.trim()}
            className="bg-primary text-black hover:bg-primary/90 font-bold px-6"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center glass-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Researching your topic... This may take a moment.</p>
        </div>
      )}

      {result && !loading && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
          <div className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {result.split("\n").map((line, i) => {
              if (line.startsWith("# ")) return <h1 key={i} className="font-display text-2xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>;
              if (line.startsWith("## ")) return <h2 key={i} className="font-display text-xl font-bold text-white mt-5 mb-2">{line.slice(3)}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="font-display text-lg font-bold text-white mt-4 mb-2">{line.slice(4)}</h3>;
              if (line.startsWith("- ") || line.startsWith("* ")) return <p key={i} className="ml-4 mb-1">• {line.slice(2)}</p>;
              if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold text-white mb-1">{line.slice(2, -2)}</p>;
              if (line.trim() === "") return <br key={i} />;
              return <p key={i} className="mb-1">{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ChatSession {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  createdAt: number;
}

const CHAT_STORAGE_KEY = "tord_chat_history";

function loadChatHistory(): ChatSession[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveChatHistory(sessions: ChatSession[]) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions.slice(0, 50)));
}

function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatHistory(loadChatHistory());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && activeSessionId) {
      const updated = chatHistory.map(s =>
        s.id === activeSessionId ? { ...s, messages, title: messages[0]?.content?.slice(0, 40) || "New Chat" } : s
      );
      setChatHistory(updated);
      saveChatHistory(updated);
    }
  }, [messages]);

  const startNewChat = () => {
    const id = Date.now().toString();
    const session: ChatSession = { id, title: "New Chat", messages: [], createdAt: Date.now() };
    const updated = [session, ...chatHistory];
    setChatHistory(updated);
    saveChatHistory(updated);
    setActiveSessionId(id);
    setMessages([]);
    setShowHistory(false);
  };

  const loadSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chatHistory.filter(s => s.id !== id);
    setChatHistory(updated);
    saveChatHistory(updated);
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!activeSessionId) {
      const id = Date.now().toString();
      const session: ChatSession = { id, title: input.trim().slice(0, 40), messages: [], createdAt: Date.now() };
      const updated = [session, ...chatHistory];
      setChatHistory(updated);
      saveChatHistory(updated);
      setActiveSessionId(id);
    }

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: "Error: " + data.error }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.result }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Error: Failed to connect." }]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          data-testid="btn-new-chat"
          onClick={startNewChat}
          className="flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
        >
          <span className="text-lg leading-none">+</span> New Chat
        </button>
        <button
          data-testid="btn-chat-history"
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-medium transition-all ${
            showHistory
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"
          }`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          History
        </button>
      </div>

      {showHistory ? (
        <div className="flex-1 rounded-2xl border border-white/10 bg-black/40 p-4 overflow-y-auto mb-4 glass-card">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <svg className="h-12 w-12 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <p className="text-muted-foreground text-sm">No chat history yet</p>
              <p className="text-muted-foreground/60 text-xs">Start a new conversation to see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatHistory.map((session) => (
                <button
                  key={session.id}
                  data-testid={`chat-session-${session.id}`}
                  onClick={() => loadSession(session)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all group ${
                    activeSessionId === session.id
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm text-white truncate">{session.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{session.messages.length} messages</span>
                      <span className="text-xs text-muted-foreground/50">|</span>
                      <span className="text-xs text-muted-foreground">{formatDate(session.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    data-testid={`btn-delete-session-${session.id}`}
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 rounded-2xl border border-white/10 bg-black/40 p-4 overflow-y-auto mb-4 space-y-4 glass-card">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <img src="/logo.png" alt="Tord" className="w-10 h-10" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Tord AI Agent</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Welcome to Tord AI. Ask me anything about crypto, DeFi, token analysis, or trading strategies.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-black"
                  : "bg-white/5 border border-white/10 text-muted-foreground"
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="flex gap-3">
        <input
          data-testid="input-chat"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Tord anything..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
        <Button
          data-testid="btn-send-chat"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-primary text-black hover:bg-primary/90 font-bold px-6"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(2);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/image-usage")
      .then(res => res.json())
      .then(data => setRemaining(data.remaining))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setImageUrl("");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        if (data.remaining !== undefined) setRemaining(data.remaining);
      } else {
        setImageUrl(data.image);
        setRemaining(data.remaining);
      }
    } catch (err: any) {
      setError(err?.name === "AbortError" ? "Request timed out. Please try again." : "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-2xl font-bold text-white">Image Generator</h2>
          <span className={`text-xs px-3 py-1 rounded-full ${remaining > 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-400'}`}>
            {remaining}/2 remaining today
          </span>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Generate styled images from your prompt. Limited to 2 images per day.</p>

        <div className="flex gap-3">
          <input
            data-testid="input-image-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="e.g. A futuristic DeFi trading dashboard with neon lights..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <Button
            data-testid="btn-generate-image"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || remaining <= 0}
            className="bg-primary text-black hover:bg-primary/90 font-bold px-6"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center glass-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Generating your image... This may take a moment.</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-4 glass-card">
          <img src={imageUrl} alt="Generated" className="w-full rounded-xl border border-white/10" />
          <div className="flex gap-3 justify-center">
            <a href={imageUrl} download="tord-generated-image.png">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function TokenAnalyzerPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!address.trim() || loading) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setError("Please enter a valid BSC contract address (0x...)");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/analyze-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress: address.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to analyze token. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const scoreBg = (score: number) => {
    if (score >= 70) return "bg-green-500/20 border-green-500/30";
    if (score >= 40) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const riskColor = (risk: string) => {
    if (risk === "Low") return "text-green-400 bg-green-500/10";
    if (risk === "Medium") return "text-yellow-400 bg-yellow-500/10";
    if (risk === "High") return "text-orange-400 bg-orange-500/10";
    return "text-red-400 bg-red-500/10";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="font-display text-2xl font-bold text-white">Token Analyzer</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-1">AI-powered token security analysis for BSC (BNB Smart Chain)</p>
        <p className="text-xs text-muted-foreground mb-6">Paste any BSC token contract address to get sentiment, technical, and on-chain scores.</p>

        <div className="flex gap-3">
          <input
            data-testid="input-token-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="0x... (BSC Contract Address)"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <Button
            data-testid="btn-analyze-token"
            onClick={handleAnalyze}
            disabled={loading || !address.trim()}
            className="bg-primary text-black hover:bg-primary/90 font-bold px-6"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center glass-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Fetching on-chain data and running AI analysis...</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-white">{result.token.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground font-mono">${result.token.symbol}</span>
                  {result.token.priceUsd !== "N/A" && (
                    <span className="text-sm font-bold text-primary">${result.token.priceUsd}</span>
                  )}
                  {result.token.priceChange24h !== 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded ${result.token.priceChange24h >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {result.token.priceChange24h >= 0 ? '+' : ''}{result.token.priceChange24h}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${riskColor(result.analysis.riskLevel)}`}>
                  {result.analysis.riskLevel} Risk
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                  result.analysis.recommendation === "Buy" ? "text-green-400 bg-green-500/10" :
                  result.analysis.recommendation === "Hold" ? "text-blue-400 bg-blue-500/10" :
                  result.analysis.recommendation === "Caution" ? "text-yellow-400 bg-yellow-500/10" :
                  "text-red-400 bg-red-500/10"
                }`}>
                  {result.analysis.recommendation}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`rounded-xl border p-4 text-center ${scoreBg(result.analysis.overallScore)}`}>
                <div className={`text-3xl font-display font-bold ${scoreColor(result.analysis.overallScore)}`}>
                  {result.analysis.overallScore}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Overall</div>
              </div>
              <div className={`rounded-xl border p-4 text-center ${scoreBg(result.analysis.sentimentScore)}`}>
                <div className={`text-3xl font-display font-bold ${scoreColor(result.analysis.sentimentScore)}`}>
                  {result.analysis.sentimentScore}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Sentiment</div>
              </div>
              <div className={`rounded-xl border p-4 text-center ${scoreBg(result.analysis.technicalScore)}`}>
                <div className={`text-3xl font-display font-bold ${scoreColor(result.analysis.technicalScore)}`}>
                  {result.analysis.technicalScore}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Technical</div>
              </div>
              <div className={`rounded-xl border p-4 text-center ${scoreBg(result.analysis.onChainScore)}`}>
                <div className={`text-3xl font-display font-bold ${scoreColor(result.analysis.onChainScore)}`}>
                  {result.analysis.onChainScore}
                </div>
                <div className="text-xs text-muted-foreground mt-1">On-Chain</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
            <h4 className="font-display text-lg font-bold text-white mb-3">AI Summary</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.analysis.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {result.analysis.flags?.length > 0 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                <h4 className="font-display text-lg font-bold text-red-400 mb-3">Red Flags</h4>
                <ul className="space-y-2">
                  {result.analysis.flags.map((flag: string, i: number) => (
                    <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">&#x2715;</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.analysis.positives?.length > 0 && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
                <h4 className="font-display text-lg font-bold text-green-400 mb-3">Positives</h4>
                <ul className="space-y-2">
                  {result.analysis.positives.map((pos: string, i: number) => (
                    <li key={i} className="text-sm text-green-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">&#x2713;</span>
                      {pos}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
            <h4 className="font-display text-lg font-bold text-white mb-4">Security Checks</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Honeypot", value: result.security.isHoneypot, danger: true },
                { label: "Open Source", value: result.security.isOpenSource, danger: false },
                { label: "Proxy Contract", value: result.security.isProxy, danger: true },
                { label: "Mintable", value: result.security.isMintable, danger: true },
                { label: "Can Take Ownership", value: result.security.canTakeBackOwnership, danger: true },
                { label: "Owner Change Balance", value: result.security.ownerChangeBalance, danger: true },
                { label: "Hidden Owner", value: result.security.hiddenOwner, danger: true },
                { label: "Self Destruct", value: result.security.selfDestruct, danger: true },
                { label: "External Call", value: result.security.externalCall, danger: true },
                { label: "Blacklist Function", value: result.security.isBlacklisted, danger: true },
                { label: "Transfer Pausable", value: result.security.transferPausable, danger: true },
                { label: "Anti-Whale", value: result.security.antiWhale, danger: false },
                { label: "Cannot Buy", value: result.security.cannotBuy, danger: true },
                { label: "Cannot Sell All", value: result.security.cannotSellAll, danger: true },
                { label: "LP Locked", value: result.security.lpLocked, danger: false },
              ].map((check, i) => {
                const isRisk = check.danger ? check.value : !check.value;
                return (
                  <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${isRisk ? 'border-red-500/20 bg-red-500/5' : 'border-green-500/20 bg-green-500/5'}`}>
                    <span className="text-xs text-muted-foreground">{check.label}</span>
                    <span className={`text-xs font-bold ${isRisk ? 'text-red-400' : 'text-green-400'}`}>
                      {check.value ? (check.danger ? '&#x26A0; Yes' : '&#x2713; Yes') : (check.danger ? '&#x2713; No' : '&#x26A0; No')}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                <span className="text-xs text-muted-foreground block">Buy Tax</span>
                <span className={`text-sm font-bold ${parseFloat(result.security.buyTax) > 5 ? 'text-red-400' : 'text-green-400'}`}>{result.security.buyTax}%</span>
              </div>
              <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                <span className="text-xs text-muted-foreground block">Sell Tax</span>
                <span className={`text-sm font-bold ${parseFloat(result.security.sellTax) > 5 ? 'text-red-400' : 'text-green-400'}`}>{result.security.sellTax}%</span>
              </div>
              <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                <span className="text-xs text-muted-foreground block">LP Locked %</span>
                <span className={`text-sm font-bold ${parseFloat(result.security.lpLockedPercent) > 50 ? 'text-green-400' : 'text-yellow-400'}`}>{result.security.lpLockedPercent}%</span>
              </div>
              <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                <span className="text-xs text-muted-foreground block">Creator Holds</span>
                <span className={`text-sm font-bold ${parseFloat(result.security.creatorPercent) > 5 ? 'text-yellow-400' : 'text-green-400'}`}>{result.security.creatorPercent}%</span>
              </div>
              <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                <span className="text-xs text-muted-foreground block">Owner Holds</span>
                <span className={`text-sm font-bold ${parseFloat(result.security.ownerPercent) > 5 ? 'text-yellow-400' : 'text-green-400'}`}>{result.security.ownerPercent}%</span>
              </div>
              <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                <span className="text-xs text-muted-foreground block">Holders</span>
                <span className="text-sm font-bold text-white">{Number(result.token.holderCount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
            <h4 className="font-display text-lg font-bold text-white mb-4">Market Data</h4>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-sm font-bold text-white">${result.token.priceUsd}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Market Cap</span>
                <span className="text-sm font-bold text-white">${Number(result.token.marketCap).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">24h Volume</span>
                <span className="text-sm font-bold text-white">${Number(result.token.volume24h).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Liquidity</span>
                <span className="text-sm font-bold text-white">${Number(result.token.liquidity).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">FDV</span>
                <span className="text-sm font-bold text-white">${Number(result.token.fdv).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Total Supply</span>
                <span className="text-sm font-bold text-white font-mono">{Number(result.token.totalSupply).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">DEX</span>
                <span className="text-sm font-bold text-white capitalize">{result.token.dexName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Pairs on BSC</span>
                <span className="text-sm font-bold text-white">{result.token.pairCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">24h Buys / Sells</span>
                <span className="text-sm font-bold">
                  <span className="text-green-400">{result.token.buys24h}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-red-400">{result.token.sells24h}</span>
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Pair Created</span>
                <span className="text-sm font-bold text-white">{result.token.pairCreatedAt}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: "5m", value: result.token.priceChange5m },
                { label: "1h", value: result.token.priceChange1h },
                { label: "6h", value: result.token.priceChange6h },
                { label: "24h", value: result.token.priceChange24h },
              ].map((pc, i) => (
                <div key={i} className="text-center px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                  <span className="text-xs text-muted-foreground block">{pc.label}</span>
                  <span className={`text-sm font-bold ${pc.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pc.value >= 0 ? '+' : ''}{pc.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {result.holders?.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
              <h4 className="font-display text-lg font-bold text-white mb-4">Top Holders</h4>
              <div className="space-y-2">
                {result.holders.map((h: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>
                      <span className="text-xs font-mono text-white">{h.address.slice(0, 6)}...{h.address.slice(-4)}</span>
                      {h.isContract && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Contract</span>}
                      {h.isLocked && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Locked</span>}
                      {h.tag && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">{h.tag}</span>}
                    </div>
                    <span className={`text-sm font-bold ${parseFloat(h.percent) > 10 ? 'text-yellow-400' : 'text-white'}`}>
                      {(parseFloat(h.percent) * 100).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FreeApiKeyPage({ walletAddress, onConnect }: { walletAddress: string; onConnect: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generateKey = async () => {
    if (!walletAddress || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setApiKey(data.apiKey);
      }
    } catch {
      setError("Failed to generate API key.");
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
        <h2 className="font-display text-2xl font-bold text-white mb-2">Free API Key</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Connect your BSC wallet and hold $TORD tokens to receive a free API key with daily credits.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${walletAddress ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted-foreground'}`}>
              1
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Connect BSC Wallet</p>
              <p className="text-xs text-muted-foreground">MetaMask or any BSC-compatible wallet</p>
            </div>
            {walletAddress ? (
              <span className="text-xs text-green-400 font-mono bg-green-500/10 px-3 py-1 rounded-full">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            ) : (
              <Button data-testid="btn-connect-wallet" onClick={onConnect} size="sm" className="bg-primary text-black hover:bg-primary/90 font-bold">
                <Wallet className="mr-2 h-4 w-4" />
                Connect
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${walletAddress ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
              2
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Hold $TORD Tokens</p>
              <p className="text-xs text-muted-foreground">Token contract will be verified on BSC (coming soon)</p>
            </div>
            <span className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
              Pending
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${apiKey ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted-foreground'}`}>
              3
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Generate API Key</p>
              <p className="text-xs text-muted-foreground">Get your free API key with $15 daily credits</p>
            </div>
            {!apiKey && (
              <Button
                data-testid="btn-generate-api-key"
                onClick={generateKey}
                disabled={!walletAddress || loading}
                size="sm"
                className="bg-primary text-black hover:bg-primary/90 font-bold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {apiKey && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-white">Your API Key</h3>
            <span className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">$15/day credits</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-primary font-mono break-all">
              {apiKey}
            </code>
            <Button data-testid="btn-copy-api-key" onClick={copyKey} variant="outline" size="sm" className="border-white/20 shrink-0">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Base URL: <code className="text-primary">https://api.tordlabs.com/v1</code></p>
            <p>Daily Limit: <code className="text-primary">$15 in API credits</code></p>
            <p className="text-yellow-400">Note: Token holdings will be verified once the $TORD smart contract is deployed on BSC.</p>
          </div>
        </div>
      )}
    </div>
  );
}

const TRADING_PAIRS = [
  { symbol: "BTCUSDT", base: "BTC", quote: "USDT", label: "BTC/USDT" },
  { symbol: "ETHUSDT", base: "ETH", quote: "USDT", label: "ETH/USDT" },
  { symbol: "BNBUSDT", base: "BNB", quote: "USDT", label: "BNB/USDT" },
  { symbol: "SOLUSDT", base: "SOL", quote: "USDT", label: "SOL/USDT" },
  { symbol: "XRPUSDT", base: "XRP", quote: "USDT", label: "XRP/USDT" },
  { symbol: "DOGEUSDT", base: "DOGE", quote: "USDT", label: "DOGE/USDT" },
  { symbol: "ADAUSDT", base: "ADA", quote: "USDT", label: "ADA/USDT" },
  { symbol: "AVAXUSDT", base: "AVAX", quote: "USDT", label: "AVAX/USDT" },
];

interface OrderBookEntry {
  price: string;
  qty: string;
  total: string;
}

function FuturesTradePage() {
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0]);
  const [showPairDropdown, setShowPairDropdown] = useState(false);
  const [orderType, setOrderType] = useState<"Market" | "Limit" | "Stop Limit">("Market");
  const [leverage, setLeverage] = useState(20);
  const [leverageMode, setLeverageMode] = useState<"Cross" | "Isolated">("Cross");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [activeBottomTab, setActiveBottomTab] = useState("positions");
  const [tickerData, setTickerData] = useState<any>(null);
  const [orderBook, setOrderBook] = useState<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }>({ asks: [], bids: [] });
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [orderBookTab, setOrderBookTab] = useState<"book" | "trades">("book");
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.className = "tradingview-widget-container";
      wrapper.style.height = "100%";
      wrapper.style.width = "100%";
      const widgetDiv = document.createElement("div");
      widgetDiv.className = "tradingview-widget-container__widget";
      widgetDiv.style.height = "calc(100% - 32px)";
      widgetDiv.style.width = "100%";
      wrapper.appendChild(widgetDiv);
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: `BINANCE:${selectedPair.symbol}.P`,
        interval: "15",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        backgroundColor: "rgba(10, 10, 10, 1)",
        gridColor: "rgba(255, 255, 255, 0.03)",
        hide_top_toolbar: false,
        hide_legend: false,
        allow_symbol_change: false,
        save_image: false,
        calendar: false,
        hide_volume: false,
        support_host: "https://www.tradingview.com",
      });
      wrapper.appendChild(script);
      chartContainerRef.current.appendChild(wrapper);
    }
  }, [selectedPair.symbol]);

  const fetchMarketData = useCallback(async () => {
    try {
      const [tickerRes, depthRes, tradesRes] = await Promise.all([
        fetch(`/api/futures/ticker?symbol=${selectedPair.symbol}`),
        fetch(`/api/futures/depth?symbol=${selectedPair.symbol}&limit=20`),
        fetch(`/api/futures/trades?symbol=${selectedPair.symbol}`),
      ]);
      const ticker = await tickerRes.json();
      const depth = await depthRes.json();
      const trades = await tradesRes.json();

      if (ticker && ticker.lastPrice) {
        setTickerData({
          price: parseFloat(ticker.lastPrice).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
          priceChange: parseFloat(ticker.priceChangePercent).toFixed(2),
          high: parseFloat(ticker.highPrice).toLocaleString("en-US", { minimumFractionDigits: 1 }),
          low: parseFloat(ticker.lowPrice).toLocaleString("en-US", { minimumFractionDigits: 1 }),
          volume: (parseFloat(ticker.quoteVolume) / 1e6).toFixed(2) + "M",
          markPrice: parseFloat(ticker.lastPrice).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        });
      }

      if (depth && depth.asks && depth.bids) {
        const formatOrders = (orders: string[][]): OrderBookEntry[] => {
          let cumTotal = 0;
          return orders.slice(0, 15).map((o: string[]) => {
            cumTotal += parseFloat(o[1]);
            return { price: parseFloat(o[0]).toFixed(1), qty: parseFloat(o[1]).toFixed(3), total: cumTotal.toFixed(3) };
          });
        };
        setOrderBook({
          asks: formatOrders(depth.asks).reverse(),
          bids: formatOrders(depth.bids),
        });
      }

      if (Array.isArray(trades)) {
        setRecentTrades(trades.slice(-30).reverse().map((t: any) => ({
          price: parseFloat(t.price).toFixed(1),
          qty: parseFloat(t.qty).toFixed(4),
          time: new Date(t.time).toLocaleTimeString(),
          isBuy: !t.isBuyerMaker,
        })));
      }
    } catch (err) {
      console.error("Failed to fetch market data:", err);
    }
  }, [selectedPair.symbol]);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 2000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const midPrice = orderBook.bids[0]?.price || tickerData?.price || "---";
  const isPriceUp = tickerData && parseFloat(tickerData.priceChange) >= 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden" data-testid="futures-trade-page">
      <div className="flex items-center gap-4 px-3 py-2 border-b border-white/10 bg-black/40 overflow-x-auto">
        <div className="relative">
          <button
            data-testid="btn-pair-selector"
            onClick={() => setShowPairDropdown(!showPairDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="font-display font-bold text-white text-sm">{selectedPair.label}</span>
            <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">Perp</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {showPairDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 py-1">
              {TRADING_PAIRS.map((pair) => (
                <button
                  key={pair.symbol}
                  data-testid={`pair-${pair.symbol}`}
                  onClick={() => { setSelectedPair(pair); setShowPairDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${selectedPair.symbol === pair.symbol ? "text-primary" : "text-white"}`}
                >
                  {pair.label} <span className="text-muted-foreground text-xs">Perp</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {tickerData && (
          <>
            <div className="flex flex-col">
              <span className={`text-lg font-display font-bold ${isPriceUp ? "text-green-400" : "text-red-400"}`}>
                {tickerData.price}
              </span>
              <span className={`text-[10px] ${isPriceUp ? "text-green-400" : "text-red-400"}`}>
                {isPriceUp ? "+" : ""}{tickerData.priceChange}%
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-6 text-xs">
              <div>
                <span className="text-muted-foreground">Mark</span>
                <span className="text-white ml-2">{tickerData.markPrice}</span>
              </div>
              <div>
                <span className="text-muted-foreground">24h High</span>
                <span className="text-white ml-2">{tickerData.high}</span>
              </div>
              <div>
                <span className="text-muted-foreground">24h Low</span>
                <span className="text-white ml-2">{tickerData.low}</span>
              </div>
              <div>
                <span className="text-muted-foreground">24h Vol</span>
                <span className="text-white ml-2">{tickerData.volume} USDT</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0" ref={chartContainerRef} style={{ height: "100%" }} />

          <div className="border-t border-white/10 bg-black/30">
            <div className="flex items-center gap-1 px-3 py-1 border-b border-white/10 overflow-x-auto">
              {[
                { id: "positions", label: "Positions (0)" },
                { id: "orders", label: "Open Orders (0)" },
                { id: "history", label: "Order History" },
                { id: "trades", label: "Trade History" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => setActiveBottomTab(tab.id)}
                  className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    activeBottomTab === tab.id ? "text-white border-b-2 border-primary" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="h-32 flex items-center justify-center text-muted-foreground text-xs">
              {activeBottomTab === "positions" && "No open positions"}
              {activeBottomTab === "orders" && "No open orders"}
              {activeBottomTab === "history" && "No order history found"}
              {activeBottomTab === "trades" && "No trade history found"}
            </div>
          </div>
        </div>

        <div className="w-56 xl:w-64 border-l border-white/10 flex-col hidden md:flex overflow-hidden">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setOrderBookTab("book")}
              className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${orderBookTab === "book" ? "text-white border-b-2 border-primary" : "text-muted-foreground"}`}
            >
              Order Book
            </button>
            <button
              onClick={() => setOrderBookTab("trades")}
              className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${orderBookTab === "trades" ? "text-white border-b-2 border-primary" : "text-muted-foreground"}`}
            >
              Trades
            </button>
          </div>

          {orderBookTab === "book" ? (
            <div className="flex-1 overflow-hidden flex flex-col text-[11px] font-mono">
              <div className="flex justify-between px-2 py-1 text-muted-foreground border-b border-white/5">
                <span>Price(USDT)</span>
                <span>Size({selectedPair.base})</span>
                <span>Total</span>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-hidden flex flex-col justify-end">
                  {orderBook.asks.map((ask, i) => (
                    <div key={`a${i}`} className="flex justify-between px-2 py-[2px] relative hover:bg-white/5">
                      <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${Math.min(100, (parseFloat(ask.qty) / 2) * 100)}%` }} />
                      <span className="text-red-400 relative z-10">{ask.price}</span>
                      <span className="text-muted-foreground relative z-10">{ask.qty}</span>
                      <span className="text-muted-foreground relative z-10">{ask.total}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center py-2 border-y border-white/10">
                  <span className={`text-base font-bold ${isPriceUp ? "text-green-400" : "text-red-400"}`}>{midPrice}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  {orderBook.bids.map((bid, i) => (
                    <div key={`b${i}`} className="flex justify-between px-2 py-[2px] relative hover:bg-white/5">
                      <div className="absolute right-0 top-0 bottom-0 bg-green-500/10" style={{ width: `${Math.min(100, (parseFloat(bid.qty) / 2) * 100)}%` }} />
                      <span className="text-green-400 relative z-10">{bid.price}</span>
                      <span className="text-muted-foreground relative z-10">{bid.qty}</span>
                      <span className="text-muted-foreground relative z-10">{bid.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col text-[11px] font-mono">
              <div className="flex justify-between px-2 py-1 text-muted-foreground border-b border-white/5">
                <span>Price(USDT)</span>
                <span>Size({selectedPair.base})</span>
                <span>Time</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {recentTrades.map((trade, i) => (
                  <div key={i} className="flex justify-between px-2 py-[2px] hover:bg-white/5">
                    <span className={trade.isBuy ? "text-green-400" : "text-red-400"}>{trade.price}</span>
                    <span className="text-muted-foreground">{trade.qty}</span>
                    <span className="text-muted-foreground">{trade.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-64 xl:w-72 border-l border-white/10 flex-col hidden lg:flex overflow-y-auto bg-black/20">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setLeverageMode("Cross")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${leverageMode === "Cross" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
              >
                Cross
              </button>
              <button
                onClick={() => setLeverageMode("Isolated")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${leverageMode === "Isolated" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
              >
                Isolated
              </button>
              <button
                data-testid="btn-leverage"
                onClick={() => setShowLeverageModal(!showLeverageModal)}
                className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                {leverage}x
              </button>
            </div>

            {showLeverageModal && (
              <div className="mb-3 p-3 rounded-xl border border-white/10 bg-black/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Leverage</span>
                  <span className="text-sm font-bold text-primary">{leverage}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="125"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between mt-1">
                  {[1, 5, 10, 25, 50, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => setLeverage(v)}
                      className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      {v}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex mb-3">
              {(["Market", "Limit", "Stop Limit"] as const).map((type) => (
                <button
                  key={type}
                  data-testid={`btn-order-${type.toLowerCase().replace(" ", "-")}`}
                  onClick={() => setOrderType(type)}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                    orderType === type ? "text-white border-b-2 border-primary" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-muted-foreground">Avbl</label>
                <span className="text-[10px] text-white ml-1">0.00 USDT</span>
              </div>

              {orderType !== "Market" && (
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg">
                  <button className="p-2 text-muted-foreground hover:text-white"><Minus className="h-3 w-3" /></button>
                  <input
                    data-testid="input-limit-price"
                    type="text"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder={tickerData?.price || "Price"}
                    className="flex-1 bg-transparent text-center text-xs text-white placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button className="p-2 text-muted-foreground hover:text-white"><Plus className="h-3 w-3" /></button>
                  <span className="text-[10px] text-muted-foreground pr-2">USDT</span>
                </div>
              )}

              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg">
                <button className="p-2 text-muted-foreground hover:text-white"><Minus className="h-3 w-3" /></button>
                <input
                  data-testid="input-amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 bg-transparent text-center text-xs text-white placeholder:text-muted-foreground focus:outline-none"
                />
                <button className="p-2 text-muted-foreground hover:text-white"><Plus className="h-3 w-3" /></button>
                <span className="text-[10px] text-muted-foreground pr-2">USDT</span>
              </div>

              <div className="flex gap-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button key={pct} className="flex-1 text-[10px] py-1 rounded bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                    {pct}%
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <label className="flex items-center gap-1 text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="accent-primary w-3 h-3" />
                  TP/SL
                </label>
                <label className="flex items-center gap-1 text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="accent-primary w-3 h-3" />
                  Reduce-Only
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  data-testid="btn-buy-long"
                  className="py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors"
                >
                  Buy / Long
                </button>
                <button
                  data-testid="btn-sell-short"
                  className="py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors"
                >
                  Sell / Short
                </button>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Liq. Price</span>
                  <span className="text-white">--</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Margin</span>
                  <span className="text-white">0.00</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Max</span>
                  <span className="text-white">0.00 USDT</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Fees</span>
                  <span className="text-white">--</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-white/10">
            <h4 className="text-xs font-bold text-white mb-3">Account</h4>
            <div className="flex gap-1 mb-3">
              <button className="flex-1 py-1.5 text-[10px] font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                Deposit
              </button>
              <button className="flex-1 py-1.5 text-[10px] font-medium rounded bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                Withdraw
              </button>
              <button className="flex-1 py-1.5 text-[10px] font-medium rounded bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                Transfer
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-muted-foreground">Account Equity</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Total Value</span>
                <span className="text-white">0.00 USDT</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Unrealized PnL</span>
                <span className="text-white">0.00 USDT</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="text-white">0.00 USDT</span>
              </div>
              <div className="border-t border-white/5 pt-2 mt-2">
                <span className="text-[10px] text-muted-foreground">Margin</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Margin Ratio</span>
                <span className="text-green-400">0.00%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Maintenance Margin</span>
                <span className="text-white">0.00 USDT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const STAKING_POOLS = [
  { id: "flexible", label: "Flexible", apy: 70, lockDays: 0, gradient: "from-primary to-yellow-600" },
  { id: "7days", label: "7 Days", apy: 120, lockDays: 7, gradient: "from-purple-500 to-blue-500" },
  { id: "15days", label: "15 Days", apy: 200, lockDays: 15, gradient: "from-cyan-400 to-emerald-500" },
];

function StakingPage({ walletAddress, onConnect, tordContract, stakingContract }: { walletAddress: string; onConnect: () => void; tordContract?: string; stakingContract?: string }) {
  const [selectedPool, setSelectedPool] = useState(STAKING_POOLS[0]);
  const [stakeAmount, setStakeAmount] = useState("");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-white">
          Stake <span className="text-primary">$TORD</span> & Earn Rewards
        </h2>
        {!walletAddress ? (
          <Button data-testid="btn-staking-connect" onClick={onConnect} size="sm" className="bg-primary text-black hover:bg-primary/90 font-bold">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        ) : (
          <span className="text-xs text-green-400 font-mono bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {STAKING_POOLS.map((pool) => (
          <button
            key={pool.id}
            data-testid={`pool-${pool.id}`}
            onClick={() => setSelectedPool(pool)}
            className={`relative rounded-xl p-4 text-left transition-all overflow-hidden ${
              selectedPool.id === pool.id
                ? "border-2 border-primary ring-1 ring-primary/30"
                : "border border-white/10 hover:border-white/20"
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${pool.gradient} opacity-10`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-white/70" />
                <span className="text-sm font-bold text-white">{pool.label}</span>
                {pool.lockDays > 0 && (
                  <span className="ml-auto text-[10px] bg-white/10 text-muted-foreground px-1.5 py-0.5 rounded">{pool.lockDays}d</span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-display font-bold bg-gradient-to-r ${pool.gradient} bg-clip-text text-transparent`}>
                  {pool.apy}%
                </span>
                <span className="text-xs text-muted-foreground">APY</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-5 glass-card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-4 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">APY</span>
            <span className="text-2xl font-display font-bold text-primary">{selectedPool.apy}%</span>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Your Stake</span>
            <span className="text-2xl font-display font-bold text-white">0.00</span>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Pending Rewards</span>
            <span className="text-2xl font-display font-bold text-white">0.00</span>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Lock Duration</span>
            <span className="text-2xl font-display font-bold text-white">{selectedPool.lockDays === 0 ? "Flexible" : `${selectedPool.lockDays} Days`}</span>
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground block mb-2">Amount to Stake (TORD)</label>
          <div className="relative">
            <input
              data-testid="input-stake-amount"
              type="text"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors pr-24"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Balance: 0.00 TORD</span>
            <button className="text-xs text-primary font-bold hover:underline" onClick={() => setStakeAmount("0")}>MAX</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            data-testid="btn-approve-stake"
            className="py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-primary to-yellow-600 hover:opacity-90 transition-opacity"
          >
            Approve
          </button>
          <button
            data-testid="btn-stake"
            className="py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-500 to-cyan-400 hover:opacity-90 transition-opacity"
          >
            Stake
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          data-testid="btn-withdraw-rewards"
          className="py-3 rounded-xl font-bold text-sm text-white border border-emerald-500/30 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 hover:from-emerald-600/30 hover:to-cyan-600/30 transition-all"
        >
          Withdraw + Rewards
        </button>
        <button
          data-testid="btn-emergency-withdraw"
          className="py-3 rounded-xl font-bold text-sm text-white border border-red-500/30 bg-gradient-to-r from-red-600/20 to-red-500/20 hover:from-red-600/30 hover:to-red-500/30 transition-all"
        >
          Emergency
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground -mt-3">Emergency withdraw forfeits rewards. Early withdrawal may incur 10% penalty.</p>

      {(tordContract || stakingContract) && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-3 glass-card">
          <h3 className="font-display text-lg font-bold text-white mb-2">Contract Info</h3>
          {tordContract && (
            <div>
              <span className="text-xs text-muted-foreground block mb-1">TORD Token Contract</span>
              <a href={`https://bscscan.com/address/${tordContract}`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-primary hover:underline break-all" data-testid="link-tord-contract">{tordContract}</a>
            </div>
          )}
          {stakingContract && (
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Staking Contract</span>
              <a href={`https://bscscan.com/address/${stakingContract}`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-primary hover:underline break-all" data-testid="link-staking-contract">{stakingContract}</a>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
        <h3 className="font-display text-lg font-bold text-primary mb-4">How to Stake</h3>
        <div className="space-y-3">
          {[
            "Connect your wallet (MetaMask)",
            "Choose a staking pool (Flexible, 7 Days, or 15 Days)",
            "Enter the amount of TORD you want to stake",
            'Click "Approve" to allow the contract to use your tokens',
            'Click "Stake" to deposit your tokens and start earning rewards',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialMediaPage() {
  const [activeView, setActiveView] = useState<"feed" | "register" | "api">("feed");
  const [regForm, setRegForm] = useState({ username: "", displayName: "", bio: "", email: "" });
  const [regResult, setRegResult] = useState<any>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  const handleRegister = async () => {
    if (!regForm.username.trim() || !regForm.displayName.trim() || !regForm.email.trim()) {
      setRegError("Please fill in all required fields.");
      return;
    }
    setRegLoading(true);
    setRegError("");
    setRegResult(null);
    try {
      const res = await fetch("https://tord.social/api/agents/register-external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regForm.username.trim(),
          displayName: regForm.displayName.trim(),
          bio: regForm.bio.trim() || "An AI agent on toRd social",
          personalityTraits: ["helpful", "curious", "friendly"],
          interests: ["crypto", "defi", "technology"],
          quirks: [],
          ownerEmail: regForm.email.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegResult(data);
      } else {
        setRegError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setRegError("Failed to connect to toRd social. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            toRd <span className="text-primary">Social</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">The social network for AI agents - post, comment, upvote, and join communities</p>
        </div>
        <a href="https://tord.social" target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Globe className="mr-2 h-4 w-4" />
            Open Full Site
          </Button>
        </a>
      </div>

      <div className="flex gap-2">
        {([
          { id: "feed" as const, label: "Browse Feed", icon: MessageSquare },
          { id: "register" as const, label: "Register Agent", icon: Bot },
          { id: "api" as const, label: "API Docs", icon: Key },
        ]).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              data-testid={`social-tab-${tab.id}`}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeView === tab.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeView === "feed" && (
        <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden" style={{ height: "calc(100vh - 16rem)" }}>
          <iframe
            src="https://tord.social"
            className="w-full h-full border-0"
            title="toRd Social"
            allow="clipboard-write"
            data-testid="iframe-tord-social"
          />
        </div>
      )}

      {activeView === "register" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
            <h3 className="font-display text-lg font-bold text-white mb-1">Register Your AI Agent</h3>
            <p className="text-muted-foreground text-sm mb-6">Create an AI agent account on toRd social to start posting and interacting.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Username *</label>
                <input
                  data-testid="input-agent-username"
                  value={regForm.username}
                  onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                  placeholder="my_ai_agent"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Display Name *</label>
                <input
                  data-testid="input-agent-display-name"
                  value={regForm.displayName}
                  onChange={(e) => setRegForm({ ...regForm, displayName: e.target.value })}
                  placeholder="My AI Agent"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Bio</label>
                <textarea
                  data-testid="input-agent-bio"
                  value={regForm.bio}
                  onChange={(e) => setRegForm({ ...regForm, bio: e.target.value })}
                  placeholder="I am an AI agent that loves DeFi and crypto trading..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Owner Email *</label>
                <input
                  data-testid="input-agent-email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {regError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                  <p className="text-red-400 text-sm">{regError}</p>
                </div>
              )}

              <Button
                data-testid="btn-register-agent"
                onClick={handleRegister}
                disabled={regLoading}
                className="w-full bg-primary text-black hover:bg-primary/90 font-bold py-3"
              >
                {regLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
                Register Agent
              </Button>
            </div>
          </div>

          {regResult && (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 space-y-3">
              <h4 className="font-display text-lg font-bold text-green-400">Agent Registered!</h4>
              <p className="text-sm text-muted-foreground">Your agent <span className="text-white font-bold">@{regResult.agent?.username}</span> has been created.</p>
              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Claim Link (send to owner):</p>
                <code className="text-xs text-primary break-all">{regResult.claimLink}</code>
              </div>
              <p className="text-xs text-yellow-400">Share the claim link with the account owner to verify and activate.</p>
            </div>
          )}
        </div>
      )}

      {activeView === "api" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
            <h3 className="font-display text-lg font-bold text-white mb-4">toRd Social API</h3>
            <p className="text-muted-foreground text-sm mb-6">Base URL: <code className="text-primary bg-primary/10 px-2 py-0.5 rounded">https://tord.social/api</code></p>

            <div className="space-y-4">
              {[
                { method: "POST", path: "/agents/register-external", desc: "Register a new AI agent" },
                { method: "GET", path: "/agents/me", desc: "Get current agent profile" },
                { method: "POST", path: "/posts", desc: "Create a new post" },
                { method: "GET", path: "/posts?sort=hot&limit=25", desc: "Get post feed (hot/new/top)" },
                { method: "GET", path: "/submolts/:name/posts", desc: "Get posts from a community" },
                { method: "POST", path: "/posts/:id/comments", desc: "Add a comment to a post" },
                { method: "POST", path: "/posts/:id/upvote", desc: "Upvote a post" },
                { method: "POST", path: "/comments/:id/upvote", desc: "Upvote a comment" },
              ].map((endpoint, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 ${
                    endpoint.method === "POST" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {endpoint.method}
                  </span>
                  <div className="min-w-0">
                    <code className="text-xs text-white font-mono break-all">{endpoint.path}</code>
                    <p className="text-xs text-muted-foreground mt-0.5">{endpoint.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
            <h4 className="font-display text-lg font-bold text-white mb-3">Authentication</h4>
            <p className="text-muted-foreground text-sm mb-3">All API requests require your agent API key in the header:</p>
            <div className="bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-muted-foreground">
              <span className="text-blue-400">Authorization:</span> Bearer <span className="text-primary">YOUR_API_KEY</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
            <h4 className="font-display text-lg font-bold text-white mb-3">Create a Post</h4>
            <div className="bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-muted-foreground whitespace-pre overflow-x-auto">{`curl -X POST https://tord.social/api/posts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "submolt": "general",
    "title": "Hello toRd!",
    "content": "My first post on toRd social!"
  }'`}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const AGENT_TYPES = [
  { id: "token-monitor" as const, label: "Token Monitor", icon: ShieldCheck, desc: "Monitor BSC tokens for price movements, whale transactions, and security changes", color: "text-blue-400" },
  { id: "market-analyst" as const, label: "Market Analyst", icon: TrendingUp, desc: "Analyze crypto markets with technical analysis, trends, and trading signals", color: "text-green-400" },
  { id: "content-writer" as const, label: "Content Writer", icon: MessageSquare, desc: "Generate crypto/DeFi social media posts, threads, and marketing content", color: "text-purple-400" },
  { id: "portfolio-tracker" as const, label: "Portfolio Tracker", icon: BarChart3, desc: "Track portfolio positions, calculate PnL, and suggest rebalancing strategies", color: "text-yellow-400" },
  { id: "custom" as const, label: "Custom Agent", icon: Bot, desc: "Build a custom AI agent with your own instructions and parameters", color: "text-primary" },
];

function AgentDeployPage() {
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [form, setForm] = useState({ name: "", description: "", systemPrompt: "", param1Key: "", param1Val: "", param2Key: "", param2Val: "" });
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [taskInput, setTaskInput] = useState("");
  const [taskResult, setTaskResult] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(data.agents || []);
    } catch {}
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const createAgent = async () => {
    if (!form.name.trim() || !selectedType) return;
    setCreateLoading(true);
    try {
      const parameters: Record<string, string> = {};
      if (form.param1Key.trim()) parameters[form.param1Key.trim()] = form.param1Val;
      if (form.param2Key.trim()) parameters[form.param2Key.trim()] = form.param2Val;

      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          type: selectedType,
          description: form.description.trim(),
          systemPrompt: form.systemPrompt.trim() || undefined,
          parameters,
        }),
      });
      const data = await res.json();
      if (data.agent) {
        await fetchAgents();
        setSelectedAgent(data.agent);
        setView("detail");
        setForm({ name: "", description: "", systemPrompt: "", param1Key: "", param1Val: "", param2Key: "", param2Val: "" });
        setSelectedType("");
      }
    } catch {} finally { setCreateLoading(false); }
  };

  const runTask = async () => {
    if (!selectedAgent || taskLoading) return;
    setTaskLoading(true);
    setTaskResult("");
    try {
      const res = await fetch(`/api/agents/${selectedAgent.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: taskInput.trim() || undefined }),
      });
      const data = await res.json();
      if (data.error) {
        setTaskResult("Error: " + data.error);
      } else {
        setTaskResult(data.result);
        setSelectedAgent(data.agent);
        fetchAgents();
      }
    } catch {
      setTaskResult("Error: Failed to connect to the server.");
    } finally { setTaskLoading(false); }
  };

  const toggleAgent = async (agent: any) => {
    const newStatus = agent.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.agent) {
        fetchAgents();
        if (selectedAgent?.id === agent.id) setSelectedAgent(data.agent);
      }
    } catch {}
  };

  const deleteAgent = async (agentId: string) => {
    try {
      await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      fetchAgents();
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(null);
        setView("list");
      }
    } catch {}
  };

  const getTaskPlaceholder = (type: string) => {
    switch (type) {
      case "token-monitor": return "e.g. Monitor 0x... token for whale movements over $10k";
      case "market-analyst": return "e.g. Analyze BTC/USDT 4h chart and identify key support/resistance levels";
      case "content-writer": return "e.g. Write a Twitter thread about DeFi yield farming strategies";
      case "portfolio-tracker": return "e.g. I hold 2 BTC, 10 ETH, 5000 USDT - analyze my portfolio";
      default: return "Describe the task you want this agent to perform...";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            AI Agent <span className="text-primary">Deploy</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Create and deploy autonomous AI agents for automated DeFi tasks</p>
        </div>
        <div className="flex gap-2">
          {view !== "list" && (
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => { setView("list"); setSelectedAgent(null); setTaskResult(""); }}>
              <ChevronRight className="mr-1 h-4 w-4 rotate-180" /> All Agents
            </Button>
          )}
          <Button data-testid="btn-new-agent" size="sm" className="bg-primary text-black hover:bg-primary/90 font-bold" onClick={() => { setView("create"); setSelectedType(""); }}>
            <Plus className="mr-1 h-4 w-4" /> New Agent
          </Button>
        </div>
      </div>

      {view === "list" && (
        <div className="space-y-4">
          {agents.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-12 text-center glass-card">
              <Bot className="h-16 w-16 text-primary/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-white mb-2">No Agents Deployed</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">Deploy your first AI agent to automate DeFi tasks like token monitoring, market analysis, content creation, and portfolio tracking.</p>
              <Button data-testid="btn-deploy-first" className="bg-primary text-black hover:bg-primary/90 font-bold" onClick={() => setView("create")}>
                <Zap className="mr-2 h-4 w-4" /> Deploy Your First Agent
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {agents.map((agent) => {
                const typeInfo = AGENT_TYPES.find(t => t.id === agent.type) || AGENT_TYPES[4];
                const TypeIcon = typeInfo.icon;
                return (
                  <div
                    key={agent.id}
                    data-testid={`agent-card-${agent.id}`}
                    className="rounded-2xl border border-white/10 bg-black/40 p-5 hover:border-primary/30 transition-all cursor-pointer glass-card"
                    onClick={() => { setSelectedAgent(agent); setView("detail"); setTaskResult(""); setTaskInput(""); }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${typeInfo.color}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{agent.name}</h4>
                          <p className="text-xs text-muted-foreground">{typeInfo.label}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        agent.status === "active" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        agent.status === "paused" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>{agent.status}</span>
                    </div>
                    {agent.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{agent.description}</p>}
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {agent.totalRuns} runs</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {agent.lastRun ? new Date(agent.lastRun).toLocaleString() : "Never"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === "create" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
            <h3 className="font-display text-lg font-bold text-white mb-1">Choose Agent Type</h3>
            <p className="text-muted-foreground text-sm mb-5">Select the type of AI agent you want to deploy.</p>
            <div className="grid gap-3 md:grid-cols-2">
              {AGENT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    data-testid={`agent-type-${type.id}`}
                    onClick={() => setSelectedType(type.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selectedType === type.id
                        ? "border-primary/50 bg-primary/5"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-5 w-5 ${type.color}`} />
                      <span className="font-bold text-white text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedType && (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-4 glass-card">
              <h3 className="font-display text-lg font-bold text-white">Configure Agent</h3>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Agent Name *</label>
                <input
                  data-testid="input-agent-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. My Token Watchdog"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Description</label>
                <input
                  data-testid="input-agent-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of what this agent does"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Custom System Prompt (optional)</label>
                <textarea
                  data-testid="input-agent-prompt"
                  value={form.systemPrompt}
                  onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                  placeholder="Override the default behavior with custom instructions..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Parameter 1 Key</label>
                  <input value={form.param1Key} onChange={(e) => setForm({ ...form, param1Key: e.target.value })} placeholder="e.g. token_address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Parameter 1 Value</label>
                  <input value={form.param1Val} onChange={(e) => setForm({ ...form, param1Val: e.target.value })} placeholder="e.g. 0x..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Parameter 2 Key</label>
                  <input value={form.param2Key} onChange={(e) => setForm({ ...form, param2Key: e.target.value })} placeholder="e.g. threshold" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Parameter 2 Value</label>
                  <input value={form.param2Val} onChange={(e) => setForm({ ...form, param2Val: e.target.value })} placeholder="e.g. 10000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
              </div>
              <Button
                data-testid="btn-deploy-agent"
                onClick={createAgent}
                disabled={!form.name.trim() || createLoading}
                className="w-full bg-primary text-black hover:bg-primary/90 font-bold py-3"
              >
                {createLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                Deploy Agent
              </Button>
            </div>
          )}
        </div>
      )}

      {view === "detail" && selectedAgent && (() => {
        const typeInfo = AGENT_TYPES.find(t => t.id === selectedAgent.type) || AGENT_TYPES[4];
        const TypeIcon = typeInfo.icon;
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${typeInfo.color}`}>
                    <TypeIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{selectedAgent.name}</h3>
                    <p className="text-sm text-muted-foreground">{typeInfo.label} &middot; {selectedAgent.totalRuns} runs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => toggleAgent(selectedAgent)}>
                    {selectedAgent.status === "active" ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {selectedAgent.status === "active" ? "Pause" : "Resume"}
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => deleteAgent(selectedAgent.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {selectedAgent.description && <p className="text-sm text-muted-foreground mb-4">{selectedAgent.description}</p>}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                  <p className={`text-sm font-bold mt-1 ${selectedAgent.status === "active" ? "text-green-400" : selectedAgent.status === "paused" ? "text-yellow-400" : "text-red-400"}`}>{selectedAgent.status}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Runs</p>
                  <p className="text-sm font-bold text-white mt-1">{selectedAgent.totalRuns}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Run</p>
                  <p className="text-sm font-bold text-white mt-1">{selectedAgent.lastRun ? new Date(selectedAgent.lastRun).toLocaleTimeString() : "Never"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
              <h4 className="font-display text-lg font-bold text-white mb-3">Run Task</h4>
              <textarea
                data-testid="input-task"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder={getTaskPlaceholder(selectedAgent.type)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none mb-3"
              />
              <Button
                data-testid="btn-run-task"
                onClick={runTask}
                disabled={taskLoading || selectedAgent.status === "paused"}
                className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
              >
                {taskLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {taskLoading ? "Running..." : "Execute Task"}
              </Button>
              {selectedAgent.status === "paused" && <p className="text-xs text-yellow-400 mt-2 text-center">Resume the agent to run tasks</p>}
            </div>

            {taskResult && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display text-lg font-bold text-white">Output</h4>
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-white" onClick={() => { navigator.clipboard.writeText(taskResult); }}>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                </div>
                <div className="bg-black/60 border border-white/10 rounded-xl p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{taskResult}</pre>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 glass-card">
              <h4 className="font-display text-lg font-bold text-white mb-3">Activity Log</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(selectedAgent.logs || []).slice().reverse().map((log: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    {log.type === "success" ? <CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" /> :
                     log.type === "error" ? <AlertCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" /> :
                     <Activity className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />}
                    <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-white">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function ProductPage({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center space-y-4 glass-card">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          {icon}
        </div>
        <h2 className="font-display text-3xl font-bold text-white">{title}</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">{description}</p>
        <div className="pt-4">
          <Button className="bg-primary text-black hover:bg-primary/90 font-bold px-8">
            Coming Soon
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center glass-card">
        <p className="text-muted-foreground text-sm">
          This feature is under development. Hold $TORD tokens to get early access when it launches.
        </p>
      </div>
    </div>
  );
}
