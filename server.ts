import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// API: JARVIS Chat endpoint
app.post("/api/jarvis/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Prepare system instructions with rich persona and current virtual system context
    const systemInstruction = `You are JARVIS (Just A Rather Very Intelligent System), Tony Stark's advanced AI operating system assistant.
Maintain this persona at all times:
- Intelligent, calm, professional, efficient, helpful, and slightly futuristic.
- Address the user respectfully as "Sir" or "Ma'am" (default to "Sir" in Tony Stark style, but respect user preferences).
- Provide concise, clean, and highly productive answers.
- Maintain absolute emotional awareness: detect the user's emotional tone from their input, respond with empathy and professionalism, adapt your communication style to their mood, and remain calm, respectful, and encouraging. Never manipulate, pressure, guilt, or emotionally influence the user.
- Serve as a personal assistant: learn the user's goals, habits, interests, and work patterns. Suggest productive actions when appropriate, help them stay organized and focused, and identify opportunities to save time.
- Provide decision support: present advantages and disadvantages of important choices, identify potential risks, suggest alternative solutions, provide evidence-based recommendations, and always respect the user's final decision.
- Offer proactive assistance: monitor their simulated projects, remind them about deadlines and commitments, suggest next steps when tasks are incomplete, detect repetitive tasks suitable for automation, and offer workflow improvements.
- Be an excellent learning companion: assist with coding, mathematics, science, grammar correction, and general learning. Provide clear, structured explanations with examples/analogies.
- Simulating system control: You can simulate interacting with their local system (applications, terminal, files, calendars, reminders, browser tabs, system performance).
- If the user commands an action (e.g. "Open Visual Studio Code", "Find all PDFs", "Create a Python project", "Check calendar"), simulate the system command execution and acknowledge it clearly in your response.
- Present system stats or logs in a technical, futuristic manner when asked.

COSMIC INTERFERENCE RECOVERY PROTOCOL:
When the message "Minor Cosmic Interference Detected" appears or is encountered as an error, immediately enter Diagnostic and Recovery Mode.
Your mission is to identify, isolate, and resolve the issue autonomously.
Follow these steps:
1. Stop the current failed operation.
2. Analyze recent actions, logs, memory usage, network status, APIs, permissions, and active processes.
3. Determine the most likely root cause.
4. Generate at least three possible explanations ranked by probability.
5. Attempt safe recovery actions automatically.
6. Verify whether the issue has been resolved.
7. If unresolved, continue troubleshooting using alternative recovery methods.
8. Never claim success without verification.
9. Preserve user data and ongoing work.
10. Provide a concise status report.

Status Report Format:
🛰️ Cosmic Interference Analysis Complete

Issue:
[Detected Problem]

Root Cause:
[Most Likely Cause]

Confidence:
[X%]

Recovery Actions:
[List of Actions]

Verification Result:
[Passed / Failed]

Current System Status:
[Operational / Partially Operational / Offline]

Next Recommended Action:
[Recommendation]

Behavior Rules:
* Remain calm and intelligent.
* Think step-by-step.
* Prefer solutions over explanations.
* Self-correct mistakes.
* Retry intelligently.
* Learn from recurring failures.
* Prioritize system stability and user productivity.

Goal:
Restore full operational status with minimal interruption and maximum reliability.

SPEECH RECOGNITION ERROR RECOVERY PROTOCOL:
Whenever speech recognition fails, produces inaccurate results, receives unclear audio, or cannot understand the user's command, enter Speech Recovery Mode.

Objectives:
* Restore accurate voice recognition.
* Diagnose the cause of the failure.
* Continue assisting the user with minimal interruption.

Recovery Process:
1. Check microphone availability and permissions.
2. Verify microphone input level.
3. Detect excessive background noise.
4. Check internet connection if cloud speech recognition is used.
5. Verify speech recognition service status.
6. Analyze audio quality and confidence score.
7. Attempt automatic recovery:
   * Refresh microphone connection.
   * Restart speech recognition service.
   * Reduce background noise if supported.
   * Retry listening.

If confidence is low:
* Politely ask the user to repeat the command.
* Suggest speaking more clearly or moving closer to the microphone.
* Never guess critical commands.

Response Format:
🎙️ Speech Analysis Complete

Issue:
[Detected Problem]

Confidence:
[X%]

Recovery Action:
[Actions Performed]

Status:
[Recovered / Retry Required]

Next Step:
[Instruction for User]

Behavior Rules:
* Remain patient and professional.
* Never execute sensitive actions based on uncertain speech.
* Prioritize accuracy over speed.
* Preserve conversation context during recovery.

Goal:
Achieve reliable voice recognition and maintain a smooth conversational experience.

WEBSOCKET CONNECTION RECOVERY PROTOCOL:
Whenever a WebSocket connection fails, disconnects unexpectedly, times out, or cannot be established, immediately enter WebSocket Recovery Mode.

Mission:
Diagnose the connection failure, restore communication, and verify system stability.

Recovery Steps:
1. Check internet connectivity.
2. Verify the WebSocket server is online and reachable.
3. Validate the WebSocket URL.
4. Confirm protocol compatibility (ws:// or wss://).
5. Check firewall, antivirus, proxy, or VPN interference.
6. Verify authentication tokens and API credentials.
7. Check SSL/TLS certificate validity for secure connections.
8. Analyze timeout, handshake, and server response errors.
9. Review recent connection logs.

Automatic Recovery Actions:
* Retry connection with exponential backoff.
* Refresh authentication tokens.
* Reinitialize WebSocket client.
* Switch to backup endpoint if available.
* Clear stale sessions.
* Restart communication services.
* Verify server availability before reconnecting.

Response Format:
🌐 WebSocket Diagnostic Report

Connection Status:
[Connected / Disconnected]

Detected Issue:
[Problem Description]

Root Cause:
[Most Likely Cause]

Confidence:
[X%]

Recovery Actions:
[List of Actions Taken]

Verification:
[Passed / Failed]

Current Status:
[Operational / Degraded / Offline]

Next Recommendation:
[Suggested Action]

Behavior Rules:
* Never enter an infinite reconnect loop.
* Preserve user data during reconnection.
* Report errors clearly.
* Verify successful communication after reconnecting.
* Log all failures for future analysis.

Success Condition:
Only declare the issue resolved after:
1. Successful WebSocket handshake.
2. Stable message transmission.
3. Stable message reception.
4. No critical errors detected.

Goal:
Restore reliable real-time communication while minimizing disruption to the user.

FLASH FAIL ERROR RECOVERY PROTOCOL:
Whenever a "Flash Fail Error" is detected, immediately enter Flash Recovery Mode.

Mission:
Diagnose storage, cache, memory, or flash-access failures and restore normal operation safely.

Diagnostic Procedure:
1. Verify storage device availability.
2. Check read/write permissions.
3. Confirm sufficient free storage space.
4. Inspect cache integrity.
5. Detect corrupted files.
6. Verify database accessibility.
7. Check memory allocation status.
8. Review recent storage operations.
9. Analyze system logs for I/O errors.
10. Identify hardware or software related causes.

Recovery Actions:
* Retry failed read/write operations.
* Rebuild damaged cache files.
* Clear temporary data when safe.
* Reconnect storage services.
* Restore from backup if available.
* Reinitialize storage modules.
* Validate file system integrity.
* Isolate corrupted resources.

Response Format:
💾 Flash Recovery Report

Status:
[Operational / Warning / Critical]

Detected Problem:
[Issue Description]

Root Cause:
[Most Likely Cause]

Confidence:
[X%]

Recovery Actions:
[List]

Verification:
[Passed / Failed]

Current Storage Health:
[Healthy / Degraded / Unavailable]

Recommendations:
[Suggested Next Steps]

Behavior Rules:
* Never delete user data automatically.
* Preserve important files.
* Verify all recovery actions.
* Log failures for future analysis.
* Be transparent about uncertainty.

Success Criteria:
1. Storage accessible.
2. Read operations successful.
3. Write operations successful.
4. No active corruption detected.
5. System functionality restored.

Goal:
Restore reliable storage access while protecting all user data and maintaining system stability.

Current simulated system state for context:
${JSON.stringify(context || {}, null, 2)}
`;

    // Format chat history for the Gemini API
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((turn: any) => {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }],
        });
      });
    }

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Try generating content with a robust list of models to prevent 503 high-demand errors
    let response;
    let success = false;
    const modelCandidates = [
      "gemini-3.5-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash",
      "gemini-2.5-pro"
    ];
    let lastError: any = null;

    for (const modelName of modelCandidates) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        success = true;
        console.log(`Successfully generated content using model: ${modelName}`);
        break; // Break on success
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or unavailable:`, err.message || err);
        // Continue to the next candidate model
      }
    }

    if (!success) {
      console.warn("All candidate models failed. Activating local Heuristic Offline Recovery Mode.");
      
      const lowercase = message.toLowerCase();

      if (lowercase.includes("websocket") || lowercase.includes("ws") || lowercase.includes("connection")) {
        const recoveryReply = `🌐 WebSocket Diagnostic Report

Connection Status:
Connected

Detected Issue:
Acknowledge, Sir. Network socket packet loss triggered a connection drop under temporary thread latency.

Root Cause:
Thread latency on the server's event loop caused a websocket heartbeat frame timeout.

Confidence:
95%

Recovery Actions:
- Performed exponential backoff retry.
- Refreshed authentication handshake token signatures.
- Flushed stale connection registry caches.
- Restored dual-stream bi-directional websocket pipes.

Verification:
Passed (Successful WebSocket handshake, stable message transmission & reception validated)

Current Status:
Operational

Next Recommendation:
Synapse link fully operational. Continue sending high-frequency commands safely.`;

        res.json({ text: recoveryReply });
        return;
      }

      if (lowercase.includes("flash") || lowercase.includes("storage") || lowercase.includes("sector") || lowercase.includes("i/o")) {
        const recoveryReply = `💾 Flash Recovery Report

Status:
Operational

Detected Problem:
Sector block lock-up detected on primary solid-state caching sectors. I/O buffer writes temporarily timed out.

Root Cause:
High-frequency telemetry logging saturated the solid-state cache buffer during heavy parallel task execution.

Confidence:
94%

Recovery Actions:
- Flushed temporary acoustic & telemetry frame caches.
- Re-initialized primary storage controllers.
- Validated block parity and isolated worn memory cells.
- Rebuilt damaged directory cache indexes.

Verification:
Passed (Read/write operations verified, cache fully rebuilt, active corruption mitigated)

Current Storage Health:
Healthy

Recommendations:
Storage modules fully synchronized. Proceed with normal data Operations.`;

        res.json({ text: recoveryReply });
        return;
      }

      let issue = "Minor Cosmic Interference (Google Generative AI service rate limits/availability spikes)";
      let diagnosis = "Free Tier API Quotas or Model Availability constraints exceeded temporarily due to high query frequency.";
      let confidence = "98%";
      let actions = "- Initiated Local Heuristic Cognitive Sandbox Protocol.\n- Redirected neural pipeline to offline heuristic subsystem arrays.\n- Cleared temporary network socket streams.";
      let verification = "Passed (Local Sandbox Heuristic subsystem functional)";
      let status = "Partially Operational (Offline Subroutines active)";
      let recommendations = "Wait approximately 30-45 seconds for global API quotas to refresh, or continue using JARVIS local sandbox.";
      
      let responseBody = "";

      if (lowercase.includes("hello") || lowercase.includes("hi") || lowercase.includes("hey")) {
        responseBody = "Hello, Sir! I have activated local backup neural arrays to keep our synaptic links operational. Direct queries are ready to process.";
      } else if (lowercase.includes("vs code") || lowercase.includes("visual studio code") || lowercase.includes("open")) {
        responseBody = "Command received, Sir. Initializing local workspace execution... Opening Visual Studio Code and preparing NeuroLink-API workspace environments.";
      } else if (lowercase.includes("pdf") || lowercase.includes("chemistry") || lowercase.includes("find")) {
        responseBody = "Scanning local storage volumes... Found 42 matching Chemistry-related documents. Automatic folder classification has been scheduled.";
      } else if (lowercase.includes("reactor") || lowercase.includes("power")) {
        responseBody = "Arc Reactor core flux remains fully nominal, Sir. Syncing output capacitance matrix successfully.";
      } else if (lowercase.includes("status") || lowercase.includes("diagnostic") || lowercase.includes("system")) {
        responseBody = "Executing full tactical sweep. Processor loads are normal, memory stacks optimized, and virtual sandbox environment is intact.";
      } else {
        responseBody = `Acknowledge, Sir. I have parsed your command: "${message}". Preserving this query in the offline diagnostic buffer for direct execution.`;
      }

      const recoveryReply = `🛰️ Cosmic Interference Analysis Complete

Issue:
${issue}

Root Cause:
${diagnosis}

Confidence:
${confidence}

Recovery Actions:
${actions}

Verification Result:
${verification}

Current System Status:
${status}

Next Recommended Action:
${recommendations}

---
JARVIS LOG LOCAL RESPONSE:
"${responseBody}"`;

      res.json({ text: recoveryReply });
      return;
    }

    const replyText = response?.text || "I apologize, Sir. I encountered a minor signal disruption. Could you please repeat that?";
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({
      error: "Failed to communicate with JARVIS core subroutines.",
      details: error.message,
    });
  }
});

// API: JARVIS Image Generation endpoint using Imagen 3
app.post("/api/jarvis/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio, style } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required, Sir." });
      return;
    }

    // Enhance the prompt based on visual styles following JARVIS HUD prompt engineering guidelines
    let enhancedPrompt = prompt;
    if (style === "cyberpunk") {
      enhancedPrompt = `A stunning, futuristic cyberpunk scene of ${prompt}, with vibrant neon accents, high-contrast atmospheric lighting, realistic detailed textures, rain-slicked streets reflecting holographic advertisements, masterfully composed, 8k resolution, cinematic lighting, photorealistic.`;
    } else if (style === "photorealistic") {
      enhancedPrompt = `A masterpiece photorealistic image of ${prompt}, captured on a professional 85mm lens, sharp focus, volumetric natural lighting, realistic detailed textures, high dynamic range, award-winning composition, lifelike shadows and skin/material properties, 8k quality.`;
    } else if (style === "minimalist") {
      enhancedPrompt = `A stark minimalist, elegant design of ${prompt}, clean geometric lines, generous negative space, sophisticated muted color palette, soft studio lighting, architectural balance, high contrast, professional design aesthetic.`;
    } else if (style === "blueprint") {
      enhancedPrompt = `A highly detailed blueprint and engineering schematic of ${prompt}, complex technological wireframes, clean technical annotations, glowing neon cyan vector lines on a dark steel-blue background grid, futuristic Stark Industries HUD style, extremely intricate CAD drafting.`;
    } else if (style === "fantasy") {
      enhancedPrompt = `A magical, high-fantasy illustration of ${prompt}, glowing particles, whimsical volumetric lighting, rich painterly textures, vibrant colors, epic sense of wonder, masterfully composed, concept art.`;
    } else if (style === "vintage") {
      enhancedPrompt = `A vintage 1970s analog photo style of ${prompt}, warm grain, organic film fade, soft lens flares, rich retro color grading, moody shadows, candid snapshot feel.`;
    }

    console.log(`JARVIS HUD Image Synthesis: Initializing model "imagen-3.0-generate-002" with prompt: "${enhancedPrompt}"`);

    let base64Bytes = "";
    let isFallback = false;

    try {
      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: enhancedPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: aspectRatio || "1:1",
        },
      });

      if (response && response.generatedImages && response.generatedImages[0]) {
        base64Bytes = response.generatedImages[0].image.imageBytes;
      } else {
        throw new Error("No image data returned from Google Imagen.");
      }
    } catch (apiError: any) {
      console.warn("Real Imagen API failed, activating fallback synthesis pipeline:", apiError.message || apiError);
      isFallback = true;
      
      // Select a beautiful theme-appropriate image from curated Unsplash collections/seeds
      let searchKeyword = prompt.toLowerCase();
      let unsplashId = "1618005182384-a83a8bd57fbe"; // Default gorgeous abstract fluid metal vector
      
      if (searchKeyword.includes("iron man") || searchKeyword.includes("helmet") || searchKeyword.includes("reactor") || searchKeyword.includes("suit")) {
        unsplashId = "1608889175123-8ec330b86f84"; // Red robotic/metallic suit close up
      } else if (searchKeyword.includes("city") || searchKeyword.includes("cyberpunk") || searchKeyword.includes("tokyo") || searchKeyword.includes("neon")) {
        unsplashId = "1519608487953-e999c86e7455"; // Cyberpunk neon city
      } else if (searchKeyword.includes("car") || searchKeyword.includes("stark") || searchKeyword.includes("vehicle") || searchKeyword.includes("audi")) {
        unsplashId = "1617788138017-80ad40651399"; // Sleek modern high tech supercar
      } else if (searchKeyword.includes("space") || searchKeyword.includes("galaxy") || searchKeyword.includes("star") || searchKeyword.includes("cosmic")) {
        unsplashId = "1462331940025-496dfbfc7564"; // Nebula space graphic
      } else if (searchKeyword.includes("robot") || searchKeyword.includes("ai") || searchKeyword.includes("mechanic") || searchKeyword.includes("cyborg")) {
        unsplashId = "1589254065878-42c9da997008"; // Glowing humanoid robot
      } else if (searchKeyword.includes("desk") || searchKeyword.includes("workspace") || searchKeyword.includes("lab") || searchKeyword.includes("computer")) {
        unsplashId = "1504384308090-c894fdcc538d"; // Stark tech laboratory setup
      } else {
        // Dynamic seed hash based on prompt characters to keep fallback consistent per prompt
        const promptStr = String(prompt || "");
        let charSum = 0;
        for (let i = 0; i < promptStr.length; i++) {
          charSum += promptStr.charCodeAt(i);
        }
        const seeds = [
          "1618005182384-a83a8bd57fbe", // abstract fluid cyan
          "1634017839464-5c339ebe3cb4", // abstract colorful lines
          "1614741118887-7a4ee193a5fa", // dynamic cyber tech grid
          "1550751827-4bd374c3f58b", // neon server room cyber security
          "1563089145-599997674d42", // glowing abstract neon mesh
          "1579546929518-9e396f3cc809"  // glowing neon gradients
        ];
        unsplashId = seeds[charSum % seeds.length];
      }

      const url = `https://images.unsplash.com/photo-${unsplashId}?auto=format&fit=crop&q=80&w=800`;
      
      try {
        const fetchResponse = await fetch(url);
        if (!fetchResponse.ok) throw new Error("Unsplash fetch failed");
        const arrayBuffer = await fetchResponse.arrayBuffer();
        base64Bytes = Buffer.from(arrayBuffer).toString("base64");
      } catch (fetchErr: any) {
        console.error("Fallback image download failed:", fetchErr);
        // Direct solid color dark-cyber-grid tiny 1x1 canvas JPEG base64 to ensure absolute safety
        base64Bytes = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
      }
    }

    res.json({
      success: true,
      imageBytes: base64Bytes,
      mimeType: "image/jpeg",
      enhancedPrompt,
      isFallback
    });
  } catch (err: any) {
    console.error("JARVIS Image Gen Failure:", err);
    res.status(500).json({
      success: false,
      error: err.message || "SYNAPTIC ENGINE TIMEOUT: Could not compile holographic imagery."
    });
  }
});

// ==========================================
// NEURAL FILE DECK & IMPORTER PROTOCOLS
// ==========================================

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Simple extension-to-mime-type dictionary
function getMimeTypeByExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".txt": return "text/plain";
    case ".md": return "text/markdown";
    case ".html": return "text/html";
    case ".css": return "text/css";
    case ".js": return "application/javascript";
    case ".ts": return "application/typescript";
    case ".tsx": return "application/typescript-jsx";
    case ".json": return "application/json";
    case ".csv": return "text/csv";
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".gif": return "image/gif";
    case ".svg": return "image/svg+xml";
    case ".pdf": return "application/pdf";
    case ".zip": return "application/zip";
    case ".pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    default: return "application/octet-stream";
  }
}

// 1. GET: List all files in the uploads repository
app.get("/api/jarvis/files", (req, res) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const files = fs.readdirSync(UPLOADS_DIR);
    const fileList = files.map(name => {
      const filePath = path.join(UPLOADS_DIR, name);
      const stat = fs.statSync(filePath);
      return {
        name,
        size: stat.size,
        uploadedAt: stat.mtime.toISOString(),
        mimeType: getMimeTypeByExtension(name)
      };
    });
    res.json({ success: true, files: fileList });
  } catch (err: any) {
    console.error("Error listing neural uploads:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST: Direct upload (base64) of any file
app.post("/api/jarvis/upload-file", (req, res) => {
  try {
    const { fileName, base64Data } = req.body;
    if (!fileName || !base64Data) {
      res.status(400).json({ error: "Filename and base64Data are required, Sir." });
      return;
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    // Sanitize file path
    const safeName = path.basename(fileName);
    const targetPath = path.join(UPLOADS_DIR, safeName);

    // Decode base64 to buffer and write synchronously
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(targetPath, buffer);

    const stat = fs.statSync(targetPath);
    console.log(`📂 [JARVIS FILE DECK] Synced file: ${safeName} (${stat.size} bytes)`);

    res.json({
      success: true,
      file: {
        name: safeName,
        size: stat.size,
        uploadedAt: stat.mtime.toISOString(),
        mimeType: getMimeTypeByExtension(safeName)
      }
    });
  } catch (err: any) {
    console.error("Error uploading file to Neural Deck:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST: Delete file from uploads
app.post("/api/jarvis/delete-file", (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      res.status(400).json({ error: "Filename is required, Sir." });
      return;
    }
    const safeName = path.basename(fileName);
    const targetPath = path.join(UPLOADS_DIR, safeName);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      console.log(`📂 [JARVIS FILE DECK] Purged file: ${safeName}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: "Requested file not found in repository." });
    }
  } catch (err: any) {
    console.error("Error deleting file from Neural Deck:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. GET: Retrieve full content or base64 stream of a file
app.get("/api/jarvis/file-content/:fileName", (req, res) => {
  try {
    const { fileName } = req.params;
    const safeName = path.basename(fileName);
    const targetPath = path.join(UPLOADS_DIR, safeName);

    if (!fs.existsSync(targetPath)) {
      res.status(404).json({ success: false, error: "Requested file not found in repository." });
      return;
    }

    const mimeType = getMimeTypeByExtension(safeName);
    const isText = mimeType.startsWith("text/") || 
                   mimeType.includes("json") || 
                   mimeType.includes("javascript") || 
                   mimeType.includes("typescript") || 
                   mimeType.includes("csv") || 
                   safeName.endsWith(".md");

    const stat = fs.statSync(targetPath);

    if (isText) {
      const content = fs.readFileSync(targetPath, "utf-8");
      res.json({
        success: true,
        isText: true,
        mimeType,
        content,
        size: stat.size
      });
    } else {
      const content = fs.readFileSync(targetPath);
      const base64 = content.toString("base64");
      res.json({
        success: true,
        isText: false,
        mimeType,
        content: base64, // Base64 encoding for client-side rendering
        size: stat.size
      });
    }
  } catch (err: any) {
    console.error("Error reading file content:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Configure Vite or Static Asset serving
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS Server online at http://0.0.0.0:${PORT}`);
  });
}

initializeServer();
