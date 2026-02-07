import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/deep-research", async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "DeepSeek API key not configured" });
      }

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are a deep research assistant. When given a topic, provide comprehensive, well-structured research with key findings, analysis, and insights. Use markdown formatting with headers, bullet points, and bold text for clarity. Be thorough and factual."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 4096,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("DeepSeek API error:", errorData);
        return res.status(response.status).json({ error: "Failed to get response from AI" });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "No response generated.";
      res.json({ result: content });
    } catch (error) {
      console.error("Deep research error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "DeepSeek API key not configured" });
      }

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are Tord AI Agent, a helpful AI assistant for the Tord Labs DeFi platform. You help users with crypto analysis, DeFi strategies, token research, and general questions. Be concise, friendly, and knowledgeable about crypto and DeFi."
            },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 2048,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("DeepSeek API error:", errorData);
        return res.status(response.status).json({ error: "Failed to get response from AI" });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "No response generated.";
      res.json({ result: content });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/analyze-token", async (req: Request, res: Response) => {
    try {
      const { contractAddress } = req.body;
      if (!contractAddress || typeof contractAddress !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        return res.status(400).json({ error: "Valid BSC contract address is required" });
      }

      const deepseekKey = process.env.DEEPSEEK_API_KEY;
      if (!deepseekKey) {
        return res.status(500).json({ error: "DeepSeek API key not configured" });
      }

      const addr = contractAddress.toLowerCase();

      const [goplusRes, dexRes] = await Promise.all([
        fetch(`https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=${addr}`)
          .then(r => r.json()).catch(() => ({ result: {} })),
        fetch(`https://api.dexscreener.com/latest/dex/tokens/${addr}`)
          .then(r => r.json()).catch(() => ({ pairs: [] })),
      ]);

      const gp = (goplusRes as any)?.result?.[addr] || {};
      const pairs = (dexRes as any)?.pairs || [];
      const bscPairs = pairs.filter((p: any) => p.chainId === "bsc");
      const topPair = bscPairs[0] || pairs[0] || null;

      const security = {
        isHoneypot: gp.is_honeypot === "1",
        buyTax: gp.buy_tax || "0",
        sellTax: gp.sell_tax || "0",
        cannotBuy: gp.cannot_buy === "1",
        cannotSellAll: gp.cannot_sell_all === "1",
        isMintable: gp.is_mintable === "1",
        isProxy: gp.is_proxy === "1",
        isOpenSource: gp.is_open_source === "1",
        canTakeBackOwnership: gp.can_take_back_ownership === "1",
        ownerChangeBalance: gp.owner_change_balance === "1",
        hiddenOwner: gp.hidden_owner === "1",
        selfDestruct: gp.selfdestruct === "1",
        externalCall: gp.external_call === "1",
        isBlacklisted: gp.is_blacklisted === "1",
        isWhitelisted: gp.is_whitelisted === "1",
        antiWhale: gp.is_anti_whale === "1",
        tradingCooldown: gp.trading_cooldown === "1",
        transferPausable: gp.transfer_pausable === "1",
        holderCount: gp.holder_count || "0",
        totalSupply: gp.total_supply || "0",
        creatorAddress: gp.creator_address || "",
        creatorPercent: gp.creator_percent || "0",
        ownerAddress: gp.owner_address || "",
        ownerPercent: gp.owner_percent || "0",
        lpHolders: gp.lp_holders || [],
        dexInfo: gp.dex || [],
        tokenName: gp.token_name || "",
        tokenSymbol: gp.token_symbol || "",
      };

      const market = {
        priceUsd: topPair?.priceUsd || "N/A",
        volume24h: topPair?.volume?.h24 || 0,
        liquidity: topPair?.liquidity?.usd || 0,
        marketCap: topPair?.marketCap || 0,
        fdv: topPair?.fdv || 0,
        priceChange5m: topPair?.priceChange?.m5 || 0,
        priceChange1h: topPair?.priceChange?.h1 || 0,
        priceChange6h: topPair?.priceChange?.h6 || 0,
        priceChange24h: topPair?.priceChange?.h24 || 0,
        buys24h: topPair?.txns?.h24?.buys || 0,
        sells24h: topPair?.txns?.h24?.sells || 0,
        pairCount: bscPairs.length,
        dexName: topPair?.dexId || "N/A",
        pairCreatedAt: topPair?.pairCreatedAt ? new Date(topPair.pairCreatedAt).toISOString().split("T")[0] : "N/A",
        pairAddress: topPair?.pairAddress || "",
      };

      const tokenName = security.tokenName || topPair?.baseToken?.name || "Unknown";
      const tokenSymbol = security.tokenSymbol || topPair?.baseToken?.symbol || "Unknown";

      const totalLiquidity = security.dexInfo.reduce((sum: number, d: any) => sum + parseFloat(d.liquidity || "0"), 0);

      const topHolders = (gp.holders || []).slice(0, 10).map((h: any) => ({
        address: h.address,
        percent: h.percent,
        isContract: h.is_contract === 1,
        isLocked: h.is_locked === 1,
        tag: h.tag || "",
      }));

      const lpLocked = security.lpHolders.some((lp: any) => lp.is_locked === 1);
      const lpLockedPercent = security.lpHolders
        .filter((lp: any) => lp.is_locked === 1)
        .reduce((sum: number, lp: any) => sum + parseFloat(lp.percent || "0"), 0);

      const aiPrompt = `You are a blockchain security analyst. Analyze this BSC token using GoPlus security data and DexScreener market data.

TOKEN: ${tokenName} ($${tokenSymbol})
Contract: ${contractAddress}

SECURITY DATA (GoPlus):
- Honeypot: ${security.isHoneypot}
- Buy Tax: ${(parseFloat(security.buyTax) * 100).toFixed(1)}%
- Sell Tax: ${(parseFloat(security.sellTax) * 100).toFixed(1)}%
- Cannot Buy: ${security.cannotBuy}
- Cannot Sell All: ${security.cannotSellAll}
- Mintable: ${security.isMintable}
- Proxy/Upgradeable: ${security.isProxy}
- Open Source: ${security.isOpenSource}
- Can Take Back Ownership: ${security.canTakeBackOwnership}
- Owner Can Change Balance: ${security.ownerChangeBalance}
- Hidden Owner: ${security.hiddenOwner}
- Self Destruct: ${security.selfDestruct}
- External Call: ${security.externalCall}
- Blacklist Function: ${security.isBlacklisted}
- Whitelist Function: ${security.isWhitelisted}
- Anti-Whale: ${security.antiWhale}
- Trading Cooldown: ${security.tradingCooldown}
- Transfer Pausable: ${security.transferPausable}
- Holder Count: ${security.holderCount}
- Total Supply: ${security.totalSupply}
- Creator Owns: ${(parseFloat(security.creatorPercent) * 100).toFixed(2)}%
- Owner Owns: ${(parseFloat(security.ownerPercent) * 100).toFixed(2)}%
- LP Locked: ${lpLocked} (${(lpLockedPercent * 100).toFixed(1)}%)
- Total DEX Liquidity: $${totalLiquidity.toLocaleString()}

MARKET DATA (DexScreener):
- Price: $${market.priceUsd}
- 24h Volume: $${Number(market.volume24h).toLocaleString()}
- Liquidity: $${Number(market.liquidity).toLocaleString()}
- Market Cap: $${Number(market.marketCap).toLocaleString()}
- FDV: $${Number(market.fdv).toLocaleString()}
- 24h Change: ${market.priceChange24h}%
- 24h Buys/Sells: ${market.buys24h}/${market.sells24h}
- Pairs: ${market.pairCount}
- DEX: ${market.dexName}
- Pair Created: ${market.pairCreatedAt}

IMPORTANT FLAG THRESHOLDS - Do NOT flag these as red/negative if above threshold:
- Liquidity >= $5,000 is acceptable (only flag if BELOW $5k)
- Holder count >= 300 is acceptable (only flag if BELOW 300)
- Market cap >= $15,000 is acceptable (only flag if BELOW $15k)
- Pair created more than 3 days ago is acceptable (only flag if LESS than 3 days old)
If a metric meets or exceeds the threshold, do NOT include it in flags. You may mention it as a positive instead.

Respond ONLY with this exact JSON (no markdown, no code blocks):
{
  "overallScore": <0-100>,
  "sentimentScore": <0-100>,
  "technicalScore": <0-100>,
  "onChainScore": <0-100>,
  "riskLevel": "<Low|Medium|High|Critical>",
  "flags": ["<red flags - only include items that FAIL the thresholds above>"],
  "positives": ["<positive indicators>"],
  "summary": "<2-3 sentence security summary>",
  "recommendation": "<Buy|Hold|Caution|Avoid>"
}`;

      const aiResponse = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a blockchain security analyst. Respond only with valid JSON, no markdown, no code blocks." },
            { role: "user", content: aiPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1024,
          stream: false,
        }),
      });

      if (!aiResponse.ok) {
        console.error("DeepSeek error:", await aiResponse.text());
        return res.status(500).json({ error: "AI analysis failed" });
      }

      const aiData = await aiResponse.json() as any;
      let analysisText = aiData.choices?.[0]?.message?.content || "";
      analysisText = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch {
        analysis = {
          overallScore: 50, sentimentScore: 50, technicalScore: 50, onChainScore: 50,
          riskLevel: "Medium", flags: ["Could not parse AI analysis"], positives: [],
          summary: analysisText.slice(0, 300), recommendation: "Caution",
        };
      }

      res.json({
        token: {
          name: tokenName,
          symbol: tokenSymbol,
          totalSupply: security.totalSupply,
          holderCount: security.holderCount,
          priceUsd: market.priceUsd,
          volume24h: market.volume24h,
          liquidity: market.liquidity,
          marketCap: market.marketCap,
          fdv: market.fdv,
          priceChange5m: market.priceChange5m,
          priceChange1h: market.priceChange1h,
          priceChange6h: market.priceChange6h,
          priceChange24h: market.priceChange24h,
          buys24h: market.buys24h,
          sells24h: market.sells24h,
          pairCount: market.pairCount,
          dexName: market.dexName,
          pairCreatedAt: market.pairCreatedAt,
        },
        security: {
          isHoneypot: security.isHoneypot,
          buyTax: (parseFloat(security.buyTax) * 100).toFixed(1),
          sellTax: (parseFloat(security.sellTax) * 100).toFixed(1),
          isMintable: security.isMintable,
          isProxy: security.isProxy,
          isOpenSource: security.isOpenSource,
          canTakeBackOwnership: security.canTakeBackOwnership,
          ownerChangeBalance: security.ownerChangeBalance,
          hiddenOwner: security.hiddenOwner,
          selfDestruct: security.selfDestruct,
          externalCall: security.externalCall,
          isBlacklisted: security.isBlacklisted,
          transferPausable: security.transferPausable,
          antiWhale: security.antiWhale,
          cannotBuy: security.cannotBuy,
          cannotSellAll: security.cannotSellAll,
          lpLocked: lpLocked,
          lpLockedPercent: (lpLockedPercent * 100).toFixed(1),
          creatorPercent: (parseFloat(security.creatorPercent) * 100).toFixed(2),
          ownerPercent: (parseFloat(security.ownerPercent) * 100).toFixed(2),
        },
        holders: topHolders,
        analysis,
      });
    } catch (error) {
      console.error("Token analysis error:", error);
      res.status(500).json({ error: "Failed to analyze token" });
    }
  });

  const imageUsage: Map<string, { count: number; date: string }> = new Map();

  app.post("/api/generate-image", async (req: Request, res: Response) => {
    try {
      const { prompt, userId } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const userKey = userId || req.ip || "anonymous";
      const today = new Date().toISOString().split("T")[0];
      const usage = imageUsage.get(userKey);

      if (usage && usage.date === today && usage.count >= 2) {
        return res.status(429).json({ error: "Daily limit reached (2 images per day). Come back tomorrow!", remaining: 0 });
      }

      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenRouter API key not configured" });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://tordlabs.com",
          "X-Title": "Tord Labs Image Generator",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Generate an image: ${prompt}`
            }
          ],
          modalities: ["image", "text"],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("OpenRouter image error:", errorData);
        return res.status(response.status).json({ error: "Failed to generate image" });
      }

      const data = await response.json() as any;
      const message = data.choices?.[0]?.message;
      let imageUrl = null;

      if (message?.content) {
        if (typeof message.content === "string") {
          const match = message.content.match(/!\[.*?\]\((data:image\/[^)]+)\)/);
          if (match) {
            imageUrl = match[1];
          } else if (message.content.startsWith("data:image")) {
            imageUrl = message.content;
          }
        } else if (Array.isArray(message.content)) {
          for (const part of message.content) {
            if (part.type === "image_url" && part.image_url?.url) {
              imageUrl = part.image_url.url;
              break;
            }
            if (part.type === "image" && part.image?.url) {
              imageUrl = part.image.url;
              break;
            }
          }
        }
      }

      if (!imageUrl && message?.images && Array.isArray(message.images) && message.images.length > 0) {
        const img = message.images[0];
        if (typeof img === "string") {
          imageUrl = img.startsWith("data:") ? img : `data:image/png;base64,${img}`;
        } else if (img?.image_url?.url) {
          imageUrl = img.image_url.url;
        } else if (img?.url) {
          imageUrl = img.url;
        } else if (img?.b64_json || img?.data) {
          const b64 = img.b64_json || img.data;
          imageUrl = `data:image/png;base64,${b64}`;
        }
      }

      if (!imageUrl) {
        return res.status(500).json({ error: "No image was generated. Try a different prompt." });
      }

      if (usage && usage.date === today) {
        usage.count += 1;
      } else {
        imageUsage.set(userKey, { count: 1, date: today });
      }

      const currentUsage = imageUsage.get(userKey)!;
      res.json({ image: imageUrl, remaining: 2 - currentUsage.count });
    } catch (error) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/image-usage", (req: Request, res: Response) => {
    const userKey = (req.query.userId as string) || req.ip || "anonymous";
    const today = new Date().toISOString().split("T")[0];
    const usage = imageUsage.get(userKey);
    const count = (usage && usage.date === today) ? usage.count : 0;
    res.json({ used: count, remaining: 2 - count, limit: 2 });
  });

  app.post("/api/generate-api-key", (req: Request, res: Response) => {
    const { walletAddress } = req.body;
    if (!walletAddress || typeof walletAddress !== "string") {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    const hash = walletAddress.toLowerCase().replace("0x", "");
    const apiKey = `tord_${hash.slice(0, 8)}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    res.json({
      apiKey,
      dailyCredits: 15,
      note: "Hold $TORD tokens to maintain access. API key will be validated against token holdings."
    });
  });

  interface DeployedAgent {
    id: string;
    name: string;
    type: "token-monitor" | "market-analyst" | "content-writer" | "portfolio-tracker" | "custom";
    description: string;
    config: {
      systemPrompt: string;
      schedule: string;
      parameters: Record<string, string>;
    };
    status: "active" | "paused" | "error";
    createdAt: string;
    lastRun: string | null;
    totalRuns: number;
    logs: { timestamp: string; message: string; type: "info" | "success" | "error" }[];
  }

  const deployedAgents: Map<string, DeployedAgent> = new Map();

  app.get("/api/agents", (_req: Request, res: Response) => {
    const agents = Array.from(deployedAgents.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ agents });
  });

  app.post("/api/agents", (req: Request, res: Response) => {
    try {
      const { name, type, description, systemPrompt, schedule, parameters } = req.body;
      if (!name || !type) {
        return res.status(400).json({ error: "Agent name and type are required" });
      }

      const id = `agent_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const agent: DeployedAgent = {
        id,
        name,
        type: type || "custom",
        description: description || "",
        config: {
          systemPrompt: systemPrompt || getDefaultPrompt(type),
          schedule: schedule || "manual",
          parameters: parameters || {},
        },
        status: "active",
        createdAt: new Date().toISOString(),
        lastRun: null,
        totalRuns: 0,
        logs: [{ timestamp: new Date().toISOString(), message: "Agent created and deployed successfully", type: "success" }],
      };

      deployedAgents.set(id, agent);
      res.json({ agent });
    } catch (error) {
      console.error("Create agent error:", error);
      res.status(500).json({ error: "Failed to create agent" });
    }
  });

  app.post("/api/agents/:id/run", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { input } = req.body;
      const agent = deployedAgents.get(id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "DeepSeek API key not configured" });
      }

      agent.logs.push({ timestamp: new Date().toISOString(), message: `Task started: ${input || "default task"}`, type: "info" });

      const userMessage = buildAgentTaskMessage(agent, input);

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: agent.config.systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 4096,
          stream: false,
        }),
      });

      if (!response.ok) {
        agent.status = "error";
        agent.logs.push({ timestamp: new Date().toISOString(), message: "Task failed: AI service error", type: "error" });
        return res.status(500).json({ error: "AI service error" });
      }

      const data = await response.json() as any;
      const result = data.choices?.[0]?.message?.content || "No output generated.";

      agent.totalRuns += 1;
      agent.lastRun = new Date().toISOString();
      agent.status = "active";
      agent.logs.push({ timestamp: new Date().toISOString(), message: "Task completed successfully", type: "success" });

      res.json({ result, agent });
    } catch (error) {
      console.error("Agent run error:", error);
      res.status(500).json({ error: "Failed to run agent task" });
    }
  });

  app.patch("/api/agents/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const agent = deployedAgents.get(id);
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    const { status, name, description, systemPrompt } = req.body;
    if (status) agent.status = status;
    if (name) agent.name = name;
    if (description) agent.description = description;
    if (systemPrompt) agent.config.systemPrompt = systemPrompt;

    agent.logs.push({ timestamp: new Date().toISOString(), message: `Agent updated: ${Object.keys(req.body).join(", ")}`, type: "info" });
    res.json({ agent });
  });

  app.delete("/api/agents/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    if (!deployedAgents.has(id)) return res.status(404).json({ error: "Agent not found" });
    deployedAgents.delete(id);
    res.json({ success: true });
  });

  function getDefaultPrompt(type: string): string {
    switch (type) {
      case "token-monitor":
        return "You are a blockchain token monitoring agent. Analyze token data, detect significant price movements, whale transactions, and liquidity changes. Provide alerts with actionable insights. Format your output with clear sections: ALERT LEVEL, FINDINGS, and RECOMMENDED ACTIONS.";
      case "market-analyst":
        return "You are an expert crypto market analyst AI agent. Analyze market trends, technical indicators, and on-chain data. Provide comprehensive market reports with price predictions, support/resistance levels, and trading opportunities. Use data-driven analysis.";
      case "content-writer":
        return "You are an AI content creation agent for crypto/DeFi. Generate engaging social media posts, thread ideas, blog outlines, and marketing copy. Keep content informative, accurate, and engaging. Follow crypto community best practices.";
      case "portfolio-tracker":
        return "You are a portfolio management AI agent. Track token positions, calculate PnL, analyze portfolio diversification, and suggest rebalancing strategies. Provide clear summaries with performance metrics and risk assessments.";
      default:
        return "You are a versatile AI agent that can help with various tasks. Follow instructions carefully and provide detailed, actionable outputs.";
    }
  }

  function buildAgentTaskMessage(agent: DeployedAgent, input?: string): string {
    const params = Object.entries(agent.config.parameters)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    let message = input || "Execute your default task based on your configuration.";
    if (params) {
      message += `\n\nConfiguration Parameters:\n${params}`;
    }
    return message;
  }

  const toOkxInstId = (symbol: string) => {
    const base = symbol.replace("USDT", "");
    return `${base}-USDT-SWAP`;
  };

  app.get("/api/futures/ticker", async (req: Request, res: Response) => {
    try {
      const symbol = (req.query.symbol as string) || "BTCUSDT";
      const instId = toOkxInstId(symbol);
      const response = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${instId}`);
      const json = await response.json();
      if (json.code !== "0" || !json.data?.[0]) {
        return res.status(500).json({ error: "Failed to fetch ticker" });
      }
      const d = json.data[0];
      res.json({
        lastPrice: d.last,
        priceChangePercent: (((parseFloat(d.last) - parseFloat(d.open24h)) / parseFloat(d.open24h)) * 100).toFixed(2),
        highPrice: d.high24h,
        lowPrice: d.low24h,
        quoteVolume: (parseFloat(d.volCcy24h) * parseFloat(d.last)).toString(),
        volume: d.vol24h,
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch ticker data" });
    }
  });

  app.get("/api/futures/depth", async (req: Request, res: Response) => {
    try {
      const symbol = (req.query.symbol as string) || "BTCUSDT";
      const instId = toOkxInstId(symbol);
      const limit = (req.query.limit as string) || "20";
      const response = await fetch(`https://www.okx.com/api/v5/market/books?instId=${instId}&sz=${limit}`);
      const json = await response.json();
      if (json.code !== "0" || !json.data?.[0]) {
        return res.status(500).json({ error: "Failed to fetch depth" });
      }
      const d = json.data[0];
      res.json({
        asks: d.asks.map((a: string[]) => [a[0], a[1]]),
        bids: d.bids.map((b: string[]) => [b[0], b[1]]),
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch order book" });
    }
  });

  app.get("/api/futures/trades", async (req: Request, res: Response) => {
    try {
      const symbol = (req.query.symbol as string) || "BTCUSDT";
      const instId = toOkxInstId(symbol);
      const response = await fetch(`https://www.okx.com/api/v5/market/trades?instId=${instId}&limit=30`);
      const json = await response.json();
      if (json.code !== "0" || !json.data) {
        return res.status(500).json({ error: "Failed to fetch trades" });
      }
      res.json(json.data.map((t: any) => ({
        price: t.px,
        qty: t.sz,
        time: parseInt(t.ts),
        isBuyerMaker: t.side === "sell",
      })));
    } catch {
      res.status(500).json({ error: "Failed to fetch recent trades" });
    }
  });

  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "@Gooddev123";
  const SESSION_TTL = 24 * 60 * 60 * 1000;
  const adminSessions = new Map<string, number>();

  function generateSessionToken(): string {
    return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 16)}`;
  }

  function isValidSession(token: string): boolean {
    const expiry = adminSessions.get(token);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      adminSessions.delete(token);
      return false;
    }
    return true;
  }

  function requireAdmin(req: Request, res: Response, next: () => void) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    if (!isValidSession(token)) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    next();
  }

  const ALLOWED_SETTINGS_KEYS = new Set([
    "tord_contract", "staking_contract",
    "twitter_url", "telegram_url", "github_url", "discord_url", "website_url"
  ]);

  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = generateSessionToken();
      adminSessions.set(token, Date.now() + SESSION_TTL);
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      adminSessions.delete(authHeader.split(" ")[1]);
    }
    res.json({ success: true });
  });

  app.get("/api/admin/verify", (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ") && isValidSession(authHeader.split(" ")[1])) {
      res.json({ valid: true });
    } else {
      res.status(401).json({ valid: false });
    }
  });

  app.get("/api/admin/settings", (req: Request, res: Response, next: () => void) => {
    requireAdmin(req, res, async () => {
      try {
        const settings = await storage.getAllSettings();
        res.json({ settings });
      } catch (error) {
        console.error("Get settings error:", error);
        res.status(500).json({ error: "Failed to fetch settings" });
      }
    });
  });

  app.put("/api/admin/settings", (req: Request, res: Response, next: () => void) => {
    requireAdmin(req, res, async () => {
      try {
        const { settings } = req.body;
        if (!settings || typeof settings !== "object") {
          return res.status(400).json({ error: "Settings object is required" });
        }
        for (const [key, value] of Object.entries(settings)) {
          if (typeof value === "string" && ALLOWED_SETTINGS_KEYS.has(key)) {
            if ((key === "tord_contract" || key === "staking_contract") && value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
              return res.status(400).json({ error: `Invalid contract address format for ${key}` });
            }
            await storage.setSetting(key, value);
          }
        }
        const updated = await storage.getAllSettings();
        res.json({ settings: updated });
      } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({ error: "Failed to update settings" });
      }
    });
  });

  app.get("/api/settings/public", async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      const publicKeys = [
        "tord_contract", "staking_contract",
        "twitter_url", "telegram_url", "github_url", "discord_url", "website_url"
      ];
      const publicSettings: Record<string, string> = {};
      for (const key of publicKeys) {
        if (settings[key]) publicSettings[key] = settings[key];
      }
      res.json({ settings: publicSettings });
    } catch {
      res.json({ settings: {} });
    }
  });

  return httpServer;
}
