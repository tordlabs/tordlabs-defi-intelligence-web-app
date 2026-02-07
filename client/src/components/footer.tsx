import { Send, Github } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Footer() {
  const { data: settings } = useSiteSettings();

  const twitterUrl = settings?.twitter_url || "https://x.com/tordlabs";
  const telegramUrl = settings?.telegram_url || "https://t.me/TordLabs";
  const githubUrl = settings?.github_url || "https://github.com/tordlabs";

  return (
    <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Tord Labs" className="h-8 w-auto" />
              <span className="font-display font-bold text-lg text-white">TORD LABS</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The next generation of decentralized finance intelligence. 
              AI-driven yield optimization and automated trading strategies.
            </p>
          </div>
          
          <div>
            <h4 className="font-display font-bold text-white mb-6">Products</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/dashboard" className="hover:text-primary transition-colors">AI Agent</a></li>
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Deep Research</a></li>
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Image Generator</a></li>
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Token Analyzer</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-6">More</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Free API Key</a></li>
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Futures Trade</a></li>
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Staking</a></li>
              <li><a href="/dashboard" className="hover:text-primary transition-colors">AI Agent Deploy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-6">Socials</h4>
            <div className="flex gap-4">
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                <Send className="h-5 w-5" />
              </a>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2025 Tord Labs. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
