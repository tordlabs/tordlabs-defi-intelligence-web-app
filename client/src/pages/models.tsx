import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useState, useMemo } from "react";

const allModels = [
  { provider: "OpenAI", initial: "G", color: "bg-green-600", name: "GPT-5.2", context: "1.0M", description: "GPT-5.2 is OpenAI's most capable model, featuring advanced reasoning, multimodal understanding, and extended context.", inputPrice: "$5.0000/M", outputPrice: "$15.0000/M", free: false },
  { provider: "OpenAI", initial: "G", color: "bg-green-600", name: "GPT-4.1", context: "1.0M", description: "GPT-4.1 delivers improved instruction following, coding accuracy, and broad knowledge across many domains.", inputPrice: "$2.0000/M", outputPrice: "$8.0000/M", free: false },
  { provider: "OpenAI", initial: "G", color: "bg-green-600", name: "GPT-4o", context: "128.0K", description: "GPT-4o is OpenAI's versatile multimodal model combining text, vision, and audio capabilities at high speed.", inputPrice: "$2.5000/M", outputPrice: "$10.0000/M", free: false },
  { provider: "OpenAI", initial: "G", color: "bg-green-600", name: "GPT-4o Mini", context: "128.0K", description: "A smaller, faster, and more affordable version of GPT-4o optimized for lightweight tasks and rapid responses.", inputPrice: "$0.1500/M", outputPrice: "$0.6000/M", free: false },
  { provider: "OpenAI", initial: "G", color: "bg-green-600", name: "o3 Pro", context: "200.0K", description: "o3 Pro is OpenAI's most powerful reasoning model, excelling at complex math, science, and coding challenges.", inputPrice: "$20.0000/M", outputPrice: "$80.0000/M", free: false },
  { provider: "OpenAI", initial: "G", color: "bg-green-600", name: "o3 Mini", context: "200.0K", description: "o3 Mini provides strong reasoning capabilities at a fraction of the cost, ideal for logic and analysis tasks.", inputPrice: "$1.1000/M", outputPrice: "$4.4000/M", free: false },
  { provider: "OpenAI", initial: "G", color: "bg-green-600", name: "o4 Mini", context: "200.0K", description: "o4 Mini is the latest compact reasoning model from OpenAI with improved efficiency and performance.", inputPrice: "$1.1000/M", outputPrice: "$4.4000/M", free: false },
  { provider: "Anthropic", initial: "A", color: "bg-orange-600", name: "Claude Opus 4.6", context: "1.0M", description: "Opus 4.6 is Anthropic's strongest model for coding and long-running professional tasks, built for agentic workflows.", inputPrice: "$5.0000/M", outputPrice: "$25.0000/M", free: false },
  { provider: "Anthropic", initial: "A", color: "bg-orange-600", name: "Claude Opus 4.5", context: "200.0K", description: "Claude Opus 4.5 is Anthropic's frontier reasoning model optimized for complex software engineering.", inputPrice: "$5.0000/M", outputPrice: "$25.0000/M", free: false },
  { provider: "Anthropic", initial: "A", color: "bg-orange-600", name: "Claude Sonnet 4.5", context: "1.0M", description: "Claude Sonnet 4.5 is the most advanced Sonnet model, optimized for real-world agents and coding workflows.", inputPrice: "$3.0000/M", outputPrice: "$15.0000/M", free: false },
  { provider: "Anthropic", initial: "A", color: "bg-orange-600", name: "Claude Sonnet 4", context: "1.0M", description: "Claude Sonnet 4 enhances its predecessor with stronger coding and reasoning while maintaining speed.", inputPrice: "$3.0000/M", outputPrice: "$15.0000/M", free: false },
  { provider: "Anthropic", initial: "A", color: "bg-orange-600", name: "Claude 3.7 Sonnet", context: "200.0K", description: "Advanced large language model with improved reasoning, coding, and problem-solving capabilities.", inputPrice: "$3.0000/M", outputPrice: "$15.0000/M", free: false },
  { provider: "Anthropic", initial: "A", color: "bg-orange-600", name: "Claude 3.5 Haiku", context: "200.0K", description: "Claude 3.5 Haiku features enhanced capabilities in speed, coding accuracy, and tool use at low cost.", inputPrice: "$0.8000/M", outputPrice: "$4.0000/M", free: false },
  { provider: "Anthropic", initial: "A", color: "bg-orange-600", name: "Claude Haiku 4.5", context: "200.0K", description: "Anthropic's fastest and most efficient model, delivering near-frontier intelligence at a fraction of the cost.", inputPrice: "$1.0000/M", outputPrice: "$5.0000/M", free: false },
  { provider: "Google", initial: "G", color: "bg-blue-600", name: "Gemini 2.5 Flash", context: "1.0M", description: "Google's state-of-the-art workhorse model for advanced reasoning, coding, math, and data analysis.", inputPrice: "$0.3000/M", outputPrice: "$2.5000/M", free: false },
  { provider: "Google", initial: "G", color: "bg-blue-600", name: "Gemini 2.5 Pro", context: "1.0M", description: "Google's most capable model for complex reasoning, multimodal understanding, and extended context tasks.", inputPrice: "$1.2500/M", outputPrice: "$10.0000/M", free: false },
  { provider: "Google", initial: "G", color: "bg-blue-600", name: "Gemini 2.0 Flash", context: "1.0M", description: "Offers significantly faster time to first token compared to previous versions with strong multimodal capabilities.", inputPrice: "$0.1000/M", outputPrice: "$0.4000/M", free: false },
  { provider: "Google", initial: "G", color: "bg-blue-600", name: "Gemini 2.0 Flash Lite", context: "1.0M", description: "Ultra-fast and cost-efficient variant of Gemini Flash optimized for high-throughput applications.", inputPrice: "$0.0750/M", outputPrice: "$0.3000/M", free: true },
  { provider: "Google", initial: "G", color: "bg-blue-600", name: "Gemini 3 Pro", context: "1.0M", description: "Next-generation Gemini model with enhanced reasoning, improved multimodal understanding, and broader capabilities.", inputPrice: "$2.0000/M", outputPrice: "$12.0000/M", free: false },
  { provider: "DeepSeek", initial: "D", color: "bg-purple-600", name: "DeepSeek R1", context: "64.0K", description: "Performance on par with OpenAI o1, open-sourced with fully open reasoning tokens for transparency.", inputPrice: "$0.7000/M", outputPrice: "$2.5000/M", free: false },
  { provider: "DeepSeek", initial: "D", color: "bg-purple-600", name: "DeepSeek R1 0528", context: "163.8K", description: "Updated R1 with improved performance on par with frontier models, fully open reasoning tokens.", inputPrice: "$0.4000/M", outputPrice: "$1.7500/M", free: false },
  { provider: "DeepSeek", initial: "D", color: "bg-purple-600", name: "DeepSeek V3.2", context: "163.8K", description: "A large language model harmonizing high computational efficiency with strong reasoning and agentic capabilities.", inputPrice: "$0.2500/M", outputPrice: "$0.3800/M", free: false },
  { provider: "DeepSeek", initial: "D", color: "bg-purple-600", name: "DeepSeek V3.1", context: "32.8K", description: "A large hybrid reasoning model (671B parameters, 37B active) that supports both thinking and non-thinking modes.", inputPrice: "$0.1500/M", outputPrice: "$0.7500/M", free: false },
  { provider: "DeepSeek", initial: "D", color: "bg-purple-600", name: "DeepSeek V3", context: "163.8K", description: "Building upon instruction following and coding abilities of the DeepSeek family with 685B MoE parameters.", inputPrice: "$0.3000/M", outputPrice: "$1.2000/M", free: false },
  { provider: "Meta", initial: "M", color: "bg-blue-500", name: "Llama 4 Maverick", context: "1.0M", description: "Meta's flagship open model with 400B MoE parameters delivering frontier-level performance.", inputPrice: "$0.2000/M", outputPrice: "$0.6000/M", free: false },
  { provider: "Meta", initial: "M", color: "bg-blue-500", name: "Llama 4 Scout", context: "512.0K", description: "A 109B parameter model with 17B active, designed for efficient and fast inference at scale.", inputPrice: "$0.1500/M", outputPrice: "$0.3000/M", free: true },
  { provider: "Meta", initial: "M", color: "bg-blue-500", name: "Llama 3.3 70B", context: "131.1K", description: "Meta's 70B parameter model delivering strong performance across reasoning, coding, and multilingual tasks.", inputPrice: "$0.1000/M", outputPrice: "$0.2500/M", free: true },
  { provider: "Meta", initial: "M", color: "bg-blue-500", name: "Llama 3.1 405B", context: "131.1K", description: "Meta's largest open model with 405B parameters, competitive with frontier closed-source models.", inputPrice: "$0.8000/M", outputPrice: "$0.8000/M", free: false },
  { provider: "xAI", initial: "x", color: "bg-zinc-700", name: "Grok 4", context: "256.0K", description: "xAI's most powerful model designed for deep reasoning, uncensored responses, and real-time information access.", inputPrice: "$10.0000/M", outputPrice: "$30.0000/M", free: false },
  { provider: "xAI", initial: "x", color: "bg-zinc-700", name: "Grok 3", context: "131.1K", description: "Strong reasoning model with broad capabilities across coding, math, and general knowledge tasks.", inputPrice: "$3.0000/M", outputPrice: "$15.0000/M", free: false },
  { provider: "xAI", initial: "x", color: "bg-zinc-700", name: "Grok 3 Mini", context: "131.1K", description: "Compact version of Grok 3 offering fast, efficient responses for everyday tasks at lower cost.", inputPrice: "$0.3000/M", outputPrice: "$0.5000/M", free: true },
  { provider: "Moonshot", initial: "K", color: "bg-cyan-600", name: "Kimi K2", context: "131.1K", description: "A powerful MoE architecture model from Moonshot with strong coding and reasoning capabilities.", inputPrice: "$0.6000/M", outputPrice: "$2.0000/M", free: false },
  { provider: "Alibaba", initial: "Q", color: "bg-indigo-600", name: "Qwen3 Max", context: "131.1K", description: "Alibaba's top open model with exceptional performance across multilingual, coding, and reasoning benchmarks.", inputPrice: "$0.4000/M", outputPrice: "$1.6000/M", free: false },
  { provider: "Alibaba", initial: "Q", color: "bg-indigo-600", name: "Qwen3 235B", context: "131.1K", description: "A large-scale 235B MoE model with 22B active parameters, optimized for complex reasoning tasks.", inputPrice: "$0.2000/M", outputPrice: "$0.8000/M", free: false },
  { provider: "Alibaba", initial: "Q", color: "bg-indigo-600", name: "Qwen3 30B", context: "131.1K", description: "Mid-size model balancing performance and efficiency for a wide range of language understanding tasks.", inputPrice: "$0.1500/M", outputPrice: "$0.5000/M", free: true },
  { provider: "Alibaba", initial: "Q", color: "bg-indigo-600", name: "Qwen QwQ 32B", context: "131.1K", description: "Specialized reasoning model with strong logical and mathematical problem-solving abilities.", inputPrice: "$0.2000/M", outputPrice: "$0.6000/M", free: true },
  { provider: "Cohere", initial: "C", color: "bg-rose-600", name: "Command A", context: "256.0K", description: "An open-weights 111B parameter model with 256K context focused on RAG, tool use, and enterprise applications.", inputPrice: "$2.5000/M", outputPrice: "$10.0000/M", free: false },
  { provider: "Cohere", initial: "C", color: "bg-rose-600", name: "Command R7B", context: "128.0K", description: "Small, fast model excelling at RAG, tool use, and multilingual tasks at very low cost.", inputPrice: "$0.0375/M", outputPrice: "$0.1500/M", free: true },
  { provider: "Amazon", initial: "A", color: "bg-amber-600", name: "Nova Premier 1.0", context: "1.0M", description: "Amazon's most capable multimodal model for complex reasoning and best-in-class agentic workflows.", inputPrice: "$2.5000/M", outputPrice: "$12.5000/M", free: false },
  { provider: "Amazon", initial: "A", color: "bg-amber-600", name: "Nova Pro 1.0", context: "300.0K", description: "Capable multimodal model focused on accuracy, speed, and cost-effectiveness for enterprise workloads.", inputPrice: "$0.8000/M", outputPrice: "$3.2000/M", free: false },
  { provider: "Amazon", initial: "A", color: "bg-amber-600", name: "Nova Lite 1.0", context: "300.0K", description: "Low-cost multimodal model focused on fast processing of image, video, and text content.", inputPrice: "$0.0600/M", outputPrice: "$0.2400/M", free: true },
  { provider: "Amazon", initial: "A", color: "bg-amber-600", name: "Nova Micro 1.0", context: "128.0K", description: "Text-only model delivering the lowest latency responses in the Amazon Nova family.", inputPrice: "$0.0350/M", outputPrice: "$0.1400/M", free: true },
  { provider: "ByteDance", initial: "B", color: "bg-sky-600", name: "Seed 1.6", context: "262.1K", description: "General-purpose multimodal model by ByteDance Seed team with adaptive reasoning capabilities.", inputPrice: "$0.2500/M", outputPrice: "$2.0000/M", free: false },
  { provider: "ByteDance", initial: "B", color: "bg-sky-600", name: "Seed 1.6 Flash", context: "262.1K", description: "Ultra-fast multimodal deep thinking model supporting both text and visual understanding.", inputPrice: "$0.0750/M", outputPrice: "$0.3000/M", free: true },
  { provider: "Baidu", initial: "B", color: "bg-red-600", name: "ERNIE 4.5 300B", context: "123.0K", description: "Baidu's 300B parameter MoE language model with 47B activated per token for high-quality generation.", inputPrice: "$0.2800/M", outputPrice: "$1.1000/M", free: false },
  { provider: "Baidu", initial: "B", color: "bg-red-600", name: "ERNIE 4.5 21B", context: "131.1K", description: "Lightweight MoE model featuring 21B total parameters with 3B activated per token for efficient inference.", inputPrice: "$0.0700/M", outputPrice: "$0.2800/M", free: true },
  { provider: "Mistral", initial: "M", color: "bg-orange-500", name: "Mistral Large", context: "256.0K", description: "Mistral's flagship model with strong reasoning, multilingual, and code generation capabilities.", inputPrice: "$2.0000/M", outputPrice: "$6.0000/M", free: false },
  { provider: "Mistral", initial: "M", color: "bg-orange-500", name: "Mistral Medium", context: "131.1K", description: "Balanced model offering strong performance with better cost efficiency than Mistral Large.", inputPrice: "$0.4000/M", outputPrice: "$1.5000/M", free: false },
  { provider: "Mistral", initial: "M", color: "bg-orange-500", name: "Mistral Small", context: "131.1K", description: "Compact and fast model ideal for simple tasks requiring quick turnaround at minimal cost.", inputPrice: "$0.1000/M", outputPrice: "$0.3000/M", free: true },
  { provider: "OpenRouter", initial: "O", color: "bg-gray-600", name: "Auto Router", context: "2.0M", description: "Your prompt is processed by a meta-model and routed to the best model for optimal results.", inputPrice: "Free", outputPrice: "Free", free: true },
];

const filterTabs = ["All", "Free", "OpenAI", "Anthropic", "Google", "Meta", "DeepSeek", "xAI", "Mistral"];

export default function Models() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredModels = useMemo(() => {
    if (activeFilter === "All") return allModels;
    if (activeFilter === "Free") return allModels.filter(m => m.free);
    return allModels.filter(m => m.provider === activeFilter);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-28 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">All Models</p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white text-center mb-4">
            Access <span className="text-primary">200+</span> AI Models
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            Browse all available AI models. Hold <span className="text-primary font-bold">$TORD</span> tokens to get free daily API credits for any model.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {filterTabs.map(tab => (
              <button
                key={tab}
                data-testid={`filter-${tab.toLowerCase()}`}
                onClick={() => setActiveFilter(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === tab
                    ? "bg-primary text-black"
                    : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-6">{filteredModels.length} models found</p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredModels.map((model, i) => (
              <div
                key={`${model.provider}-${model.name}-${i}`}
                data-testid={`model-card-${i}`}
                className="flex gap-4 p-5 rounded-xl border border-white/10 bg-black/30 hover:border-primary/30 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg ${model.color} flex items-center justify-center text-white font-bold text-lg shrink-0 mt-0.5`}>
                  {model.initial}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{model.provider}</p>
                      <p className="font-bold text-white text-sm">{model.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded shrink-0">{model.context}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{model.description}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="text-xs text-muted-foreground">Input <span className="text-white font-medium">{model.inputPrice}</span></span>
                    <span className="text-xs text-muted-foreground">Output <span className="text-white font-medium">{model.outputPrice}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
