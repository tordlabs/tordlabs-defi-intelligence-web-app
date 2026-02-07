import { useState, useEffect, useCallback } from "react";
import { ArrowUp, Menu, X, Send, Github, Copy, Check, ExternalLink } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: settings } = useSiteSettings();

  const twitterUrl = settings?.twitter_url || "https://x.com/tordlabs";
  const telegramUrl = settings?.telegram_url || "https://t.me/TordLabs";
  const githubUrl = settings?.github_url || "https://github.com/tordlabs";
  const contract = settings?.tord_contract || "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  }, []);

  const copyContract = useCallback(() => {
    navigator.clipboard.writeText(contract);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [contract]);

  return (
    <>
      <div
        className={`fixed bottom-8 right-8 z-50 hidden md:flex transition-all duration-300 ${showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <button
          onClick={scrollToTop}
          className="h-12 w-12 rounded-full bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-110 transition-all"
          data-testid="btn-back-to-top"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>

      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <div
          className={`absolute bottom-16 right-0 transition-all duration-300 ${menuOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-4 pointer-events-none"}`}
        >
          <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-64 shadow-2xl shadow-black/50 space-y-1" data-testid="assistive-menu">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-3 pt-1 pb-2">Navigation</p>
            <MenuItem label="Ecosystem" onClick={() => scrollTo("ecosystem")} />
            <MenuItem label="Tokenomics" onClick={() => scrollTo("tokenomics")} />
            <MenuItem label="Roadmap" onClick={() => scrollTo("roadmap")} />
            <MenuItem label="Community" onClick={() => scrollTo("community")} />

            <div className="h-px bg-white/10 my-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-3 pt-1 pb-2">Socials</p>
            <SocialItem
              icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
              label="Twitter / X"
              href={twitterUrl}
            />
            <SocialItem icon={<Send className="h-4 w-4" />} label="Telegram" href={telegramUrl} />
            <SocialItem icon={<Github className="h-4 w-4" />} label="GitHub" href={githubUrl} />

            <div className="h-px bg-white/10 my-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-3 pt-1 pb-2">Quick Actions</p>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white hover:bg-white/10 transition-colors"
              data-testid="assistive-back-to-top"
            >
              <ArrowUp className="h-4 w-4 text-primary" />
              Back to Top
            </button>
            <button
              onClick={copyContract}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white hover:bg-white/10 transition-colors"
              data-testid="assistive-copy-contract"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-primary" />}
              {copied ? "Copied!" : "Copy Smart Contract"}
            </button>
          </div>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${menuOpen ? "bg-white/10 border border-white/20 shadow-black/30 rotate-0" : "bg-primary/90 text-black shadow-primary/30 hover:shadow-primary/50 hover:scale-105"}`}
          data-testid="btn-assistive-touch"
          aria-label="Menu"
        >
          {menuOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-5 h-5 flex items-center justify-center">
                <img src="/logo.png" alt="Menu" className="w-5 h-5" />
              </div>
            </div>
          )}
        </button>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white hover:bg-white/10 transition-colors"
      data-testid={`assistive-nav-${label.toLowerCase()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      {label}
    </button>
  );
}

function SocialItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white hover:bg-white/10 transition-colors"
      data-testid={`assistive-social-${label.toLowerCase().replace(/[\s\/]/g, '-')}`}
    >
      <span className="text-primary">{icon}</span>
      {label}
      <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
    </a>
  );
}
