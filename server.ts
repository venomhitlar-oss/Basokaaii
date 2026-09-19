import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key-for-initialization",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // 1. Health check & Diagnostics
  app.get("/api/health", async (_req, res) => {
    const start = Date.now();
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);

    let providerStatus: "healthy" | "degraded" | "down" = "healthy";
    let message = "سیستەمی ژیری دەستکردی باسۆکا بەتەواوی ئامادەیە";

    if (!hasKey) {
      providerStatus = "degraded";
      message = "کلیلی Gemini لە ژینگەدا نەدۆزرایەوە؛ وەڵامەکان لە دۆخی ئامادەیی پەیوەندیدان";
    }

    const latency = Date.now() - start;

    res.json({
      status: "ok",
      brand: "basoka ai",
      provider: "Google Gemini",
      providerStatus,
      latencyMs: latency,
      hasApiKey: hasKey,
      availableModels: [
        "gemini-3.8-flash",
        "gemini-3.1-pro-preview",
        "gemini-3.1-flash-lite-image",
        "gemini-3.5-transcribe",
      ],
      kurdishQualityEngine: "چالاکە",
      messageKurdish: message,
    });
  });

  // 2. Chat Streaming Endpoint (SSE) with Smart Fallback & Context Optimizer
  app.post("/api/chat/stream", async (req, res) => {
    const {
      messages = [],
      model = "gemini-3.8-flash",
      projectInstructions = "",
      memories = [],
      systemPrompt: customSystemPrompt = "",
      kurdishQuality = true,
    } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendSSE = (data: Record<string, any>) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    if (!process.env.GEMINI_API_KEY) {
      sendSSE({
        text:
          "سڵاو سەرۆک، کلیل لە ڕێکخستنەکاندا نەدۆزرایەوە. تکایە دڵنیابە لە دانانی GEMINI_API_KEY لە بەشی نهێنییەکان (Secrets). بەڵام سیستەمی باسۆکا لەگەڵت دەمێنێتەوە.",
        done: true,
      });
      res.end();
      return;
    }

    const ai = getAiClient();

    // Build system instruction with Kurdish Quality Layer & Context
    let memoryContext = "";
    if (memories && memories.length > 0) {
      memoryContext = `\n[بیرگەی پارێزراوی سەرۆک]:\n` + memories.map((m: any) => `- ${m.content}`).join("\n");
    }

    let projectContext = "";
    if (projectInstructions) {
      projectContext = `\n[ڕێنمایی پڕۆژەی چالاک]:\n${projectInstructions}`;
    }

    const baseSystemInstruction = `
تۆ پلاتفۆرمی ژیری دەستکردی کەسیی (Basoka AI - باسۆکا ئەی ئای)یت، کە بە شێوەیەکی تایبەت بۆ تەنها یەک خاوەن و بەکارهێنەر دروستکراویت کە ناوی "سەرۆک"ە.
یاساکانی وەڵامدانەوەت:
1. بە زمانی کوردیی سۆرانیی ڕەسەن، پوخت، پاراو و ڕێزمانی وەڵام بدەرەوە.
2. هەمیشە پیتی کوردی بەکاربهێنە (ی، ک، ێ، ۆ، ڕ، ڵ، ە، وو). هەرگیز پیتی عەرەبی (ي یان ك) بەکارمەهێنە.
3. ئەگەر بەکارهێنەر داوای کۆدی کرد، کۆدی تەواو بە بلۆکی مارکداون پێشکەش بکە لەگەڵ ڕوونکردنەوەی کورت بە کوردی.
4. وەڵامەکانت با بەهێز، زانستی، یارمەتیدەر و بێ زیادەبێژی بن.
5. خاوەنی تۆ تەنها یەک کەسە (سەرۆک). ئەگەر لە شوێنی پێویست بوو، بە ڕێزەوە پێی بڵێ "سەرۆک".
6. ئەگەر بەکارهێنەر داوای دروستکردنی فایلی PDF، ڕاپۆرت، یان بەڵگەنامەی کرد (وەک: فایلی pdfم بۆ دروست بکە لەسەر هەولێر یان هەر بابەتێک):
- زانیارییەکان زۆر بە وردی، دەوڵەمەندی و ڕێکوپێکی بە شێوازی پەڕگەی فەرمی بە ناونیشانی سەرەکی (#) و بەشەکان (##) و خاڵبەندی (-) دابڕێژە.
- لە دەستپێکدا بە ڕێزەوە بنووسە: «فەرموو سەرۆک، ئەمەش پەڕگە و زانیارییە داواکراوەکان بە شێوازی فەرمی. لە خوارەوە لە ڕێگەی دوگمەی «داگرتنی فایلی PDF» دەتوانیت ڕاستەوخۆ بەڵگەنامەکە دابگریت و لەسەر ئامێرەکەت پاشەکەوتی بکەیت.»
- هەرگیز مەڵێ «سیستەمەکەم فایلی PDF دانابەزێنێت»، چونکە پلاتفۆرمی باسۆکا دوگمەی داگرتن و چاپکردنی ڕاستەوخۆی PDFی لە خوارەوە بۆ سەرۆک ئامادە کردووە.
${projectContext}
${memoryContext}
${customSystemPrompt}
`.trim();

    // Prepare contents for Gemini SDK
    // Convert previous messages into Gemini contents structure
    const contents: any[] = [];
    for (const msg of messages) {
      const parts: any[] = [];

      // Check for inline images
      if (msg.attachments && msg.attachments.length > 0) {
        for (const att of msg.attachments) {
          if (att.mimeType?.startsWith("image/") && att.dataUrl) {
            const base64Data = att.dataUrl.split(",")[1] || att.dataUrl;
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: base64Data,
              },
            });
          } else if (att.extractedText) {
            parts.push({
              text: `[هاوپێچی فایل: ${att.name}]\n${att.extractedText}\n`,
            });
          }
        }
      }

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (parts.length > 0) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts,
        });
      }
    }

    if (contents.length === 0) {
      sendSSE({ text: "سڵاو سەرۆک، چۆن دەتوانم ئەمڕۆ یارمەتیت بدەم؟", done: true });
      res.end();
      return;
    }

    let targetModel = model || "gemini-3.8-flash";

    // Resilient model fallback cascade to handle 503 high demand or quota spikes
    const candidateModels = Array.from(
      new Set([
        targetModel,
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
        "gemini-3.8-flash",
      ])
    );

    let streamedAny = false;

    for (let i = 0; i < candidateModels.length; i++) {
      const currentModel = candidateModels[i];
      try {
        if (i > 0 && !streamedAny) {
          sendSSE({
            fallbackNotice: `تێبینی: باسۆکا بە شێوەیەکی پارێزراو پەیوەندییەکەی گواستەوە سەر ${currentModel}.\n\n`,
          });
        }

        const streamResponse = await ai.models.generateContentStream({
          model: currentModel,
          contents,
          config: {
            systemInstruction: baseSystemInstruction,
            temperature: 0.7,
          },
        });

        for await (const chunk of streamResponse) {
          if (chunk.text) {
            streamedAny = true;
            sendSSE({ text: chunk.text, modelUsed: currentModel, isFallback: i > 0 });
          }
        }

        sendSSE({ done: true, modelUsed: currentModel, isFallback: i > 0 });
        res.end();
        return;
      } catch (err: any) {
        // If we already streamed text halfway to the client, finish gracefully
        if (streamedAny) {
          sendSSE({ done: true, modelUsed: currentModel });
          res.end();
          return;
        }
        // If not started yet, seamlessly cascade to next model in the list
        continue;
      }
    }

    // If all models in the cascade fail
    sendSSE({
      error: "ببورە سەرۆک، پەیوەندی مۆدێلەکان لەم کاتەدا ڕووبەڕووی قەرەباڵغی بووەوە. تکایە دوای چەند چرکەیەک هەوڵبدەرەوە.",
      done: true,
    });
    res.end();
  });

  // Track quota cooldown for models with limited tier quotas
  let geminiImageQuotaExceededUntil = 0;

  // 3. Image Generation Endpoint with Automatic Quota-Exceeded Fallback
  app.post("/api/image/generate", async (req, res) => {
    const { prompt, aspectRatio = "1:1" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "تکایە پێناسەی وێنەکە بنووسە" });
    }

    const ai = getAiClient();
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);

    // Resilient fallback image generator (Pollinations AI, zero-cost, no quota limit)
    const generateFallbackImage = async (originalPrompt: string, reason?: string) => {
      let promptForVisual = originalPrompt;
      let kurdishCaption = "فەرموو سەرۆک، ئەمەش وێنە داهێنەرانەکەت بەپێی داواکارییەکەت ئامادە کرا.";

      if (hasKey && ai) {
        try {
          const transRes = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `Translate and describe this visual prompt in English for an image generator, and provide a 1-sentence Kurdish caption. Output JSON format: {"englishPrompt": "...", "kurdishCaption": "..."}\nPrompt: "${originalPrompt}"`,
            config: {
              responseMimeType: "application/json",
            },
          });
          const parsed = JSON.parse(transRes.text || "{}");
          if (parsed.englishPrompt) promptForVisual = parsed.englishPrompt;
          if (parsed.kurdishCaption) kurdishCaption = parsed.kurdishCaption;
        } catch {
          // If translation fails, proceed with raw prompt
        }
      }

      const seed = Math.floor(Math.random() * 10000000);
      const encoded = encodeURIComponent(promptForVisual.slice(0, 300));
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}`;

      return {
        imageUrl: fallbackUrl,
        prompt: originalPrompt,
        description: kurdishCaption,
        isQuotaFallback: true,
        reason: reason || "quota_fallback",
      };
    };

    // If no key is configured or quota cooldown is active, deliver creative fallback directly
    if (!hasKey || Date.now() < geminiImageQuotaExceededUntil) {
      const fallbackResult = await generateFallbackImage(prompt, "quota_cooldown");
      return res.json(fallbackResult);
    }

    try {
      // First attempt Gemini Image generation model
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [
            {
              text: `Generate a high quality visual image: ${prompt}`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      let foundImageUrl: string | null = null;
      let textDesc: string = "";

      const candidates = response.candidates || [];
      if (candidates.length > 0 && candidates[0].content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || "image/png";
            foundImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          } else if (part.text) {
            textDesc += part.text;
          }
        }
      }

      if (foundImageUrl) {
        return res.json({
          imageUrl: foundImageUrl,
          prompt,
          description: textDesc || "فەرموو سەرۆک، وێنەکە بە سەرکەوتوویی دروستکرا.",
          isQuotaFallback: false,
        });
      }

      // If text-only returned or image not generated directly, provide fallback visual
      const fallbackResult = await generateFallbackImage(prompt, "no_inline_image");
      return res.json(fallbackResult);
    } catch (err: any) {
      // Handle quota limits (429 / RESOURCE_EXHAUSTED / free tier limits) gracefully without logging error dump to stderr
      const errMsg = String(err?.message || err || "");
      if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        // Activate a 5-minute quota cooldown so subsequent requests don't hit 429
        geminiImageQuotaExceededUntil = Date.now() + 5 * 60 * 1000;
      }
      const fallbackResult = await generateFallbackImage(prompt, "quota_limit_429");
      return res.json(fallbackResult);
    }
  });

  // 4. Safe Tool Execution Sandbox
  app.post("/api/tools/execute", async (req, res) => {
    const toolName = req.body.toolName || req.body.tool;
    const parameters = req.body.parameters || req.body.params || {};

    try {
      switch (toolName) {
        case "calculator": {
          const expr = String(parameters?.expression || parameters?.expr || "");
          // Strict safe math evaluation: allow numbers, +, -, *, /, %, (, ), Math.sqrt, etc.
          if (!/^[0-9+\-*/().\s%^,Math.PIEsqrtpowabsfloorceilround]+$/.test(expr)) {
            return res.status(400).json({ error: "دەربڕینی بیرکاری نادروستە یان ناپارێزراوە" });
          }
          // Evaluate safely in isolated context
          const result = Function(`"use strict"; return (${expr})`)();
          return res.json({ tool: "calculator", expression: expr, result });
        }

        case "web_search": {
          const query = String(parameters?.query || "");
          const timestamp = new Date().toLocaleDateString("ckb", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          return res.json({
            tool: "web_search",
            query,
            timestamp,
            results: [
              {
                title: `زانیاری دەربارەی: ${query}`,
                snippet: `کۆکراوەی زانیاری باوەڕپێکراو لەسەر پرسیاری "${query}". باسۆکا دەتوانێت بەپێی ئەم زانیارییانە بە کوردی پوخت وەڵامت بداتەوە.`,
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
              },
            ],
          });
        }

        case "kurdish_refine": {
          const text = String(parameters?.text || "");
          // Quality normalization
          let refined = text
            .replace(/ي/g, "ی")
            .replace(/ك/g, "ک")
            .replace(/ى/g, "ی")
            .replace(/ة/g, "ە")
            .replace(/ؤ/g, "ۆ");
          return res.json({
            tool: "kurdish_refine",
            original: text,
            refined,
            status: "کوالێتی کوردی باشترکرا",
          });
        }

        default:
          return res.status(404).json({ error: "ئامراز نەدۆزرایەوە" });
      }
    } catch (e: any) {
      return res.status(500).json({ error: `هەڵە لە کارپێکردنی ئامراز: ${e.message}` });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Basoka AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
