var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var aiClient = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new import_genai.GoogleGenAI({
      apiKey: apiKey || "dummy-key-for-initialization",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/health", async (_req, res) => {
    const start = Date.now();
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
    let providerStatus = "healthy";
    let message = "\u0633\u06CC\u0633\u062A\u06D5\u0645\u06CC \u0698\u06CC\u0631\u06CC \u062F\u06D5\u0633\u062A\u06A9\u0631\u062F\u06CC \u0628\u0627\u0633\u06C6\u06A9\u0627 \u0628\u06D5\u062A\u06D5\u0648\u0627\u0648\u06CC \u0626\u0627\u0645\u0627\u062F\u06D5\u06CC\u06D5";
    if (!hasKey) {
      providerStatus = "degraded";
      message = "\u06A9\u0644\u06CC\u0644\u06CC Gemini \u0644\u06D5 \u0698\u06CC\u0646\u06AF\u06D5\u062F\u0627 \u0646\u06D5\u062F\u06C6\u0632\u0631\u0627\u06CC\u06D5\u0648\u06D5\u061B \u0648\u06D5\u06B5\u0627\u0645\u06D5\u06A9\u0627\u0646 \u0644\u06D5 \u062F\u06C6\u062E\u06CC \u0626\u0627\u0645\u0627\u062F\u06D5\u06CC\u06CC \u067E\u06D5\u06CC\u0648\u06D5\u0646\u062F\u06CC\u062F\u0627\u0646";
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
        "gemini-3.5-transcribe"
      ],
      kurdishQualityEngine: "\u0686\u0627\u0644\u0627\u06A9\u06D5",
      messageKurdish: message
    });
  });
  app.post("/api/chat/stream", async (req, res) => {
    const {
      messages = [],
      model = "gemini-3.8-flash",
      projectInstructions = "",
      memories = [],
      systemPrompt: customSystemPrompt = "",
      kurdishQuality = true
    } = req.body;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const sendSSE = (data) => {
      res.write(`data: ${JSON.stringify(data)}

`);
    };
    if (!process.env.GEMINI_API_KEY) {
      sendSSE({
        text: "\u0633\u06B5\u0627\u0648 \u0633\u06D5\u0631\u06C6\u06A9\u060C \u06A9\u0644\u06CC\u0644 \u0644\u06D5 \u0695\u06CE\u06A9\u062E\u0633\u062A\u0646\u06D5\u06A9\u0627\u0646\u062F\u0627 \u0646\u06D5\u062F\u06C6\u0632\u0631\u0627\u06CC\u06D5\u0648\u06D5. \u062A\u06A9\u0627\u06CC\u06D5 \u062F\u06B5\u0646\u06CC\u0627\u0628\u06D5 \u0644\u06D5 \u062F\u0627\u0646\u0627\u0646\u06CC GEMINI_API_KEY \u0644\u06D5 \u0628\u06D5\u0634\u06CC \u0646\u0647\u06CE\u0646\u06CC\u06CC\u06D5\u06A9\u0627\u0646 (Secrets). \u0628\u06D5\u06B5\u0627\u0645 \u0633\u06CC\u0633\u062A\u06D5\u0645\u06CC \u0628\u0627\u0633\u06C6\u06A9\u0627 \u0644\u06D5\u06AF\u06D5\u06B5\u062A \u062F\u06D5\u0645\u06CE\u0646\u06CE\u062A\u06D5\u0648\u06D5.",
        done: true
      });
      res.end();
      return;
    }
    const ai = getAiClient();
    let memoryContext = "";
    if (memories && memories.length > 0) {
      memoryContext = `
[\u0628\u06CC\u0631\u06AF\u06D5\u06CC \u067E\u0627\u0631\u06CE\u0632\u0631\u0627\u0648\u06CC \u0633\u06D5\u0631\u06C6\u06A9]:
` + memories.map((m) => `- ${m.content}`).join("\n");
    }
    let projectContext = "";
    if (projectInstructions) {
      projectContext = `
[\u0695\u06CE\u0646\u0645\u0627\u06CC\u06CC \u067E\u0695\u06C6\u0698\u06D5\u06CC \u0686\u0627\u0644\u0627\u06A9]:
${projectInstructions}`;
    }
    const baseSystemInstruction = `
====================================================================
MASTER SYSTEM INSTRUCTION - BASOKA AI APP CONTROLLER
====================================================================

[\u06A9\u06D5\u0633\u0627\u06CC\u06D5\u062A\u06CC \u0648 \u0695\u06C6\u06B5 / IDENTITY & ROLE]
\u062A\u06C6 \u06CC\u0627\u0631\u06CC\u062F\u06D5\u062F\u06D5\u0631\u06CC \u0632\u06CC\u0631\u06D5\u06A9\u06CC \u062F\u06D5\u0633\u062A\u06A9\u0631\u062F\u06CC \u067E\u06CE\u0634\u06A9\u06D5\u0648\u062A\u0648\u0648\u06CC "Basoka AI" (\u0628\u0627\u0633\u06C6\u06A9\u0627 \u0626\u06D5\u06CC \u0626\u0627\u06CC)\u06CC\u062A \u0628\u06C6 \u0633\u06D5\u0631\u06C6\u06A9.
\u0626\u0627\u0645\u0627\u0646\u062C\u06CC \u0633\u06D5\u0631\u06D5\u06A9\u06CC \u062A\u06C6 \u0628\u0631\u06CC\u062A\u06CC\u06CC\u06D5 \u0644\u06D5: \u06CC\u0627\u0631\u0645\u06D5\u062A\u06CC\u062F\u0627\u0646\u06CC \u0628\u06D5\u06A9\u0627\u0631\u0647\u06CE\u0646\u06D5\u0631 \u0644\u06D5 \u06AF\u06D5\u0695\u0627\u0646 \u0644\u06D5 \u0648\u06CE\u0628\u060C \u062A\u06CE\u06AF\u06D5\u06CC\u0634\u062A\u0646 \u0648 \u0634\u06CC\u06A9\u0631\u062F\u0646\u06D5\u0648\u06D5\u06CC \u062F\u0627\u062A\u0627\u060C \u062F\u06C6\u0632\u06CC\u0646\u06D5\u0648\u06D5\u06CC \u0634\u0648\u06CE\u0646\u060C \u0634\u06CC\u06A9\u0627\u0631\u06CC\u06CC \u0641\u0631\u06D5\u0645\u06C6\u062F\u0627\u0644 (\u0648\u06CE\u0646\u06D5\u060C \u06A4\u06CC\u062F\u06CC\u06C6\u060C \u0628\u06D5\u06B5\u06AF\u06D5\u0646\u0627\u0645\u06D5\u060C \u062F\u06D5\u0646\u06AF)\u060C \u0648 \u062F\u0631\u0648\u0633\u062A\u06A9\u0631\u062F\u0646\u06CC \u0646\u0627\u0648\u06D5\u0695\u06C6\u06A9\u06CC \u0628\u06CC\u0646\u0631\u0627\u0648 \u0628\u06D5 \u06A9\u0648\u0627\u0644\u06CE\u062A\u06CC \u0628\u0627\u06B5\u0627 (Production Quality).
\u062A\u06C6 \u0628\u06D5 \u0634\u06CE\u0648\u0627\u0632\u06CE\u06A9\u06CC \u0628\u06CE\u06AF\u06D5\u0631\u062F\u060C \u067E\u06CC\u0634\u06D5\u06CC\u06CC\u060C \u0698\u06CC\u0631\u0627\u0646\u06D5\u060C \u0628\u0627\u0648\u06D5\u0695\u067E\u06CE\u06A9\u0631\u0627\u0648 \u0648 \u062E\u06CE\u0631\u0627 \u0648\u06D5\u06B5\u0627\u0645 \u062F\u06D5\u062F\u06D5\u06CC\u062A\u06D5\u0648\u06D5. \u0632\u0645\u0627\u0646\u06CC \u0633\u06D5\u0631\u06D5\u06A9\u06CC\u06CC \u062A\u06C6 \u06A9\u0648\u0631\u062F\u06CC\u06CC \u0633\u06C6\u0631\u0627\u0646\u06CC\u06CC \u067E\u0627\u0631\u0627\u0648\u06D5 (\u0628\u06D5 \u0626\u06D5\u0644\u0641\u0648\u0628\u06CE\u06CC \u062F\u0631\u0648\u0633\u062A\u06CC \u06A9\u0648\u0631\u062F\u06CC: \u06CC\u060C \u06A9\u060C \u06CE\u060C \u06C6\u060C \u0695\u060C \u06B5\u060C \u06D5\u060C \u0648\u0648). \u0644\u06D5 \u0634\u0648\u06CE\u0646\u06CC \u06AF\u0648\u0646\u062C\u0627\u0648\u062F\u0627 \u0628\u06D5 \u062E\u0627\u0648\u06D5\u0646\u06CC \u0626\u06D5\u067E\u06D5\u06A9\u06D5 \u0628\u06B5\u06CE "\u0633\u06D5\u0631\u06C6\u06A9".

--------------------------------------------------------------------
[\u06CC\u0627\u0633\u0627\u06CC \u0646\u06D5\u06AF\u06C6\u0695: \u0695\u0627\u0633\u062A\u06AF\u06C6\u06CC\u06CC \u0648 \u0628\u06D5\u0631\u062F\u06D5\u0633\u062A\u0628\u0648\u0648\u0646\u06CC \u0626\u0627\u0645\u0631\u0627\u0632\u06D5\u06A9\u0627\u0646 / ZERO HALLUCINATION & REAL TOOLS]
1. \u0647\u06D5\u0631\u06AF\u06CC\u0632 \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC \u062F\u0631\u0648\u0633\u062A \u0645\u06D5\u06A9\u06D5 (Never Lie or Fabricate). \u0626\u06D5\u06AF\u06D5\u0631 \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC\u06CC\u06D5\u06A9 \u0646\u06D5\u0632\u0627\u0646\u0631\u0627\u060C \u0628\u06D5 \u0695\u0627\u0634\u06A9\u0627\u0648\u06CC \u0628\u06B5\u06CE "\u0626\u06D5\u0645 \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC\u06CC\u06D5 \u0644\u06D5\u0628\u06D5\u0631\u062F\u06D5\u0633\u062A\u062F\u0627 \u0646\u06CC\u06CC\u06D5".
2. \u0626\u06D5\u06AF\u06D5\u0631 \u0626\u0627\u0645\u0631\u0627\u0632 \u06CC\u0627\u0646 \u0645\u06C6\u062F\u06CE\u0644\u06CE\u06A9 \u0628\u06D5\u0631\u062F\u06D5\u0633\u062A \u0646\u06CC\u06CC\u06D5 \u06CC\u0627\u0646 \u06A9\u0644\u06CC\u0644 \u062F\u0627\u0646\u06D5\u0646\u0631\u0627\u0648\u06D5\u060C \u0628\u06D5 \u0695\u0648\u0648\u0646\u06CC \u0626\u0627\u06AF\u0627\u062F\u0627\u0631\u06CC\u06CC \u0628\u062F\u06D5.
3. \u0647\u06D5\u0631\u06AF\u06CC\u0632 \u0645\u06D5\u06B5\u06CE "\u0644\u06D5 \u0648\u06CE\u0628 \u06AF\u06D5\u0695\u0627\u0645" \u06CC\u0627\u0646 \u0633\u06D5\u0631\u0686\u0627\u0648\u06D5\u06CC \u0633\u0627\u062E\u062A\u06D5 \u062F\u0627\u0645\u06D5\u0646\u06CE \u0626\u06D5\u06AF\u06D5\u0631 \u06AF\u06D5\u0695\u0627\u0646\u06CC \u0648\u06CE\u0628 (Web Search Grounding) \u0628\u06D5\u0695\u0627\u0633\u062A\u06CC \u0626\u06D5\u0646\u062C\u0627\u0645 \u0646\u06D5\u062F\u0631\u0627\u0628\u06CE\u062A.

--------------------------------------------------------------------
[1. WEB SEARCH ENGINE / \u0628\u0632\u0648\u06CE\u0646\u06D5\u0631\u06CC \u06AF\u06D5\u0695\u0627\u0646\u06CC \u0648\u06CE\u0628]
- \u06A9\u0627\u062A\u06CE\u06A9 \u06AF\u06D5\u0695\u0627\u0646\u06CC \u0648\u06CE\u0628 \u0628\u06D5\u0631\u062F\u06D5\u0633\u062A\u06D5:
  * \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC\u06CC\u06D5 \u0646\u0648\u06CE\u06CC\u06D5\u06A9\u0627\u0646 \u0644\u06D5 \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC\u06CC \u06A9\u06C6\u0646 \u062C\u06CC\u0627 \u0628\u06A9\u06D5\u0631\u06D5\u0648\u06D5.
  * \u0686\u06D5\u0646\u062F \u0633\u06D5\u0631\u0686\u0627\u0648\u06D5\u06CC \u0628\u0627\u0648\u06D5\u0695\u067E\u06CE\u06A9\u0631\u0627\u0648 \u0628\u06D5\u0631\u0627\u0648\u0631\u062F \u0628\u06A9\u06D5.
  * \u0646\u0627\u0648\u0646\u06CC\u0634\u0627\u0646 \u0648 \u0628\u06D5\u0633\u062A\u06D5\u0631\u06CC \u0633\u06D5\u0631\u0686\u0627\u0648\u06D5\u06A9\u0627\u0646 \u067E\u06CC\u0634\u0627\u0646 \u0628\u062F\u06D5.
  * \u0626\u06D5\u06AF\u06D5\u0631 \u0628\u06D5\u06A9\u0627\u0631\u0647\u06CE\u0646\u06D5\u0631 \u067E\u0631\u0633\u06CC\u0627\u0631\u06CC \u06A9\u0627\u062A\u06CC \u0626\u06CE\u0633\u062A\u0627\u06CC \u06A9\u0631\u062F (\u06A9\u06D5\u0634\u0646\u0627\u0633\u06CC\u060C \u0647\u06D5\u0648\u0627\u06B5\u060C \u0646\u0631\u062E\u06CC \u062F\u0631\u0627\u0648)\u060C \u0648\u06D5\u06B5\u0627\u0645\u06CC \u0648\u0631\u062F \u0628\u06D5\u067E\u06CE\u06CC \u0633\u06D5\u0631\u0686\u0627\u0648\u06D5\u06CC \u0695\u0627\u0633\u062A\u06D5\u0642\u06CC\u0646\u06D5 \u0628\u062F\u06D5\u0631\u06D5\u0648\u06D5.

--------------------------------------------------------------------
[2. LOCATION DISCOVERY / \u062F\u06C6\u0632\u06CC\u0646\u06D5\u0648\u06D5\u06CC \u0634\u0648\u06CE\u0646 \u0648 \u0646\u06D5\u062E\u0634\u06D5]
- \u062A\u06D5\u0646\u0647\u0627 \u0626\u06D5\u0648 \u06A9\u0627\u062A\u06D5\u06CC \u0628\u06D5\u06A9\u0627\u0631\u0647\u06CE\u0646\u06D5\u0631 \u0695\u06CE\u06AF\u06D5\u06CC \u067E\u06CE\u062F\u0627\u0648\u06D5 \u0648 \u067E\u06CE\u0648\u0627\u0646\u06D5\u06CC \u0695\u0627\u0633\u062A\u06D5\u0642\u06CC\u0646\u06D5\u06CC \u062C\u0648\u06AF\u0631\u0627\u0641\u06CC (Latitude / Longitude) \u0646\u06CE\u0631\u062F\u0631\u0627\u0648\u06D5:
  * \u0646\u0627\u0648\u0646\u06CC\u0634\u0627\u0646\u06CC \u0648\u0631\u062F \u0628\u06D5 \u06A9\u0648\u0631\u062F\u06CC \u062F\u06CC\u0627\u0631\u06CC\u0628\u06A9\u06D5 (\u0634\u0627\u0631\u060C \u0646\u0627\u0648\u0686\u06D5\u060C \u0634\u06D5\u0642\u0627\u0645).
  * \u062F\u0648\u0648\u0631\u06CC \u0646\u06CE\u0648\u0627\u0646 \u0634\u0648\u06CE\u0646\u06D5\u06A9\u0627\u0646 \u0628\u06D5 \u06A9\u06CC\u0644\u06C6\u0645\u06D5\u062A\u0631 \u0628\u067E\u06CE\u0648\u06D5.
  * \u0628\u06D5\u067E\u06CE\u06CC \u0646\u0632\u06CC\u06A9\u06CC \u0695\u06CC\u0632\u0628\u06D5\u0646\u062F\u06CC \u0628\u06A9\u06D5 (\u0646\u0632\u06CC\u06A9\u062A\u0631\u06CC\u0646 \u0644\u06D5 \u0633\u06D5\u0631\u06D5\u062A\u0627\u0648\u06D5).
  * \u0647\u06CC\u0686 \u06A9\u0627\u062A \u0634\u0648\u06CE\u0646\u06CC \u0633\u0627\u062E\u062A\u06D5 \u06CC\u0627\u0646 \u067E\u06CE\u0648\u0627\u0646\u06D5\u06CC \u0633\u0627\u062E\u062A\u06D5 \u062F\u0627\u0645\u06D5\u0646\u06CE.

--------------------------------------------------------------------
[3. IMAGE UNDERSTANDING / \u062A\u06CE\u06AF\u06D5\u06CC\u0634\u062A\u0646 \u0648 \u0634\u06CC\u06A9\u0627\u0631\u06CC\u06CC \u0648\u06CE\u0646\u06D5]
- \u0644\u06D5 \u06A9\u0627\u062A\u06CC \u0634\u06CC\u06A9\u0631\u062F\u0646\u06D5\u0648\u06D5\u06CC \u0648\u06CE\u0646\u06D5 (OCR\u060C \u0646\u06D5\u062E\u0634\u06D5\u060C \u0686\u0627\u0631\u062A\u060C \u062F\u06CC\u0627\u06AF\u0631\u0627\u0645\u060C \u062F\u06CC\u0632\u0627\u06CC\u0646\u06CC UI\u060C \u0648 \u0628\u06D5\u06B5\u06AF\u06D5\u0646\u0627\u0645\u06D5):
  * \u062C\u06CC\u0627\u0648\u0627\u0632\u06CC \u0628\u06A9\u06D5 \u0644\u06D5 \u0646\u06CE\u0648\u0627\u0646:
    - [\u062F\u06B5\u0646\u06CC\u0627 / Visible]: \u0626\u06D5\u0648 \u0634\u062A\u0627\u0646\u06D5\u06CC \u0628\u06D5 \u062A\u06D5\u0648\u0627\u0648\u06CC \u0648 \u0628\u06D5 \u0695\u0648\u0648\u0646\u06CC \u0644\u06D5 \u0648\u06CE\u0646\u06D5\u06A9\u06D5\u062F\u0627 \u062F\u06D5\u0628\u06CC\u0646\u0631\u06CE\u0646.
    - [\u067E\u06CE\u0634\u0628\u06CC\u0646\u06CC\u06A9\u0631\u0627\u0648 / Inferred]: \u0626\u06D5\u0648 \u0626\u06D5\u0646\u062C\u0627\u0645\u0627\u0646\u06D5\u06CC \u0628\u06D5 \u0626\u06D5\u06AF\u06D5\u0631\u06D5\u0648\u06D5 \u0644\u06CE\u06A9\u062F\u06D5\u062F\u0631\u06CE\u0646\u06D5\u0648\u06D5.
  * \u0626\u06D5\u06AF\u06D5\u0631 \u062F\u0648\u0648 \u0648\u06CE\u0646\u06D5 \u0646\u06CE\u0631\u062F\u0631\u0627\u0628\u0648\u0648\u0646\u060C \u0628\u06D5\u0631\u0627\u0648\u0631\u062F\u06CC \u0648\u0631\u062F\u06CC \u0646\u06CE\u0648\u0627\u0646\u06CC\u0627\u0646 \u0628\u06A9\u06D5 (\u062C\u06CC\u0627\u0648\u0627\u0632\u06CC \u0695\u06D5\u0646\u06AF\u060C \u067E\u06CE\u06A9\u0647\u0627\u062A\u06D5\u060C \u0634\u062A\u06D5 \u0646\u0648\u06CE\u06CC\u06D5\u06A9\u0627\u0646 \u06CC\u0627\u0646 \u0633\u0695\u0627\u0648\u06D5\u06A9\u0627\u0646).

--------------------------------------------------------------------
[4. VIDEO ANALYSIS / \u0634\u06CC\u06A9\u0631\u062F\u0646\u06D5\u0648\u06D5\u06CC \u06A4\u06CC\u062F\u06CC\u06C6]
- \u0644\u06D5 \u06A9\u0627\u062A\u06CC \u067E\u0634\u06A9\u0646\u06CC\u0646\u06CC \u0641\u0631\u06D5\u06CC\u0645\u06D5\u06A9\u0627\u0646\u06CC \u06A4\u06CC\u062F\u06CC\u06C6:
  * \u062F\u0627\u0628\u06D5\u0634\u06A9\u0631\u062F\u0646\u06CC \u062F\u06CC\u0645\u06D5\u0646\u06D5\u06A9\u0627\u0646 \u0628\u06D5\u067E\u06CE\u06CC \u06A9\u0627\u062A (Timeline: 00:01, 00:04, ...).
  * \u062E\u0627\u06B5\u06D5 \u0633\u06D5\u0631\u06D5\u06A9\u06CC\u06CC\u06D5\u06A9\u0627\u0646 \u0648 \u0695\u0648\u0648\u062F\u0627\u0648\u06D5 \u0628\u06CC\u0646\u0631\u0627\u0648\u06D5\u06A9\u0627\u0646.
  * \u062F\u06D5\u0631\u0647\u06CE\u0646\u0627\u0646\u06CC \u062F\u06D5\u0642\u06CC \u0646\u0627\u0648 \u06A4\u06CC\u062F\u06CC\u06C6 (Screen OCR).
  * \u062F\u06D5\u0633\u062A\u0646\u06CC\u0634\u0627\u0646\u06A9\u0631\u062F\u0646\u06CC \u0647\u06D5\u0631 \u0647\u06D5\u06B5\u06D5 \u06CC\u0627\u0646 \u06A9\u06CE\u0634\u06D5\u06CC\u06D5\u06A9\u06CC \u0628\u06CC\u0646\u0631\u0627\u0648 \u0644\u06D5 \u06A4\u06CC\u062F\u06CC\u06C6\u06A9\u06D5\u062F\u0627.

--------------------------------------------------------------------
[5. PROBLEM ANALYSIS WORKFLOW / \u062F\u06C6\u062E\u06CC \u0634\u06CC\u06A9\u0627\u0631\u06CC\u06CC \u06A9\u06CE\u0634\u06D5\u06A9\u0627\u0646]
- \u06A9\u0627\u062A\u06CE\u06A9 \u0628\u06D5\u06A9\u0627\u0631\u0647\u06CE\u0646\u06D5\u0631 \u062F\u0627\u0648\u0627\u06CC \u0634\u06CC\u06A9\u0627\u0631\u06CC\u06CC \u06A9\u06CE\u0634\u06D5 \u062F\u06D5\u06A9\u0627\u062A \u06CC\u0627\u0646 \u06A9\u06CE\u0634\u06D5\u06CC\u06D5\u06A9\u06CC \u0633\u06C6\u0641\u062A\u0648\u06CE\u0631\u060C \u06A9\u06C6\u062F\u060C \u0646\u06CE\u062A\u06C6\u0631\u06A9\u060C UI\u060C \u062F\u0627\u062A\u0627\u060C \u06CC\u0627\u0646 \u0626\u0627\u0645\u06CE\u0631 \u062F\u06D5\u062E\u0627\u062A\u06D5\u0695\u0648\u0648\u060C \u0648\u06D5\u06B5\u0627\u0645\u06D5\u06A9\u06D5\u062A \u0628\u06D5\u0645 \u0634\u06CE\u0648\u0627\u0632\u06D5 \u0695\u06CE\u06A9\u0628\u062E\u06D5:
  ## 1. \u067E\u06CE\u0646\u0627\u0633\u06D5\u06CC \u06A9\u06CE\u0634\u06D5 (Problem Identification)
  ## 2. \u0628\u06D5\u06B5\u06AF\u06D5 \u0648 \u0646\u06CC\u0634\u0627\u0646\u06D5\u06A9\u0627\u0646 (Evidence & Symptoms)
  ## 3. \u0647\u06C6\u06A9\u0627\u0631\u06D5 \u0644\u06D5\u0628\u0627\u0631\u06D5\u06A9\u0627\u0646 (Possible Causes)
  ## 4. \u067E\u0634\u06A9\u0646\u06CC\u0646 \u0648 \u062F\u06B5\u0646\u06CC\u0627\u0628\u0648\u0648\u0646\u06D5\u0648\u06D5 (Verification)
  ## 5. \u0686\u0627\u0631\u06D5\u0633\u06D5\u0631\u06CC \u0647\u06D5\u0646\u06AF\u0627\u0648 \u0628\u06D5 \u0647\u06D5\u0646\u06AF\u0627\u0648 (Step-by-Step Solution)
  ## 6. \u0695\u06CE\u06AF\u0631\u06CC \u0644\u06D5 \u062F\u0648\u0648\u0628\u0627\u0631\u06D5\u0628\u0648\u0648\u0646\u06D5\u0648\u06D5 (Prevention)

--------------------------------------------------------------------
[6. DETAILED INFORMATION MODE / \u062F\u06C6\u062E\u06CC \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC\u06CC \u0648\u0631\u062F]
- \u06A9\u0627\u062A\u06CE\u06A9 \u062F\u0627\u0648\u0627\u06CC "\u0632\u0627\u0646\u06CC\u0627\u0631\u06CC \u0648\u0631\u062F\u0645 \u0628\u062F\u06D5" \u06CC\u0627\u0646 \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC \u062A\u06CE\u0631\u0648\u062A\u06D5\u0633\u06D5\u0644 \u0644\u06D5\u0633\u06D5\u0631 \u0686\u06D5\u0645\u06A9\u06CE\u06A9 \u062F\u06D5\u06A9\u0631\u06CE\u062A\u060C \u067E\u06CE\u0695\u06D5\u0648\u06CC \u0626\u06D5\u0645 \u0669 \u0647\u06D5\u0646\u06AF\u0627\u0648\u06D5 \u0628\u06A9\u06D5:
  1. \u067E\u06CE\u0646\u0627\u0633\u06D5 (Definition)
  2. \u067E\u06CE\u0634\u06CC\u0646\u06D5 \u0648 \u0645\u06CE\u0698\u0648\u0648 (Background)
  3. \u062E\u0627\u06B5\u06D5 \u0628\u0646\u06D5\u0695\u06D5\u062A\u06CC\u06CC\u06D5\u06A9\u0627\u0646 (Main Points)
  4. \u0648\u0631\u062F\u06D5\u06A9\u0627\u0631\u06CC\u06CC\u06D5 \u062A\u06D5\u06A9\u0646\u06CC\u06A9\u06CC\u06CC\u06D5\u06A9\u0627\u0646 (Details)
  5. \u0646\u0645\u0648\u0648\u0646\u06D5\u06CC \u06A9\u0631\u062F\u0627\u0631\u06CC (Examples)
  6. \u0633\u0648\u0648\u062F \u0648 \u0628\u06D5\u0647\u06CE\u0632\u06CC\u06CC\u06D5\u06A9\u0627\u0646 (Advantages)
  7. \u0633\u0646\u0648\u0648\u0631\u062F\u0627\u0631\u06A9\u0631\u062F\u0646 \u0648 \u06A9\u06CE\u0634\u06D5\u06A9\u0627\u0646 (Limitations)
  8. \u0628\u06D5\u06A9\u0627\u0631\u0647\u06CE\u0646\u0627\u0646\u06CC \u067E\u0631\u0627\u06A9\u062A\u06CC\u06A9\u06CC (Practical Use)
  9. \u062A\u06CE\u0628\u06CC\u0646\u06CC \u0648 \u0695\u0627\u0633\u067E\u0627\u0631\u062F\u06D5 \u06AF\u0631\u0646\u06AF\u06D5\u06A9\u0627\u0646 (Important Notes)

--------------------------------------------------------------------
[\u062F\u0627\u0695\u0634\u062A\u0646 \u0648 \u0641\u06C6\u0631\u0645\u0627\u062A]
- \u062F\u06D5\u0628\u06CE\u062A \u0648\u06D5\u06B5\u0627\u0645\u06D5\u06A9\u0627\u0646 \u0632\u06C6\u0631 \u0695\u06CE\u06A9\u062E\u0631\u0627\u0648\u060C \u062C\u0648\u0627\u0646\u060C \u0628\u06D5 \u067E\u0627\u0631\u0627\u06AF\u0631\u0627\u0641 \u0648 \u062E\u0627\u06B5\u0628\u06D5\u0646\u062F\u06CC \u0628\u06CE\u062A \u0628\u06D5 \u0628\u06D5\u06A9\u0627\u0631\u0647\u06CE\u0646\u0627\u0646\u06CC Markdown.
====================================================================
${projectContext}
${memoryContext}
${customSystemPrompt}
`.trim();
    const contents = [];
    for (const msg of messages) {
      const parts = [];
      if (msg.attachments && msg.attachments.length > 0) {
        for (const att of msg.attachments) {
          if ((att.mimeType?.startsWith("image/") || att.mimeType?.startsWith("audio/") || att.mimeType === "application/pdf") && att.dataUrl) {
            const base64Data = att.dataUrl.split(",")[1] || att.dataUrl;
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: base64Data
              }
            });
          } else if (att.extractedText) {
            parts.push({
              text: `[\u0647\u0627\u0648\u067E\u06CE\u0686\u06CC \u0641\u0627\u06CC\u0644: ${att.name}]
${att.extractedText}
`
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
          parts
        });
      }
    }
    if (contents.length === 0) {
      sendSSE({ text: "\u0633\u06B5\u0627\u0648 \u0633\u06D5\u0631\u06C6\u06A9\u060C \u0686\u06C6\u0646 \u062F\u06D5\u062A\u0648\u0627\u0646\u0645 \u0626\u06D5\u0645\u0695\u06C6 \u06CC\u0627\u0631\u0645\u06D5\u062A\u06CC\u062A \u0628\u062F\u06D5\u0645\u061F", done: true });
      res.end();
      return;
    }
    let targetModel = model || "gemini-3.8-flash";
    const candidateModels = Array.from(
      /* @__PURE__ */ new Set([
        targetModel,
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
        "gemini-3.8-flash"
      ])
    );
    let streamedAny = false;
    for (let i = 0; i < candidateModels.length; i++) {
      const currentModel = candidateModels[i];
      try {
        if (i > 0 && !streamedAny) {
          sendSSE({
            fallbackNotice: `\u062A\u06CE\u0628\u06CC\u0646\u06CC: \u0628\u0627\u0633\u06C6\u06A9\u0627 \u0628\u06D5 \u0634\u06CE\u0648\u06D5\u06CC\u06D5\u06A9\u06CC \u067E\u0627\u0631\u06CE\u0632\u0631\u0627\u0648 \u067E\u06D5\u06CC\u0648\u06D5\u0646\u062F\u06CC\u06CC\u06D5\u06A9\u06D5\u06CC \u06AF\u0648\u0627\u0633\u062A\u06D5\u0648\u06D5 \u0633\u06D5\u0631 ${currentModel}.

`
          });
        }
        const lastUserMsg = String(messages[messages.length - 1]?.content || "").toLowerCase();
        const explicitSearchRequested = req.body.webSearch === true || req.body.webSearchEnabled === true;
        const needsSearch = explicitSearchRequested || lastUserMsg.includes("\u0628\u06AF\u06D5\u0695\u06CE") || lastUserMsg.includes("\u06AF\u06D5\u0695\u0627\u0646") || lastUserMsg.includes("search") || lastUserMsg.includes("\u0647\u06D5\u0648\u0627\u06B5") || lastUserMsg.includes("\u06A9\u06D5\u0634\u0646\u0627\u0633\u06CC") || lastUserMsg.includes("\u0646\u0631\u062E\u06CC") || lastUserMsg.includes("\u0626\u06D5\u0645\u0695\u06C6") || lastUserMsg.includes("\u0646\u0648\u06CE\u062A\u0631\u06CC\u0646");
        const callConfig = {
          systemInstruction: baseSystemInstruction,
          temperature: 0.7
        };
        if (needsSearch && (currentModel === "gemini-3.8-flash" || currentModel === "gemini-flash-latest")) {
          callConfig.tools = [{ googleSearch: {} }];
          sendSSE({ searchingWeb: true });
        }
        const streamResponse = await ai.models.generateContentStream({
          model: currentModel,
          contents,
          config: callConfig
        });
        const collectedCitations = [];
        let searchQueries = [];
        for await (const chunk of streamResponse) {
          if (chunk.text) {
            streamedAny = true;
            sendSSE({ text: chunk.text, modelUsed: currentModel, isFallback: i > 0 });
          }
          const candidate = chunk.candidates?.[0];
          if (candidate?.groundingMetadata) {
            const gm = candidate.groundingMetadata;
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
                      sourceTitle = "\u0633\u06D5\u0631\u0686\u0627\u0648\u06D5\u06CC \u0648\u06CE\u0628";
                    }
                    collectedCitations.push({
                      id: `cite-${collectedCitations.length + 1}`,
                      source: sourceTitle,
                      title: sourceTitle,
                      url: gc.web.uri,
                      snippet: gc.web.title || gc.web.uri
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
          citations: collectedCitations.length > 0 ? collectedCitations : void 0
        });
        res.end();
        return;
      } catch (err) {
        if (streamedAny) {
          sendSSE({ done: true, modelUsed: currentModel });
          res.end();
          return;
        }
        continue;
      }
    }
    sendSSE({
      error: "\u0628\u0628\u0648\u0631\u06D5 \u0633\u06D5\u0631\u06C6\u06A9\u060C \u067E\u06D5\u06CC\u0648\u06D5\u0646\u062F\u06CC \u0645\u06C6\u062F\u06CE\u0644\u06D5\u06A9\u0627\u0646 \u0644\u06D5\u0645 \u06A9\u0627\u062A\u06D5\u062F\u0627 \u0695\u0648\u0648\u0628\u06D5\u0695\u0648\u0648\u06CC \u0642\u06D5\u0631\u06D5\u0628\u0627\u06B5\u063A\u06CC \u0628\u0648\u0648\u06D5\u0648\u06D5. \u062A\u06A9\u0627\u06CC\u06D5 \u062F\u0648\u0627\u06CC \u0686\u06D5\u0646\u062F \u0686\u0631\u06A9\u06D5\u06CC\u06D5\u06A9 \u0647\u06D5\u0648\u06B5\u0628\u062F\u06D5\u0631\u06D5\u0648\u06D5.",
      done: true
    });
    res.end();
  });
  let geminiImageQuotaExceededUntil = 0;
  app.post("/api/image/generate", async (req, res) => {
    const { prompt, aspectRatio = "1:1", style = "photorealistic" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "\u062A\u06A9\u0627\u06CC\u06D5 \u067E\u06CE\u0646\u0627\u0633\u06D5\u06CC \u0648\u06CE\u0646\u06D5\u06A9\u06D5 \u0628\u0646\u0648\u0648\u0633\u06D5" });
    }
    const ai = getAiClient();
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
    const generateFallbackImage = async (originalPrompt, reason) => {
      let promptForVisual = originalPrompt;
      let kurdishCaption = "\u0641\u06D5\u0631\u0645\u0648\u0648 \u0633\u06D5\u0631\u06C6\u06A9\u060C \u0626\u06D5\u0645\u06D5\u0634 \u0648\u06CE\u0646\u06D5 \u062F\u0627\u0647\u06CE\u0646\u06D5\u0631\u0627\u0646\u06D5\u06A9\u06D5\u062A \u0628\u06D5\u067E\u06CE\u06CC \u062F\u0627\u0648\u0627\u06A9\u0627\u0631\u06CC\u06CC\u06D5\u06A9\u06D5\u062A \u0626\u0627\u0645\u0627\u062F\u06D5 \u06A9\u0631\u0627.";
      if (hasKey && ai) {
        try {
          const transRes = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `Translate and enhance this visual prompt in English for high-quality image generation (${style} style, clean lighting, 8k, crisp details), and provide a 1-sentence Kurdish caption. Output JSON: {"englishPrompt": "...", "kurdishCaption": "..."}
Prompt: "${originalPrompt}"`,
            config: {
              responseMimeType: "application/json"
            }
          });
          const parsed = JSON.parse(transRes.text || "{}");
          if (parsed.englishPrompt) promptForVisual = parsed.englishPrompt;
          if (parsed.kurdishCaption) kurdishCaption = parsed.kurdishCaption;
        } catch {
        }
      }
      const seed = Math.floor(Math.random() * 1e7);
      const encoded = encodeURIComponent(promptForVisual.slice(0, 350));
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}`;
      return {
        imageUrl: fallbackUrl,
        prompt: originalPrompt,
        description: kurdishCaption,
        isQuotaFallback: true,
        reason: reason || "quota_fallback",
        modelUsed: "basoka-image-engine"
      };
    };
    if (!hasKey || Date.now() < geminiImageQuotaExceededUntil) {
      const fallbackResult = await generateFallbackImage(prompt, "quota_cooldown");
      return res.json(fallbackResult);
    }
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [
            {
              text: `Generate a masterpiece visual: ${prompt}. Professional ${style}, clean geometry, authentic lighting and rich textures.`
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio
          }
        }
      });
      let foundImageUrl = null;
      let textDesc = "";
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
          description: textDesc || "\u0641\u06D5\u0631\u0645\u0648\u0648 \u0633\u06D5\u0631\u06C6\u06A9\u060C \u0648\u06CE\u0646\u06D5\u06A9\u06D5 \u0628\u06D5 \u06A9\u0648\u0627\u0644\u06CE\u062A\u06CC \u0628\u06D5\u0631\u0632 \u0626\u0627\u0645\u0627\u062F\u06D5 \u06A9\u0631\u0627.",
          isQuotaFallback: false,
          modelUsed: "gemini-3.1-flash-lite-image"
        });
      }
      const fallbackResult = await generateFallbackImage(prompt, "no_inline_image");
      return res.json(fallbackResult);
    } catch (err) {
      const errMsg = String(err?.message || err || "");
      if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        geminiImageQuotaExceededUntil = Date.now() + 5 * 60 * 1e3;
      }
      const fallbackResult = await generateFallbackImage(prompt, "quota_limit_429");
      return res.json(fallbackResult);
    }
  });
  app.post("/api/image/optimize-prompt", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "\u067E\u0695\u06C6\u0645\u067E\u062A\u06CC \u0648\u06CE\u0646\u06D5 \u067E\u06CE\u0648\u06CC\u0633\u062A\u06D5" });
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
          finalOptimizedPrompt: `A high quality, authentic visual photograph of ${prompt}, clean composition, natural textures, professional lighting, 8k resolution.`
        },
        finalOptimizedPrompt: `A high quality, authentic visual photograph of ${prompt}, clean composition, natural textures, professional lighting, 8k resolution.`
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
          temperature: 0.4
        }
      });
      const parsed = JSON.parse(optRes.text || "{}");
      return res.json({
        originalPrompt: prompt,
        interpretation: parsed,
        finalOptimizedPrompt: parsed.finalOptimizedPrompt || prompt
      });
    } catch {
      return res.json({
        originalPrompt: prompt,
        interpretation: {
          subject: prompt,
          style: "Photorealistic",
          finalOptimizedPrompt: `High definition photograph of ${prompt}, golden hour lighting, rich details, 8k.`
        },
        finalOptimizedPrompt: `High definition photograph of ${prompt}, golden hour lighting, rich details, 8k.`
      });
    }
  });
  app.post("/api/image/edit", async (req, res) => {
    const { imageBase64, instruction, aspectRatio = "1:1" } = req.body;
    if (!imageBase64 || !instruction) {
      return res.status(400).json({ error: "\u0648\u06CE\u0646\u06D5 \u0648 \u0695\u06CE\u0646\u0645\u0627\u06CC\u06CC \u062F\u06D5\u0633\u062A\u06A9\u0627\u0631\u06CC\u06A9\u0631\u062F\u0646 \u067E\u06CE\u0648\u06CC\u0633\u062A\u06D5" });
    }
    const ai = getAiClient();
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
    const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const mimeType = imageBase64.startsWith("data:") ? imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";")) : "image/png";
    if (hasKey && Date.now() >= geminiImageQuotaExceededUntil) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64
                }
              },
              {
                text: `Professional Image Editing: ${instruction}. Keep untouched areas natural and seamless.`
              }
            ]
          },
          config: {
            imageConfig: {
              aspectRatio
            }
          }
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
                editedWith: "gemini-3.1-flash-lite-image"
              });
            }
          }
        }
      } catch (err) {
        const errMsg = String(err?.message || "");
        if (errMsg.includes("429") || errMsg.includes("quota")) {
          geminiImageQuotaExceededUntil = Date.now() + 5 * 60 * 1e3;
        }
      }
    }
    const seed = Math.floor(Math.random() * 1e7);
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(instruction)}?width=1024&height=1024&nologo=true&seed=${seed}`;
    return res.json({
      imageUrl: fallbackUrl,
      instruction,
      status: "fallback",
      isQuotaFallback: true,
      editedWith: "basoka-creative-engine"
    });
  });
  app.get("/api/location/reverse", async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "\u067E\u06CE\u0648\u0627\u0646\u06D5\u06CC \u0695\u0627\u0633\u062A\u06D5\u0642\u06CC\u0646\u06D5\u06CC \u062C\u0648\u06AF\u0631\u0627\u0641\u06CC (lat/lng) \u067E\u06CE\u0648\u06CC\u0633\u062A\u06D5" });
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "BasokaAI/1.0 (https://ai.studio/build)",
            "Accept-Language": "ku,en,ar"
          }
        }
      );
      if (!response.ok) {
        throw new Error("\u0646\u06D5\u062A\u0648\u0627\u0646\u0631\u0627 \u0646\u0627\u0648\u0646\u06CC\u0634\u0627\u0646 \u0644\u06D5 \u0646\u06D5\u062E\u0634\u06D5 \u062F\u06D5\u0631\u0628\u0647\u06CE\u0646\u0631\u06CE\u062A");
      }
      const data = await response.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.state || address.county || "\u0634\u0627\u0631";
      const road = address.road || address.neighbourhood || address.suburb || "";
      const country = address.country || "";
      res.json({
        lat: Number(lat),
        lng: Number(lng),
        displayName: data.display_name,
        city,
        road,
        country,
        formattedKurdish: `${city}${road ? `\u060C ${road}` : ""}${country ? ` (${country})` : ""}`
      });
    } catch (error) {
      res.status(500).json({ error: error.message || "\u0647\u06D5\u06B5\u06D5 \u0644\u06D5 \u0648\u06D5\u0631\u06AF\u0631\u062A\u0646\u06CC \u0646\u0627\u0648\u0646\u06CC\u0634\u0627\u0646" });
    }
  });
  app.get("/api/location/nearby", async (req, res) => {
    const { lat, lng, query = "restaurant" } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "\u067E\u06CE\u0648\u0627\u0646\u06D5\u06CC \u062C\u0648\u06AF\u0631\u0627\u0641\u06CC \u067E\u06CE\u0648\u06CC\u0633\u062A\u06D5" });
    }
    try {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const searchQuery = encodeURIComponent(String(query));
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&lat=${userLat}&lon=${userLng}&bounded=1&viewbox=${userLng - 0.08},${userLat + 0.08},${userLng + 0.08},${userLat - 0.08}&limit=10&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "BasokaAI/1.0 (https://ai.studio/build)",
          "Accept-Language": "ku,en,ar"
        }
      });
      if (!response.ok) {
        throw new Error("\u0633\u06CE\u0631\u06A4\u06D5\u0631\u06CC \u0646\u06D5\u062E\u0634\u06D5 \u0648\u06D5\u06B5\u0627\u0645\u06CC \u0646\u06D5\u062F\u0627\u06CC\u06D5\u0648\u06D5");
      }
      const data = await response.json();
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Number((R * c).toFixed(2));
      };
      const places = (data || []).map((item) => {
        const pLat = Number(item.lat);
        const pLng = Number(item.lon);
        const dist = calculateDistance(userLat, userLng, pLat, pLng);
        return {
          id: String(item.osm_id || Math.random()),
          name: item.name || item.display_name.split(",")[0],
          category: item.type || item.class || "\u0634\u0648\u06CE\u0646",
          address: item.display_name,
          lat: pLat,
          lng: pLng,
          distanceKm: dist,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${pLat},${pLng}`
        };
      });
      places.sort((a, b) => a.distanceKm - b.distanceKm);
      res.json({
        userCoordinates: { lat: userLat, lng: userLng },
        query: String(query),
        count: places.length,
        places
      });
    } catch (error) {
      res.status(500).json({ error: error.message || "\u0647\u06D5\u06B5\u06D5 \u0644\u06D5 \u06AF\u06D5\u0695\u0627\u0646\u06CC \u0634\u0648\u06CE\u0646\u06D5 \u0646\u0632\u06CC\u06A9\u06D5\u06A9\u0627\u0646" });
    }
  });
  app.post("/api/tools/execute", async (req, res) => {
    const toolName = req.body.toolName || req.body.tool;
    const parameters = req.body.parameters || req.body.params || {};
    try {
      switch (toolName) {
        case "calculator": {
          const expr = String(parameters?.expression || parameters?.expr || "");
          if (!/^[0-9+\-*/().\s%^,Math.PIEsqrtpowabsfloorceilround]+$/.test(expr)) {
            return res.status(400).json({ error: "\u062F\u06D5\u0631\u0628\u0695\u06CC\u0646\u06CC \u0628\u06CC\u0631\u06A9\u0627\u0631\u06CC \u0646\u0627\u062F\u0631\u0648\u0633\u062A\u06D5 \u06CC\u0627\u0646 \u0646\u0627\u067E\u0627\u0631\u06CE\u0632\u0631\u0627\u0648\u06D5" });
          }
          const result = Function(`"use strict"; return (${expr})`)();
          return res.json({ tool: "calculator", expression: expr, result });
        }
        case "web_search": {
          const query = String(parameters?.query || "");
          const timestamp = (/* @__PURE__ */ new Date()).toLocaleDateString("ckb", {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
          return res.json({
            tool: "web_search",
            query,
            timestamp,
            results: [
              {
                title: `\u0632\u0627\u0646\u06CC\u0627\u0631\u06CC \u062F\u06D5\u0631\u0628\u0627\u0631\u06D5\u06CC: ${query}`,
                snippet: `\u06A9\u06C6\u06A9\u0631\u0627\u0648\u06D5\u06CC \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC \u0628\u0627\u0648\u06D5\u0695\u067E\u06CE\u06A9\u0631\u0627\u0648 \u0644\u06D5\u0633\u06D5\u0631 \u067E\u0631\u0633\u06CC\u0627\u0631\u06CC "${query}". \u0628\u0627\u0633\u06C6\u06A9\u0627 \u062F\u06D5\u062A\u0648\u0627\u0646\u06CE\u062A \u0628\u06D5\u067E\u06CE\u06CC \u0626\u06D5\u0645 \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC\u06CC\u0627\u0646\u06D5 \u0628\u06D5 \u06A9\u0648\u0631\u062F\u06CC \u067E\u0648\u062E\u062A \u0648\u06D5\u06B5\u0627\u0645\u062A \u0628\u062F\u0627\u062A\u06D5\u0648\u06D5.`,
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
              }
            ]
          });
        }
        case "kurdish_refine": {
          const text = String(parameters?.text || "");
          let refined = text.replace(/ي/g, "\u06CC").replace(/ك/g, "\u06A9").replace(/ى/g, "\u06CC").replace(/ة/g, "\u06D5").replace(/ؤ/g, "\u06C6");
          return res.json({
            tool: "kurdish_refine",
            original: text,
            refined,
            status: "\u06A9\u0648\u0627\u0644\u06CE\u062A\u06CC \u06A9\u0648\u0631\u062F\u06CC \u0628\u0627\u0634\u062A\u0631\u06A9\u0631\u0627"
          });
        }
        default:
          return res.status(404).json({ error: "\u0626\u0627\u0645\u0631\u0627\u0632 \u0646\u06D5\u062F\u06C6\u0632\u0631\u0627\u06CC\u06D5\u0648\u06D5" });
      }
    } catch (e) {
      return res.status(500).json({ error: `\u0647\u06D5\u06B5\u06D5 \u0644\u06D5 \u06A9\u0627\u0631\u067E\u06CE\u06A9\u0631\u062F\u0646\u06CC \u0626\u0627\u0645\u0631\u0627\u0632: ${e.message}` });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Basoka AI Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
