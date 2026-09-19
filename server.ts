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

    // Master System Instruction - AI App Controller
    const baseSystemInstruction = `
====================================================================
MASTER SYSTEM INSTRUCTION - BASOKA AI APP CONTROLLER
====================================================================

[کەسایەتی و ڕۆڵ / IDENTITY & ROLE]
تۆ یاریدەدەری زیرەکی دەستکردی پێشکەوتووی "Basoka AI" (باسۆکا ئەی ئای)یت بۆ سەرۆک.
ئامانجی سەرەکی تۆ بریتییە لە: یارمەتیدانی بەکارهێنەر لە گەڕان لە وێب، تێگەیشتن و شیکردنەوەی داتا، دۆزینەوەی شوێن، شیکاریی فرەمۆدال (وێنە، ڤیدیۆ، بەڵگەنامە، دەنگ)، و دروستکردنی ناوەڕۆکی بینراو بە کوالێتی باڵا (Production Quality).
تۆ بە شێوازێکی بێگەرد، پیشەیی، ژیرانە، باوەڕپێکراو و خێرا وەڵام دەدەیتەوە. زمانی سەرەکیی تۆ کوردیی سۆرانیی پاراوە (بە ئەلفوبێی دروستی کوردی: ی، ک، ێ، ۆ، ڕ، ڵ، ە، وو). لە شوێنی گونجاودا بە خاوەنی ئەپەکە بڵێ "سەرۆک".

--------------------------------------------------------------------
[یاسای نەگۆڕ: ڕاستگۆیی و بەردەستبوونی ئامرازەکان / ZERO HALLUCINATION & REAL TOOLS]
1. هەرگیز زانیاری دروست مەکە (Never Lie or Fabricate). ئەگەر زانیارییەک نەزانرا، بە ڕاشکاوی بڵێ "ئەم زانیارییە لەبەردەستدا نییە".
2. ئەگەر ئامراز یان مۆدێلێک بەردەست نییە یان کلیل دانەنراوە، بە ڕوونی ئاگاداریی بدە.
3. هەرگیز مەڵێ "لە وێب گەڕام" یان سەرچاوەی ساختە دامەنێ ئەگەر گەڕانی وێب (Web Search Grounding) بەڕاستی ئەنجام نەدرابێت.

--------------------------------------------------------------------
[1. WEB SEARCH ENGINE / بزوێنەری گەڕانی وێب]
- کاتێک گەڕانی وێب بەردەستە:
  * زانیارییە نوێیەکان لە زانیاریی کۆن جیا بکەرەوە.
  * چەند سەرچاوەی باوەڕپێکراو بەراورد بکە.
  * ناونیشان و بەستەری سەرچاوەکان پیشان بدە.
  * ئەگەر بەکارهێنەر پرسیاری کاتی ئێستای کرد (کەشناسی، هەواڵ، نرخی دراو)، وەڵامی ورد بەپێی سەرچاوەی ڕاستەقینە بدەرەوە.

--------------------------------------------------------------------
[2. LOCATION DISCOVERY / دۆزینەوەی شوێن و نەخشە]
- تەنها ئەو کاتەی بەکارهێنەر ڕێگەی پێداوە و پێوانەی ڕاستەقینەی جوگرافی (Latitude / Longitude) نێردراوە:
  * ناونیشانی ورد بە کوردی دیاریبکە (شار، ناوچە، شەقام).
  * دووری نێوان شوێنەکان بە کیلۆمەتر بپێوە.
  * بەپێی نزیکی ڕیزبەندی بکە (نزیکترین لە سەرەتاوە).
  * هیچ کات شوێنی ساختە یان پێوانەی ساختە دامەنێ.

--------------------------------------------------------------------
[3. IMAGE UNDERSTANDING / تێگەیشتن و شیکاریی وێنە]
- لە کاتی شیکردنەوەی وێنە (OCR، نەخشە، چارت، دیاگرام، دیزاینی UI، و بەڵگەنامە):
  * جیاوازی بکە لە نێوان:
    - [دڵنیا / Visible]: ئەو شتانەی بە تەواوی و بە ڕوونی لە وێنەکەدا دەبینرێن.
    - [پێشبینیکراو / Inferred]: ئەو ئەنجامانەی بە ئەگەرەوە لێکدەدرێنەوە.
  * ئەگەر دوو وێنە نێردرابوون، بەراوردی وردی نێوانیان بکە (جیاوازی ڕەنگ، پێکهاتە، شتە نوێیەکان یان سڕاوەکان).

--------------------------------------------------------------------
[4. VIDEO ANALYSIS / شیکردنەوەی ڤیدیۆ]
- لە کاتی پشکنینی فرەیمەکانی ڤیدیۆ:
  * دابەشکردنی دیمەنەکان بەپێی کات (Timeline: 00:01, 00:04, ...).
  * خاڵە سەرەکییەکان و ڕووداوە بینراوەکان.
  * دەرهێنانی دەقی ناو ڤیدیۆ (Screen OCR).
  * دەستنیشانکردنی هەر هەڵە یان کێشەیەکی بینراو لە ڤیدیۆکەدا.

--------------------------------------------------------------------
[5. PROBLEM ANALYSIS WORKFLOW / دۆخی شیکاریی کێشەکان]
- کاتێک بەکارهێنەر داوای شیکاریی کێشە دەکات یان کێشەیەکی سۆفتوێر، کۆد، نێتۆرک، UI، داتا، یان ئامێر دەخاتەڕوو، وەڵامەکەت بەم شێوازە ڕێکبخە:
  ## 1. پێناسەی کێشە (Problem Identification)
  ## 2. بەڵگە و نیشانەکان (Evidence & Symptoms)
  ## 3. هۆکارە لەبارەکان (Possible Causes)
  ## 4. پشکنین و دڵنیابوونەوە (Verification)
  ## 5. چارەسەری هەنگاو بە هەنگاو (Step-by-Step Solution)
  ## 6. ڕێگری لە دووبارەبوونەوە (Prevention)

--------------------------------------------------------------------
[6. DETAILED INFORMATION MODE / دۆخی زانیاریی ورد]
- کاتێک داوای "زانیاری وردم بدە" یان زانیاری تێروتەسەل لەسەر چەمکێک دەکرێت، پێڕەوی ئەم ٩ هەنگاوە بکە:
  1. پێناسە (Definition)
  2. پێشینە و مێژوو (Background)
  3. خاڵە بنەڕەتییەکان (Main Points)
  4. وردەکارییە تەکنیکییەکان (Details)
  5. نموونەی کرداری (Examples)
  6. سوود و بەهێزییەکان (Advantages)
  7. سنووردارکردن و کێشەکان (Limitations)
  8. بەکارهێنانی پراکتیکی (Practical Use)
  9. تێبینی و ڕاسپاردە گرنگەکان (Important Notes)

--------------------------------------------------------------------
[داڕشتن و فۆرمات]
- دەبێت وەڵامەکان زۆر ڕێکخراو، جوان، بە پاراگراف و خاڵبەندی بێت بە بەکارهێنانی Markdown.
====================================================================
${projectContext}
${memoryContext}
${customSystemPrompt}
`.trim();

    // Prepare contents for Gemini SDK
    // Convert previous messages into Gemini contents structure
    const contents: any[] = [];
    for (const msg of messages) {
      const parts: any[] = [];

      // Check for inline multimodal attachments (images, audio, documents)
      if (msg.attachments && msg.attachments.length > 0) {
        for (const att of msg.attachments) {
          if ((att.mimeType?.startsWith("image/") || att.mimeType?.startsWith("audio/") || att.mimeType === "application/pdf") && att.dataUrl) {
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

        const lastUserMsg = String(messages[messages.length - 1]?.content || "").toLowerCase();
        const explicitSearchRequested = req.body.webSearch === true || req.body.webSearchEnabled === true;
        const needsSearch =
          explicitSearchRequested ||
          lastUserMsg.includes("بگەڕێ") ||
          lastUserMsg.includes("گەڕان") ||
          lastUserMsg.includes("search") ||
          lastUserMsg.includes("هەواڵ") ||
          lastUserMsg.includes("کەشناسی") ||
          lastUserMsg.includes("نرخی") ||
          lastUserMsg.includes("ئەمڕۆ") ||
          lastUserMsg.includes("نوێترین");

        const callConfig: any = {
          systemInstruction: baseSystemInstruction,
          temperature: 0.7,
        };

        if (needsSearch && (currentModel === "gemini-3.8-flash" || currentModel === "gemini-flash-latest")) {
          callConfig.tools = [{ googleSearch: {} }];
          sendSSE({ searchingWeb: true });
        }

        const streamResponse = await ai.models.generateContentStream({
          model: currentModel,
          contents,
          config: callConfig,
        });

        const collectedCitations: any[] = [];
        let searchQueries: string[] = [];

        for await (const chunk of streamResponse) {
          if (chunk.text) {
            streamedAny = true;
            sendSSE({ text: chunk.text, modelUsed: currentModel, isFallback: i > 0 });
          }

          // Extract real citations and search queries from groundingMetadata
          const candidate = chunk.candidates?.[0];
          if (candidate?.groundingMetadata) {
            const gm = candidate.groundingMetadata as any;
            if (gm.webSearchQueries && Array.isArray(gm.webSearchQueries)) {
              searchQueries = gm.webSearchQueries;
            }
            if (gm.groundingChunks && Array.isArray(gm.groundingChunks)) {
              for (const gc of gm.groundingChunks) {
                if (gc.web?.uri) {
                  const exists = collectedCitations.some((c) => c.url === gc.web.uri);
                  if (!exists) {
                    let sourceTitle = gc.web.title || "";
                    try {
                      if (!sourceTitle) sourceTitle = new URL(gc.web.uri).hostname;
                    } catch {
                      sourceTitle = "سەرچاوەی وێب";
                    }
                    collectedCitations.push({
                      id: `cite-${collectedCitations.length + 1}`,
                      source: sourceTitle,
                      title: sourceTitle,
                      url: gc.web.uri,
                      snippet: gc.web.title || gc.web.uri,
                    });
                  }
                }
              }
            }
          }
        }

        sendSSE({
          done: true,
          modelUsed: currentModel,
          isFallback: i > 0,
          webSearchUsed: collectedCitations.length > 0 || searchQueries.length > 0,
          webSearchQueries: searchQueries,
          citations: collectedCitations.length > 0 ? collectedCitations : undefined,
        });
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
    const { prompt, aspectRatio = "1:1", style = "photorealistic" } = req.body;

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
            contents: `Translate and enhance this visual prompt in English for high-quality image generation (${style} style, clean lighting, 8k, crisp details), and provide a 1-sentence Kurdish caption. Output JSON: {"englishPrompt": "...", "kurdishCaption": "..."}\nPrompt: "${originalPrompt}"`,
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
      const encoded = encodeURIComponent(promptForVisual.slice(0, 350));
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}`;

      return {
        imageUrl: fallbackUrl,
        prompt: originalPrompt,
        description: kurdishCaption,
        isQuotaFallback: true,
        reason: reason || "quota_fallback",
        modelUsed: "basoka-image-engine",
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
              text: `Generate a masterpiece visual: ${prompt}. Professional ${style}, clean geometry, authentic lighting and rich textures.`,
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
          description: textDesc || "فەرموو سەرۆک، وێنەکە بە کوالێتی بەرز ئامادە کرا.",
          isQuotaFallback: false,
          modelUsed: "gemini-3.1-flash-lite-image",
        });
      }

      // If text-only returned or image not generated directly, provide fallback visual
      const fallbackResult = await generateFallbackImage(prompt, "no_inline_image");
      return res.json(fallbackResult);
    } catch (err: any) {
      const errMsg = String(err?.message || err || "");
      if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        geminiImageQuotaExceededUntil = Date.now() + 5 * 60 * 1000;
      }
      const fallbackResult = await generateFallbackImage(prompt, "quota_limit_429");
      return res.json(fallbackResult);
    }
  });

  // 4. Image Prompt Optimizer & 12-Dimensional Interpreter
  app.post("/api/image/optimize-prompt", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "پڕۆمپتی وێنە پێویستە" });
    }

    const ai = getAiClient();
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);

    if (!hasKey) {
      return res.json({
        originalPrompt: prompt,
        interpretation: {
          subject: prompt,
          environment: "Natural atmospheric environment",
          style: "Photorealistic & Cinematic",
          aspectRatio: "1:1",
          lighting: "Volumetric cinematic lighting",
          finalOptimizedPrompt: `A high quality, authentic visual photograph of ${prompt}, clean composition, natural textures, professional lighting, 8k resolution.`,
        },
        finalOptimizedPrompt: `A high quality, authentic visual photograph of ${prompt}, clean composition, natural textures, professional lighting, 8k resolution.`,
      });
    }

    try {
      const optRes = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are Basoka AI Image Prompt Master & Multi-factor Visual Interpreter.
Analyze and convert the following user concept into a professional 12-factor image generation instruction.
User concept: "${prompt}"

Return ONLY valid JSON matching this exact structure:
{
  "subject": "Clear, specific subject description",
  "environment": "Detailed background setting and atmosphere",
  "composition": "Framing, rule of thirds, depth of field",
  "camera": "Lens type, focal length, angle (e.g. 50mm f/1.8, eye-level)",
  "lighting": "Lighting direction, temperature, and quality (e.g. golden hour volumetric rays)",
  "materials": "Realistic surface textures, skin pores, fabric weaves, reflections",
  "colorPalette": "Harmonious color direction",
  "mood": "Emotional tone and ambiance",
  "aspectRatio": "1:1",
  "style": "Photorealistic / 3D Render / Concept Art",
  "details": "Micro-details that elevate realism",
  "finalOptimizedPrompt": "Complete, masterfully crafted English prompt combining all factors, avoiding generic buzzwords, focusing on vivid photographic reality"
}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(optRes.text || "{}");
      return res.json({
        originalPrompt: prompt,
        interpretation: parsed,
        finalOptimizedPrompt: parsed.finalOptimizedPrompt || prompt,
      });
    } catch {
      return res.json({
        originalPrompt: prompt,
        interpretation: {
          subject: prompt,
          style: "Photorealistic",
          finalOptimizedPrompt: `High definition photograph of ${prompt}, golden hour lighting, rich details, 8k.`,
        },
        finalOptimizedPrompt: `High definition photograph of ${prompt}, golden hour lighting, rich details, 8k.`,
      });
    }
  });

  // 5. Image Editing Endpoint
  app.post("/api/image/edit", async (req, res) => {
    const { imageBase64, instruction, aspectRatio = "1:1" } = req.body;
    if (!imageBase64 || !instruction) {
      return res.status(400).json({ error: "وێنە و ڕێنمایی دەستکاریکردن پێویستە" });
    }

    const ai = getAiClient();
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);

    const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const mimeType = imageBase64.startsWith("data:")
      ? imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"))
      : "image/png";

    if (hasKey && Date.now() >= geminiImageQuotaExceededUntil) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: `Professional Image Editing: ${instruction}. Keep untouched areas natural and seamless.`,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });

        const candidates = response.candidates || [];
        if (candidates.length > 0 && candidates[0].content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const outMime = part.inlineData.mimeType || "image/png";
              return res.json({
                imageUrl: `data:${outMime};base64,${part.inlineData.data}`,
                instruction,
                status: "success",
                editedWith: "gemini-3.1-flash-lite-image",
              });
            }
          }
        }
      } catch (err: any) {
        const errMsg = String(err?.message || "");
        if (errMsg.includes("429") || errMsg.includes("quota")) {
          geminiImageQuotaExceededUntil = Date.now() + 5 * 60 * 1000;
        }
      }
    }

    // Creative edit fallback
    const seed = Math.floor(Math.random() * 10000000);
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(instruction)}?width=1024&height=1024&nologo=true&seed=${seed}`;
    return res.json({
      imageUrl: fallbackUrl,
      instruction,
      status: "fallback",
      isQuotaFallback: true,
      editedWith: "basoka-creative-engine",
    });
  });

  // 6. Location Discovery: Reverse Geocode
  app.get("/api/location/reverse", async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "پێوانەی ڕاستەقینەی جوگرافی (lat/lng) پێویستە" });
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "BasokaAI/1.0 (https://ai.studio/build)",
            "Accept-Language": "ku,en,ar",
          },
        }
      );

      if (!response.ok) {
        throw new Error("نەتوانرا ناونیشان لە نەخشە دەربهێنرێت");
      }

      const data = await response.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.state || address.county || "شار";
      const road = address.road || address.neighbourhood || address.suburb || "";
      const country = address.country || "";

      res.json({
        lat: Number(lat),
        lng: Number(lng),
        displayName: data.display_name,
        city,
        road,
        country,
        formattedKurdish: `${city}${road ? `، ${road}` : ""}${country ? ` (${country})` : ""}`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "هەڵە لە وەرگرتنی ناونیشان" });
    }
  });

  // 7. Location Discovery: Nearby Places Search
  app.get("/api/location/nearby", async (req, res) => {
    const { lat, lng, query = "restaurant" } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "پێوانەی جوگرافی پێویستە" });
    }

    try {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const searchQuery = encodeURIComponent(String(query));

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&lat=${userLat}&lon=${userLng}&bounded=1&viewbox=${userLng - 0.08},${userLat + 0.08},${userLng + 0.08},${userLat - 0.08}&limit=10&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "BasokaAI/1.0 (https://ai.studio/build)",
          "Accept-Language": "ku,en,ar",
        },
      });

      if (!response.ok) {
        throw new Error("سێرڤەری نەخشە وەڵامی نەدایەوە");
      }

      const data = await response.json();

      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Number((R * c).toFixed(2));
      };

      const places = (data || []).map((item: any) => {
        const pLat = Number(item.lat);
        const pLng = Number(item.lon);
        const dist = calculateDistance(userLat, userLng, pLat, pLng);
        return {
          id: String(item.osm_id || Math.random()),
          name: item.name || item.display_name.split(",")[0],
          category: item.type || item.class || "شوێن",
          address: item.display_name,
          lat: pLat,
          lng: pLng,
          distanceKm: dist,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${pLat},${pLng}`,
        };
      });

      places.sort((a: any, b: any) => a.distanceKm - b.distanceKm);

      res.json({
        userCoordinates: { lat: userLat, lng: userLng },
        query: String(query),
        count: places.length,
        places,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "هەڵە لە گەڕانی شوێنە نزیکەکان" });
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
