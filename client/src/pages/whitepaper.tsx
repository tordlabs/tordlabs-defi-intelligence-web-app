import { Link } from "wouter";
import { ArrowLeft, Zap, Shield, Brain, BarChart3, Lock, Bot, Globe, Key, Image, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-6">
        <span className="text-primary">#</span> {title}
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-5 glass-card">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="font-display text-sm font-bold text-white mb-1">{title}</h4>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

const tocItems = [
  { id: "abstract", label: "Abstract" },
  { id: "introduction", label: "Introduction" },
  { id: "vision", label: "Vision & Mission" },
  { id: "platform", label: "Platform Overview" },
  { id: "ai-features", label: "AI-Powered Features" },
  { id: "tokenomics", label: "Tokenomics" },
  { id: "staking", label: "Staking Program" },
  { id: "security", label: "Security" },
  { id: "roadmap", label: "Roadmap" },
  { id: "mobile", label: "Mobile Application" },
  { id: "community", label: "Community & Governance" },
  { id: "conclusion", label: "Conclusion" },
  { id: "disclaimer", label: "Disclaimer" },
];

export default function Whitepaper() {
  return (
    <div className="min-h-screen text-foreground" style={{ backgroundColor: '#0a0a0b' }}>
      <Navbar />

      <div className="container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-white mb-4" data-testid="btn-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center mb-16 space-y-4">
            <p className="text-primary font-medium text-sm uppercase tracking-widest">Official Documentation</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">
              TORD <span className="text-primary">Whitepaper</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              AI-Powered Yield Aggregation and Crypto Trading Protocol on Binance Smart Chain
            </p>
            <p className="text-xs text-muted-foreground">Version 1.0 — 2025</p>
          </div>

          <nav className="rounded-2xl border border-white/10 bg-black/40 p-6 mb-16 glass-card" data-testid="toc-nav">
            <h3 className="font-display text-lg font-bold text-white mb-4">Table of Contents</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {tocItems.map((item, i) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                  data-testid={`toc-link-${item.id}`}
                >
                  <span className="text-primary/60 mr-2">{String(i + 1).padStart(2, "0")}.</span>
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-16">

            <Section id="abstract" title="Abstract">
              <p>
                Tord Labs is an AI-powered decentralized finance (DeFi) platform built on the Binance Smart Chain (BSC). The protocol combines cutting-edge artificial intelligence with blockchain technology to deliver a comprehensive suite of tools for crypto traders, researchers, and enthusiasts. By holding the $TORD token, users gain access to over 200 AI models, advanced trading tools, deep research capabilities, and a full staking ecosystem — all at no additional cost.
              </p>
              <p>
                This whitepaper outlines the vision, architecture, features, tokenomics, and roadmap for the Tord Labs ecosystem.
              </p>
            </Section>

            <Section id="introduction" title="Introduction">
              <p>
                The cryptocurrency landscape is evolving rapidly, with artificial intelligence playing an increasingly vital role in trading, analysis, and decision-making. However, most AI-powered tools remain fragmented, expensive, and difficult to access for the average user.
              </p>
              <p>
                Tord Labs addresses this gap by creating a unified platform where users can access premium AI capabilities through a single token holding. Instead of paying monthly subscriptions to multiple services, $TORD holders receive daily free credits that unlock the full power of the platform.
              </p>
              <p>
                Built on BSC for its low transaction fees and high throughput, Tord Labs is designed to be accessible, fast, and cost-effective for users worldwide.
              </p>
            </Section>

            <Section id="vision" title="Vision & Mission">
              <SubSection title="Vision">
                <p>
                  To become the leading AI-powered DeFi intelligence platform, making advanced artificial intelligence tools accessible to every crypto participant regardless of technical expertise or financial resources.
                </p>
              </SubSection>
              <SubSection title="Mission">
                <p>
                  Our mission is to democratize AI-powered financial tools by creating a token-gated ecosystem where holding $TORD provides free access to premium AI models, research tools, trading signals, and portfolio management capabilities that were previously only available to institutional players.
                </p>
              </SubSection>
              <SubSection title="Core Principles">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><span className="text-white font-medium">Accessibility</span> — Premium AI tools should be available to everyone, not just the wealthy</li>
                  <li><span className="text-white font-medium">Transparency</span> — Open tokenomics, clear roadmap, and community-driven development</li>
                  <li><span className="text-white font-medium">Innovation</span> — Continuously integrating the latest AI models and DeFi protocols</li>
                  <li><span className="text-white font-medium">Security</span> — Smart contract audits, read-only wallet connections, and industry-standard encryption</li>
                  <li><span className="text-white font-medium">Community First</span> — Every decision is made with the community's best interest at heart</li>
                </ul>
              </SubSection>
            </Section>

            <Section id="platform" title="Platform Overview">
              <p>
                Tord Labs is a full-featured DeFi platform that combines AI intelligence with traditional crypto tools. The platform is accessible via web browser and mobile applications, providing a seamless experience across devices.
              </p>
              <SubSection title="How It Works">
                <div className="rounded-xl border border-white/10 bg-black/30 p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-display font-bold text-sm">1</div>
                    <div>
                      <p className="text-white font-medium">Hold $TORD Tokens</p>
                      <p className="text-sm text-muted-foreground">Purchase and hold $TORD tokens in your BSC-compatible wallet (MetaMask, Trust Wallet, etc.)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-display font-bold text-sm">2</div>
                    <div>
                      <p className="text-white font-medium">Connect Your Wallet</p>
                      <p className="text-sm text-muted-foreground">Securely connect your wallet to the Tord Labs platform with a read-only connection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-display font-bold text-sm">3</div>
                    <div>
                      <p className="text-white font-medium">Receive Daily Credits</p>
                      <p className="text-sm text-muted-foreground">Automatically receive up to $15 in daily free credits based on your token holdings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-display font-bold text-sm">4</div>
                    <div>
                      <p className="text-white font-medium">Access All Tools</p>
                      <p className="text-sm text-muted-foreground">Use your credits across 200+ AI models, research tools, trading, and more</p>
                    </div>
                  </div>
                </div>
              </SubSection>
            </Section>

            <Section id="ai-features" title="AI-Powered Features">
              <p>
                The Tord Labs platform offers a comprehensive suite of AI-powered tools designed for crypto traders, researchers, and content creators.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <FeatureCard
                  icon={<Brain className="h-5 w-5 text-primary" />}
                  title="Tord AI Agent"
                  description="An intelligent AI assistant that matches your tasks with the best-fit AI model. Chat naturally and get expert-level responses powered by the latest language models."
                />
                <FeatureCard
                  icon={<Search className="h-5 w-5 text-primary" />}
                  title="Deep Research"
                  description="Enter any topic and receive comprehensive, AI-powered research analysis with citations, insights, and actionable summaries."
                />
                <FeatureCard
                  icon={<Image className="h-5 w-5 text-primary" />}
                  title="Image Generator"
                  description="Generate high-quality, styled images from text prompts. Users receive 2 free generations per day with additional credits available."
                />
                <FeatureCard
                  icon={<BarChart3 className="h-5 w-5 text-primary" />}
                  title="Token Analyzer"
                  description="AI-powered token security analysis using GoPlus security data. Get sentiment scores, technical indicators, and on-chain risk assessments for any token."
                />
                <FeatureCard
                  icon={<Key className="h-5 w-5 text-primary" />}
                  title="Free API Key"
                  description="$TORD holders receive free API keys with daily credit limits, providing programmatic access to 200+ AI models for developers and builders."
                />
                <FeatureCard
                  icon={<TrendingUp className="h-5 w-5 text-primary" />}
                  title="Futures Trading"
                  description="Trade crypto futures with advanced TradingView charts, real-time market data, and AI-powered trading signals for informed decision-making."
                />
                <FeatureCard
                  icon={<Globe className="h-5 w-5 text-primary" />}
                  title="AI Social Media"
                  description="Automate your social media presence with AI-powered content creation, engagement strategies, and growth optimization via tord.social integration."
                />
                <FeatureCard
                  icon={<Bot className="h-5 w-5 text-primary" />}
                  title="AI Agent Deploy"
                  description="Deploy autonomous AI agents to automate DeFi tasks. Choose from 5 agent types: Token Monitor, Market Analyst, Content Creator, Portfolio Tracker, and Trading Bot."
                />
              </div>

              <SubSection title="AI Model Access">
                <p>
                  Tord Labs provides access to over 200 AI models from leading providers, including but not limited to:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {["GPT-5.2", "Claude Opus 4.6", "Gemini 3 Pro", "DeepSeek R1", "Grok 4", "Qwen3 Max", "Llama 4", "Mistral Large"].map(model => (
                    <div key={model} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-center">
                      <span className="text-xs text-white font-medium">{model}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-3">
                  New models are added as soon as they are released by their respective providers, ensuring users always have access to the latest and most capable AI technologies.
                </p>
              </SubSection>
            </Section>

            <Section id="tokenomics" title="Tokenomics">
              <p>
                The $TORD token is the native utility token of the Tord Labs ecosystem, launching exclusively on the flap.sh launchpad on Binance Smart Chain (BSC).
              </p>

              <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-6 glass-card mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Token Name</p>
                    <p className="text-white font-display font-bold">TORD</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Network</p>
                    <p className="text-white font-display font-bold">BSC (BEP-20)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Supply</p>
                    <p className="text-white font-display font-bold">1,000,000,000</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Launch Platform</p>
                    <p className="text-white font-display font-bold">flap.sh</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Token Type</p>
                    <p className="text-white font-display font-bold">Utility</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pricing</p>
                    <p className="text-white font-display font-bold">FREE for Holders</p>
                  </div>
                </div>
              </div>

              <SubSection title="Token Utility">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><span className="text-white font-medium">Platform Access</span> — Hold $TORD to unlock free daily credits for all AI-powered tools</li>
                  <li><span className="text-white font-medium">Staking Rewards</span> — Stake $TORD tokens in tiered pools to earn passive yields up to 200% APY</li>
                  <li><span className="text-white font-medium">API Access</span> — Receive free API keys with daily credit allocations for programmatic access</li>
                  <li><span className="text-white font-medium">Governance</span> — Participate in platform governance and vote on future development priorities</li>
                  <li><span className="text-white font-medium">Premium Features</span> — Access advanced features, higher usage limits, and priority support</li>
                </ul>
              </SubSection>
            </Section>

            <Section id="staking" title="Staking Program">
              <p>
                The Tord Labs staking program allows $TORD holders to earn passive rewards by locking their tokens in tiered staking pools. Each tier offers different APY rates, lock periods, and minimum requirements.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-center space-y-3 glass-card">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                    <Lock className="h-5 w-5 text-amber-400" />
                  </div>
                  <h4 className="font-display text-lg font-bold text-white">Bronze Pool</h4>
                  <p className="text-3xl font-display font-bold text-primary">70% <span className="text-sm text-muted-foreground">APY</span></p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>30-day lock period</p>
                    <p>Min: 1,000 TORD</p>
                  </div>
                </div>
                <div className="rounded-xl border border-primary/30 bg-black/40 p-6 text-center space-y-3 glass-card">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-display text-lg font-bold text-white">Silver Pool</h4>
                  <p className="text-3xl font-display font-bold text-primary">120% <span className="text-sm text-muted-foreground">APY</span></p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>90-day lock period</p>
                    <p>Min: 10,000 TORD</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-center space-y-3 glass-card">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">
                    <Lock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <h4 className="font-display text-lg font-bold text-white">Gold Pool</h4>
                  <p className="text-3xl font-display font-bold text-primary">200% <span className="text-sm text-muted-foreground">APY</span></p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>180-day lock period</p>
                    <p>Min: 50,000 TORD</p>
                  </div>
                </div>
              </div>

              <SubSection title="Staking Mechanics">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Rewards are calculated and distributed continuously based on block time</li>
                  <li>Early withdrawal incurs a 10% penalty on staked amount</li>
                  <li>Emergency withdraw option is available but forfeits all accumulated rewards</li>
                  <li>Compound staking is supported — rewards can be re-staked automatically</li>
                  <li>All staking operations are executed through audited smart contracts on BSC</li>
                </ul>
              </SubSection>
            </Section>

            <Section id="security" title="Security">
              <p>
                Security is a foundational pillar of the Tord Labs ecosystem. The platform is designed with multiple layers of protection to safeguard user assets and data.
              </p>
              <SubSection title="Security Measures">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><span className="text-white font-medium">Read-Only Wallet Connection</span> — The platform only reads your wallet balance; it cannot initiate transactions or move funds</li>
                  <li><span className="text-white font-medium">Smart Contract Audits</span> — All smart contracts undergo rigorous third-party security audits before deployment</li>
                  <li><span className="text-white font-medium">Industry-Standard Encryption</span> — All data transmissions are encrypted using TLS/SSL protocols</li>
                  <li><span className="text-white font-medium">Token Security Analysis</span> — GoPlus integration provides real-time security scoring for analyzed tokens</li>
                  <li><span className="text-white font-medium">Non-Custodial</span> — Users maintain full custody of their tokens at all times; the platform never holds user funds</li>
                </ul>
              </SubSection>
            </Section>

            <Section id="roadmap" title="Roadmap">
              <div className="space-y-6 mt-6">
                <div className="rounded-xl border border-white/10 bg-black/40 p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-display font-bold text-sm">Q1</span>
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-white">Phase 1 — Foundation</h4>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-13">
                    <li>Launch Token Analyzer with GoPlus security integration</li>
                    <li>Tord Free API release for $TORD holders</li>
                    <li>AI Agent launch with multi-model support</li>
                    <li>Community building and initial partnerships</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-display font-bold text-sm">Q2</span>
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-white">Phase 2 — Expansion</h4>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-13">
                    <li>Token Swap integration for seamless trading</li>
                    <li>Futures Trading launch with TradingView charts</li>
                    <li>AI Agent Social Media automation tools</li>
                    <li>Strategic partnership announcements</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-display font-bold text-sm">Q3</span>
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-white">Phase 3 — Achievements</h4>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-13">
                    <li>Staking Platform launch with tiered APY pools</li>
                    <li>TORD DEX launch for native token trading</li>
                    <li>Tord AI Assistant with enhanced capabilities</li>
                    <li>Deep Research tool with comprehensive analysis</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-display font-bold text-sm">Q4</span>
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-white">Phase 4 — Innovation</h4>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-13">
                    <li>AI Trading Signals with machine learning predictions</li>
                    <li>Image and Video Generation capabilities</li>
                    <li>Multi-chain support beyond BSC</li>
                    <li>Global expansion and localization</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section id="mobile" title="Mobile Application">
              <p>
                The Tord Labs mobile application brings the full power of the platform to iOS and Android devices. Users can access all AI tools, manage their portfolio, stake tokens, and receive real-time alerts directly from their mobile devices.
              </p>
              <SubSection title="Mobile Features">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><span className="text-white font-medium">Real-Time Alerts</span> — Instant notifications on token movements and market changes</li>
                  <li><span className="text-white font-medium">Secure Wallet Integration</span> — Industry-leading encryption for mobile asset management</li>
                  <li><span className="text-white font-medium">AI On-The-Go</span> — Full access to all AI tools including chat, research, and image generation</li>
                  <li><span className="text-white font-medium">Portfolio Dashboard</span> — Track your holdings, staking rewards, and credit balance</li>
                </ul>
              </SubSection>
              <p className="text-sm">
                The mobile app is available for download on both Google Play and the Apple App Store.
              </p>
            </Section>

            <Section id="community" title="Community & Governance">
              <p>
                The Tord Labs community is the backbone of the ecosystem. We believe in transparent, community-driven development where token holders have a voice in the platform's future direction.
              </p>
              <SubSection title="Community Channels">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><span className="text-white font-medium">Twitter / X</span> — Follow for the latest announcements, updates, and community engagement</li>
                  <li><span className="text-white font-medium">Telegram</span> — Join the community chat for real-time discussions and support</li>
                  <li><span className="text-white font-medium">GitHub</span> — Contribute to the open-source components of the ecosystem</li>
                </ul>
              </SubSection>
              <SubSection title="Governance">
                <p>
                  $TORD holders will participate in governance decisions through a decentralized voting mechanism. Proposals can include new feature requests, partnership approvals, tokenomics adjustments, and protocol upgrades. Voting power is proportional to token holdings and staking participation.
                </p>
              </SubSection>
            </Section>

            <Section id="conclusion" title="Conclusion">
              <p>
                Tord Labs represents a new paradigm in DeFi — one where artificial intelligence and blockchain technology converge to create a more accessible, intelligent, and profitable ecosystem for all participants. By holding $TORD, users unlock a world of premium AI tools, passive income through staking, and a vibrant community of like-minded individuals building the future of decentralized finance.
              </p>
              <p>
                Join us in shaping the golden era of DeFi intelligence.
              </p>
            </Section>

            <Section id="disclaimer" title="Disclaimer">
              <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-sm">
                <p className="text-muted-foreground mb-3">
                  This whitepaper is for informational purposes only and does not constitute financial advice, an offer to sell, or a solicitation of an offer to buy any securities or tokens. The information provided herein is subject to change without notice.
                </p>
                <p className="text-muted-foreground mb-3">
                  Cryptocurrency investments are highly volatile and carry significant risk. Past performance is not indicative of future results. Users should conduct their own research and consult with qualified financial advisors before making any investment decisions.
                </p>
                <p className="text-muted-foreground mb-3">
                  The $TORD token is a utility token designed to provide access to the Tord Labs platform and its features. It is not intended to be a security, investment contract, or any form of financial instrument.
                </p>
                <p className="text-muted-foreground">
                  Tord Labs makes no warranties or guarantees regarding the performance of the platform, the value of the $TORD token, or the returns from staking programs. APY rates are estimates and may vary based on market conditions, total staked amount, and protocol parameters.
                </p>
              </div>
            </Section>

          </div>

          <div className="mt-16 text-center space-y-6">
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <p className="text-muted-foreground text-sm">
              For questions or partnerships, connect with us through our community channels.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/dashboard">
                <Button className="bg-primary text-black hover:bg-primary/90 font-bold neon-snake-btn" data-testid="btn-launch-app">
                  <Zap className="mr-2 h-4 w-4" /> Launch App
                </Button>
              </a>
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="btn-back-home-bottom">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
