import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Clock,
  Terminal as TerminalIcon,
  Shield,
  HelpCircle,
  LayoutGrid,
  Info,
  Layers,
  Sparkles,
  X,
  Search,
  Trash2,
  Plus,
  Play
} from "lucide-react";
import ArcReactor from "./components/ArcReactor";
import SystemMonitor from "./components/SystemMonitor";
import CommandHub from "./components/CommandHub";
import PresentationCore from "./components/PresentationCore";
import ThinkingMatrix from "./components/ThinkingMatrix";
import VisionEngine from "./components/VisionEngine";
import NeuralFileExplorer from "./components/NeuralFileExplorer";
import ArchitectureRoadmap from "./components/ArchitectureRoadmap";
import GoogleTasksHub from "./components/GoogleTasksHub";
import { TerminalLog } from "./types";

export default function App() {
  // Conversational & Audio States
  const [inputText, setInputText] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "jarvis"; text: string }[]>([
    { role: "jarvis", text: "Online and ready, Sir. Subsystems are performing within nominal parameters. How can I assist you today?" }
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wsStatus, setWsStatus] = useState<"connected" | "disconnected" | "diagnosing" | "recovering">("connected");
  const [flashStatus, setFlashStatus] = useState<"healthy" | "critical" | "recovering">("healthy");
  const [reactorPower, setReactorPower] = useState(65); // percentage
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [leftPanelTab, setLeftPanelTab] = useState<"subsystems" | "presentation" | "thinking" | "vision" | "files" | "roadmap" | "tasks">("roadmap");
  const [uplinkedFiles, setUplinkedFiles] = useState<{ [fileName: string]: string }>({});
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState<number>(-1);
  const [draftInput, setDraftInput] = useState<string>("");
  const [isVoiceLibraryOpen, setIsVoiceLibraryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCommandText, setNewCommandText] = useState("");
  const [voiceCommands, setVoiceCommands] = useState<string[]>([
    "status report",
    "emergency recovery",
    "hello jarvis",
    "generate image of iron man suit holographic display",
    "fix websocket connection",
    "fix flash",
    "jarvis sleep"
  ]);

  // Terminal Event Logs
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: "log-1",
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      text: "JARVIS KERNEL: Absolute system environment loaded."
    },
    {
      id: "log-2",
      timestamp: new Date().toLocaleTimeString(),
      type: "success",
      text: "MARK-8 REACTOR: Arc Reactor resonance sync successful."
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const filteredCommands = voiceCommands.filter((cmd) =>
    cmd.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Clock Update Effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
      setDateStr(
        now.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        }).toUpperCase()
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        addTerminalLog("SPEECH COGNITION: Active listening mode engaged.", "system");
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputText(text);
          setVoiceCommands((prev) => {
            const clean = text.trim();
            const exists = prev.some(c => c.toLowerCase() === clean.toLowerCase());
            return exists ? prev : [...prev, clean];
          });
          addTerminalLog(`SPEECH RECOGNIZED: "${text}"`, "success");
          handleSendCommand(text);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error", err);
        setIsListening(false);
        addTerminalLog(`SPEECH ERROR: Signal disrupted. State: ${err.error}`, "error");

        const isBlocked = err.error === "not-allowed" || err.error === "permission-denied";
        const issueDescription = isBlocked
          ? "Microphone access blocked (Permission denied or hardware toggle disabled)."
          : err.error === "no-speech"
          ? "No audio detected or audio signal levels fell below acoustic synapse thresholds."
          : `Speech cognition unit failed due to device/network fault: "${err.error}"`;

        const recoveryAction = isBlocked
          ? "- Scanned system permission vectors.\n- Prompted user for browser micro-node authorization.\n- Restored backup local typing console connection."
          : "- Auto-flushed acoustic buffer frames.\n- Recalibrated noise cancellation subroutines.\n- Restarted Speech Recognition microservices.";

        const statusLabel = isBlocked ? "Retry Required" : "Recovered";
        const nextStepLabel = isBlocked
          ? "Please click the microphone icon again and grant microphone permissions in your browser, Sir."
          : "Sensors re-aligned. Please speak closer to the microphone and try again, Sir.";

        const speechRecoveryReport = `🎙️ Speech Analysis Complete

Issue:
${issueDescription}

Confidence:
92%

Recovery Action:
${recoveryAction}

Status:
${statusLabel}

Next Step:
${nextStepLabel}`;

        setHistory((prev) => [...prev, { role: "jarvis", text: speechRecoveryReport }]);
        speakResponse(isBlocked
          ? "Speech recognition blocked. Please grant microphone permission, Sir."
          : "Audio sensor timeout. Recalibrated passive sensors. Please speak again."
        );
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Auto-scroll chat history
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Voice output function
  const speakResponse = (text: string) => {
    if (!soundEnabled || !("speechSynthesis" in window)) return;

    // Clean text of visual markdown/emojis for cleaner voice rendering
    const cleanText = text
      .replace(/[*_#`~]/g, "")
      .replace(/Sir[,.]?/gi, "Sir,")
      .trim();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Try finding a suitable sleek male voice (Tony Stark vibe)
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice =
      voices.find((v) => v.name.includes("Male") || v.name.includes("David")) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.pitch = 0.88; // Sophisticated Tony Stark-like pitch
    utterance.rate = 1.05; // Conversational flow speed

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Helper: Append logs to virtual terminal
  const addTerminalLog = (text: string, type: "system" | "success" | "error" | "user" | "jarvis") => {
    const newLog: TerminalLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      text
    };
    setTerminalLogs((prev) => [...prev.slice(-40), newLog]);
  };

  // Trigger mic listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      addTerminalLog("SYSTEM ERROR: Audio recognition hardware not supported or permission denied.", "error");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        window.speechSynthesis.cancel(); // Mute jarvis speaking if user cuts in
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const triggerWsInterruption = () => {
    if (wsStatus !== "connected") return;

    setWsStatus("disconnected");
    addTerminalLog("WS WARNING: Synapse stream lost heartbeat telemetry.", "error");
    
    // 1. Diagnosing after 1.5s
    setTimeout(() => {
      setWsStatus("diagnosing");
      addTerminalLog("WS DIAGNOSTIC: Checking DNS routing & SSL certification...", "system");
    }, 1500);

    // 2. Recovering after 3.0s
    setTimeout(() => {
      setWsStatus("recovering");
      addTerminalLog("WS RECOVERY: Refreshing auth keys & scheduling exponential backoff...", "system");
    }, 3000);

    // 3. Connect & Report after 5.0s
    setTimeout(() => {
      setWsStatus("connected");
      addTerminalLog("WS SUCCESS: Handshake verified. High-frequency pipeline active.", "success");

      const report = `🌐 WebSocket Diagnostic Report

Connection Status:
Connected

Detected Issue:
Sudden drop in WebSocket stream telemetry due to packet corruption.

Root Cause:
Minor satellite misalignment causing packet drop on the secure transport layer.

Confidence:
96%

Recovery Actions:
- Initiated automatic socket re-handshake sequence.
- Flushed stale connection tables.
- Refreshed TLS authentication keys.
- Established secure dual-channel synapse bridge.

Verification:
Passed (Handshake stable, uplink/downlink packets transmitting at nominal rate)

Current Status:
Operational

Next Recommendation:
WebSocket synapse link fully re-aligned. Main communications are active, Sir.`;

      setHistory((prev) => [...prev, { role: "jarvis", text: report }]);
      speakResponse("WebSocket connection successfully re-established, Sir. Synapse link is fully nominal.");
    }, 5000);
  };

  const triggerFlashFailure = () => {
    if (flashStatus !== "healthy") return;

    setFlashStatus("critical");
    addTerminalLog("FLASH FAULT: Sector block lock-up detected on solid-state sectors.", "error");
    
    // 1. Recovering after 1.5s
    setTimeout(() => {
      setFlashStatus("recovering");
      addTerminalLog("FLASH RECOVERY: Flashing temporary frame cache and resetting disk controllers...", "system");
    }, 1500);

    // 2. Restore after 3.5s
    setTimeout(() => {
      setFlashStatus("healthy");
      addTerminalLog("FLASH SUCCESS: Storage sectors fully aligned and parity verified.", "success");

      const report = `💾 Flash Recovery Report

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

      setHistory((prev) => [...prev, { role: "jarvis", text: report }]);
      speakResponse("Primary solid state caching sectors have been successfully recovered, Sir. Read and write storage functions are fully nominal.");
    }, 3500);
  };

  const handleFixWs = () => {
    setWsStatus("connected");
    addTerminalLog("WS SUCCESS: Synapse link manually aligned and verified.", "success");
    speakResponse("I've manually aligned our WebSocket handshake, Sir. Synapse telemetry link is now fully operational.");
    
    const report = `🌐 WebSocket Alignment Report
Status: Connected
Handshake: Verified
Dual-Channel Synapse Link: Nominal
All operations fully online, Sir.`;
    setHistory((prev) => [...prev, { role: "jarvis", text: report }]);
  };

  const handleFixFlash = () => {
    setFlashStatus("healthy");
    addTerminalLog("FLASH SUCCESS: Sector block lock-up recovered and defragmented.", "success");
    speakResponse("I've defragmented and recovered the solid-state cache sectors. Storage sectors are fully healthy.");
    
    const report = `💾 Flash Storage Alignment Report
Status: Healthy
Storage Controllers: Initialized
Parity Blocks: 100% verified
All storage cells fully functional, Sir.`;
    setHistory((prev) => [...prev, { role: "jarvis", text: report }]);
  };

  // Send Command Handler
  const handleSendCommand = async (overrideText?: string) => {
    const commandText = overrideText || inputText;
    if (!commandText.trim()) return;

    // Record to command history
    setCommandHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === commandText) {
        return prev;
      }
      return [...prev, commandText];
    });
    setCommandHistoryIndex(-1);
    setDraftInput("");

    // Reset input field
    setInputText("");

    const lowerText = commandText.toLowerCase().trim();

    // 0. Intercept Image Generation Intent
    const imageKeywords = ["generate image of", "generate an image of", "create image of", "draw ", "draw a ", "synthesize image of", "create a graphic of", "image generator", "image generation"];
    const matchesImageKeyword = imageKeywords.some(keyword => lowerText.startsWith(keyword)) || lowerText === "image generator" || lowerText === "image generation";

    if (matchesImageKeyword) {
      setHistory((prev) => [...prev, { role: "user", text: commandText }]);
      addTerminalLog(`USER INSTRUCTION: "${commandText}" (Image synthesis protocol triggered)`, "user");
      
      let extractedPrompt = commandText;
      for (const keyword of imageKeywords) {
        if (lowerText.startsWith(keyword)) {
          extractedPrompt = commandText.slice(keyword.length).trim();
          break;
        }
      }

      if (!extractedPrompt || extractedPrompt.toLowerCase() === "image generator" || extractedPrompt.toLowerCase() === "image generation") {
        extractedPrompt = "Close up technical CAD blueprint schematic of a glowing blue iron man arc reactor with neon cybernetic details";
      }

      setLeftPanelTab("vision");
      speakResponse("Initializing Stark Vision Engine, Sir. Compiling volumetric parameters for graphic synthesis.");

      const jarvisResponse = `Initializing Stark Vision Engine... 

I've switched your tactical display HUD to the VISION ENGINE tab. 
Target graphic parameters loaded: "${extractedPrompt}"

I am now initializing high-definition pixel rendering. Please monitor the Vision Engine console on the left panel for real-time compilation progress, Sir.`;

      setHistory((prev) => [...prev, { role: "jarvis", text: jarvisResponse }]);
      setIsProcessing(false);
      return;
    }

    // 1. Hello Jarvis / Startup Greet
    if (lowerText === "hello jarvis" || lowerText === "hello, jarvis" || lowerText === "wake up jarvis" || lowerText === "wake up, jarvis") {
      setHistory((prev) => [...prev, { role: "user", text: commandText }]);
      addTerminalLog(`USER INSTRUCTION: "${commandText}" (Wake word detected)`, "user");
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        const hasIssue = wsStatus !== "connected" || flashStatus !== "healthy";
        let greetText = "";

        if (!hasIssue) {
          greetText = "Good day, Sir. JARVIS online and fully operational.\n\nI've loaded your preferences, recent activities, and active projects (including the Automated Slide Builder and Thinking Matrix). All primary systems are functioning normally.\n\nHow may I assist you today?";
        } else {
          const issues = [];
          if (wsStatus !== "connected") issues.push(`- Network socket: telemetry lost (${wsStatus})`);
          if (flashStatus !== "healthy") issues.push(`- Solid-state cache sector error (${flashStatus})`);
          
          greetText = `Good day, Sir. JARVIS online with limited functionality.\n\nI've detected the following issue:\n${issues.join("\n")}\n\nI've started recovery procedures and will continue operating where possible.\n\nHow may I assist you?`;
        }

        setHistory((prev) => [...prev, { role: "jarvis", text: greetText }]);
        addTerminalLog("JARVIS OS: Greeted user successfully", "jarvis");
        speakResponse(greetText);

        // Try triggering listening mode automatically if supported
        if (!isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.warn("Could not auto-start listening on wake word:", e);
          }
        }
      }, 1000);
      return;
    }

    // 2. Jarvis, sleep Standby
    if (lowerText === "jarvis, sleep" || lowerText === "jarvis sleep" || lowerText === "sleep, jarvis" || lowerText === "sleep jarvis") {
      setHistory((prev) => [...prev, { role: "user", text: commandText }]);
      addTerminalLog(`USER INSTRUCTION: "${commandText}"`, "user");
      
      if (isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const standbyText = "Understood, Sir. Entering standby mode to conserve power. Let me know if you need any subroutines activated.";
      setHistory((prev) => [...prev, { role: "jarvis", text: standbyText }]);
      addTerminalLog("JARVIS OS: Standby protocol engaged", "system");
      speakResponse(standbyText);
      return;
    }

    // 3. Status Report
    if (lowerText === "jarvis, status report" || lowerText === "jarvis status report" || lowerText === "status report" || lowerText === "system status") {
      setHistory((prev) => [...prev, { role: "user", text: commandText }]);
      addTerminalLog(`USER INSTRUCTION: "${commandText}"`, "user");
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        const report = `📊 JARVIS SYSTEM STATUS REPORT

Core Arc Reactor: ${reactorPower}% Power Output (Nominal)
Acoustic Synapse Link: ${isListening ? "ACTIVE" : "STANDBY"}
WebSocket Telemetry: ${wsStatus.toUpperCase()}
Flash Storage Cache: ${flashStatus.toUpperCase()}
Active Modules: Slide Builder, Quantum Grid, Thinking Matrix

All subroutines are synchronized and operating within normal parameters, Sir.`;

        setHistory((prev) => [...prev, { role: "jarvis", text: report }]);
        addTerminalLog("JARVIS OS: Status report generated", "success");
        speakResponse(`All subroutines are synchronized and operating within normal parameters, Sir. Core power output is at ${reactorPower} percent.`);
      }, 800);
      return;
    }

    // 4. Continue previous task
    if (lowerText === "jarvis, continue previous task" || lowerText === "jarvis continue previous task" || lowerText === "continue previous task" || lowerText === "continue task" || lowerText === "continue project") {
      setHistory((prev) => [...prev, { role: "user", text: commandText }]);
      addTerminalLog(`USER INSTRUCTION: "${commandText}"`, "user");
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        const text = "I found your active project file, Sir. We recently completed the dynamic Stark theme customization for the automated slide builder, allowing live slide preview rendering and PptxGenJS exports. Shall I initialize the PowerPoint compiler or check our synaptic automation modules?";
        setHistory((prev) => [...prev, { role: "jarvis", text: text }]);
        addTerminalLog("JARVIS OS: Resumed ongoing project context", "success");
        speakResponse("I found your active project file, Sir. We recently completed the dynamic Stark theme customization for the automated slide builder. Shall I initialize the PowerPoint compiler?");
      }, 800);
      return;
    }

    // 5. Emergency Recovery
    if (lowerText === "jarvis, emergency recovery" || lowerText === "jarvis emergency recovery" || lowerText === "emergency recovery" || lowerText === "run diagnostics") {
      setHistory((prev) => [...prev, { role: "user", text: commandText }]);
      addTerminalLog(`USER INSTRUCTION: "${commandText}"`, "user");
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        const text = "Emergency protocol activated, Sir. Initiating full core diagnostic sweep... Re-initializing websocket connection handshake, flushing temporary solid-state storage sector cache, and re-allocating grid currents. Please stand by.";
        setHistory((prev) => [...prev, { role: "jarvis", text: text }]);
        addTerminalLog("JARVIS OS: EMERGENCY DIAGNOSTIC RECOVERY TRIGGERED", "error");
        speakResponse("Emergency protocol activated, Sir. Initiating full core diagnostic sweep.");
        
        // Dynamically trigger WS and Flash failure + recovery sequences to play out live!
        triggerWsInterruption();
        setTimeout(() => {
          triggerFlashFailure();
        }, 1200);
      }, 1000);
      return;
    }

    if (lowerText === "fix websocket" || lowerText === "fix wedsocket" || lowerText === "reconnect websocket" || lowerText === "reconnect wedsocket" || lowerText === "repair websocket" || lowerText === "repair wedsocket" || lowerText === "fix ws" || lowerText === "reconnect ws") {
      setHistory((prev) => [...prev, { role: "user", text: commandText }]);
      addTerminalLog(`USER INSTRUCTION: "${commandText}"`, "user");
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        handleFixWs();
      }, 800);
      return;
    }

    if (lowerText === "fix flash" || lowerText === "fix storage" || lowerText === "recover flash" || lowerText === "defragment storage" || lowerText === "repair flash" || lowerText === "defragment flash") {
      setHistory((prev) => [...prev, { role: "user", text: commandText }]);
      addTerminalLog(`USER INSTRUCTION: "${commandText}"`, "user");
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        handleFixFlash();
      }, 800);
      return;
    }

    if (lowerText.includes("simulate websocket") || lowerText.includes("websocket error") || lowerText.includes("interrupt websocket") || lowerText.includes("disconnect websocket") || lowerText.includes("ws error")) {
      setHistory((prev) => [...prev, { role: "user", text: commandText }]);
      addTerminalLog(`USER INSTRUCTION: "${commandText}"`, "user");
      triggerWsInterruption();
      return;
    }

    if (lowerText.includes("simulate flash") || lowerText.includes("flash error") || lowerText.includes("flash fail") || lowerText.includes("trigger flash") || lowerText.includes("storage error") || lowerText.includes("i/o error")) {
      setHistory((prev) => [...prev, { role: "user", text: commandText }]);
      addTerminalLog(`USER INSTRUCTION: "${commandText}"`, "user");
      triggerFlashFailure();
      return;
    }

    setIsProcessing(true);

    // Insert user's query into chat history
    setHistory((prev) => [...prev, { role: "user", text: commandText }]);
    addTerminalLog(`USER INSTRUCTION: "${commandText}"`, "user");

    try {
      // Build context of running applications, reactor flux, etc. for Gemini integration
      const context = {
        reactorPower,
        localTime: new Date().toISOString(),
        location: "Malibu Central Node",
        activeApplications: [
          { name: "Visual Studio Code", status: "running" },
          { name: "Terminal Module", status: "running" }
        ],
        uplinkedFiles: Object.keys(uplinkedFiles).map((name) => ({
          fileName: name,
          content: uplinkedFiles[name].length > 6000 
            ? uplinkedFiles[name].slice(0, 6000) + "\n... [TRUNCATED DUE TO BUFFER THRESHOLD]" 
            : uplinkedFiles[name]
        }))
      };

      const response = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: commandText,
          history: history.map((h) => ({
            role: h.role === "user" ? "user" : "model",
            text: h.text
          })),
          context
        })
      });

      if (!response.ok) {
        throw new Error("Core synaptic uplink failed.");
      }

      const data = await response.json();
      const reply = data.text;

      // Typewriter sequence / response
      setHistory((prev) => [...prev, { role: "jarvis", text: reply }]);
      addTerminalLog(`JARVIS FEEDBACK: Synchronizing subroutines.`, "jarvis");

      // Speak text aloud
      speakResponse(reply);
    } catch (err: any) {
      console.error(err);
      const errorMsg = "I apologize, Sir. My satellite relay is experiencing minor cosmic interference. Please retry.";
      setHistory((prev) => [...prev, { role: "jarvis", text: errorMsg }]);
      addTerminalLog(`SYSTEM FAULT: Synaptic handshake timeout.`, "error");
      speakResponse(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;

      if (commandHistoryIndex === -1) {
        // Store current text as draft
        setDraftInput(inputText);
        const nextIndex = commandHistory.length - 1;
        setCommandHistoryIndex(nextIndex);
        setInputText(commandHistory[nextIndex]);
        addTerminalLog(`STARK CONSOLE: Recalling previous command [${nextIndex + 1}/${commandHistory.length}]`, "system");
      } else if (commandHistoryIndex > 0) {
        const nextIndex = commandHistoryIndex - 1;
        setCommandHistoryIndex(nextIndex);
        setInputText(commandHistory[nextIndex]);
        addTerminalLog(`STARK CONSOLE: Recalling previous command [${nextIndex + 1}/${commandHistory.length}]`, "system");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (commandHistoryIndex !== -1) {
        if (commandHistoryIndex < commandHistory.length - 1) {
          const nextIndex = commandHistoryIndex + 1;
          setCommandHistoryIndex(nextIndex);
          setInputText(commandHistory[nextIndex]);
          addTerminalLog(`STARK CONSOLE: Recalling next command [${nextIndex + 1}/${commandHistory.length}]`, "system");
        } else if (commandHistoryIndex === commandHistory.length - 1) {
          setCommandHistoryIndex(-1);
          setInputText(draftInput);
          addTerminalLog("STARK CONSOLE: Restored active draft command", "system");
        }
      }
    }
  };

  return (
    <div
      id="jarvis-system-workspace"
      className="w-full h-screen bg-[#020617] text-slate-300 p-6 flex flex-col gap-5 overflow-hidden font-sans select-none"
    >
      {/* Background Hologram Mesh Layer */}
      <div
        id="hologram-grid-layer"
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #06b6d4 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px"
        }}
      />

      {/* Cybernetic Header */}
      <header
        id="jarvis-hud-header"
        className="flex justify-between items-end border-b border-cyan-500/10 pb-4 relative z-10"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                wsStatus === "connected"
                  ? "bg-cyan-400"
                  : wsStatus === "disconnected"
                  ? "bg-red-500"
                  : "bg-amber-400"
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 shadow-[0_0_10px_rgba(6,182,212,0.8)] ${
                wsStatus === "connected"
                  ? "bg-cyan-500"
                  : wsStatus === "disconnected"
                  ? "bg-red-500"
                  : "bg-amber-500"
              }`}></span>
            </span>
            <h1 className={`text-xs font-bold tracking-[0.25em] uppercase font-mono ${
              wsStatus === "connected"
                ? "text-cyan-400"
                : wsStatus === "disconnected"
                ? "text-red-400 animate-pulse"
                : "text-amber-400 animate-pulse"
            }`}>
              {wsStatus === "connected"
                ? "JARVIS NETWORK OPERATIONAL"
                : wsStatus === "disconnected"
                ? "JARVIS SYNAPSE OFFLINE"
                : `JARVIS SYNAPSE ${wsStatus.toUpperCase()}`}
            </h1>
          </div>
          <div className="text-2xl font-light text-white tracking-tight flex items-center gap-2.5">
            J.A.R.V.I.S.{" "}
            <span className="text-cyan-500/40 uppercase text-[10px] tracking-[0.2em] font-mono border border-cyan-500/10 px-2 py-0.5 rounded bg-cyan-500/5">
              Core v4.2.0
            </span>
          </div>
        </div>

        {/* Real-time Clock Matrix */}
        <div id="chronometer-readout" className="text-right font-mono">
          <div className="text-2xl font-light text-white tracking-widest leading-none mb-1">
            {time || "00:00:00"}
          </div>
          <div className="text-[10px] text-cyan-500/60 uppercase tracking-[0.15em] flex items-center justify-end gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-500/40" />
            {dateStr || "LOADING CHRONOLOGY..."} • MALIBU CELL
          </div>
        </div>
      </header>

      {/* Main Stark Tri-Column Console Layout */}
      <div id="console-grid-viewport" className="flex-1 grid grid-cols-12 gap-5 overflow-hidden relative z-10">
        
        {/* Left column: Subsystems & Automation (col-span-3) */}
        <aside id="left-tactical-rail" className="col-span-3 flex flex-col h-full overflow-hidden">
          {/* Main Rail Navigation */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-950/95 border border-cyan-500/15 p-1 rounded-lg mb-3 shrink-0">
            <button
              onClick={() => setLeftPanelTab("roadmap")}
              className={`flex-1 font-mono text-[9px] tracking-wider uppercase py-1.5 px-0.5 rounded-md transition-all text-center ${
                leftPanelTab === "roadmap"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-bold"
                  : "text-slate-500 hover:text-cyan-400/80"
              }`}
            >
              🗺️ Roadmap
            </button>
            <button
              onClick={() => setLeftPanelTab("thinking")}
              className={`flex-1 font-mono text-[9px] tracking-wider uppercase py-1.5 px-0.5 rounded-md transition-all text-center ${
                leftPanelTab === "thinking"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-bold"
                  : "text-slate-500 hover:text-cyan-400/80"
              }`}
            >
              🧠 Brain
            </button>
            <button
              onClick={() => setLeftPanelTab("subsystems")}
              className={`flex-1 font-mono text-[9px] tracking-wider uppercase py-1.5 px-0.5 rounded-md transition-all text-center ${
                leftPanelTab === "subsystems"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-bold"
                  : "text-slate-500 hover:text-cyan-400/80"
              }`}
            >
              System
            </button>
            <button
              onClick={() => setLeftPanelTab("presentation")}
              className={`flex-1 font-mono text-[9px] tracking-wider uppercase py-1.5 px-0.5 rounded-md transition-all text-center ${
                leftPanelTab === "presentation"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-bold"
                  : "text-slate-500 hover:text-cyan-400/80"
              }`}
            >
              PPTX
            </button>
            <button
              onClick={() => setLeftPanelTab("vision")}
              className={`flex-1 font-mono text-[9px] tracking-wider uppercase py-1.5 px-0.5 rounded-md transition-all text-center ${
                leftPanelTab === "vision"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-bold"
                  : "text-slate-500 hover:text-cyan-400/80"
              }`}
            >
              Vision
            </button>
            <button
              onClick={() => setLeftPanelTab("files")}
              className={`flex-1 font-mono text-[9px] tracking-wider uppercase py-1.5 px-0.5 rounded-md transition-all text-center ${
                leftPanelTab === "files"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-bold"
                  : "text-slate-500 hover:text-cyan-400/80"
              }`}
            >
              📂 Files
            </button>
            <button
              onClick={() => setLeftPanelTab("tasks")}
              className={`flex-1 font-mono text-[9px] tracking-wider uppercase py-1.5 px-0.5 rounded-md transition-all text-center ${
                leftPanelTab === "tasks"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-bold"
                  : "text-slate-500 hover:text-cyan-400/80"
              }`}
            >
              ✅ Tasks
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {leftPanelTab === "roadmap" ? (
                <motion.div
                  key="roadmap-hub"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <ArchitectureRoadmap
                    onTriggerLog={(text, type) => addTerminalLog(text, type)}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </motion.div>
              ) : leftPanelTab === "thinking" ? (
                <motion.div
                  key="thinking-hub"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <ThinkingMatrix
                    onTriggerLog={(text, type) => addTerminalLog(text, type)}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </motion.div>
              ) : leftPanelTab === "subsystems" ? (
                <motion.div
                  key="subsystems-hub"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <CommandHub
                    onTriggerLog={(text, type) => addTerminalLog(text, type)}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </motion.div>
              ) : leftPanelTab === "presentation" ? (
                <motion.div
                  key="presentation-hub"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <PresentationCore
                    onTriggerLog={(text, type) => addTerminalLog(text, type)}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </motion.div>
              ) : leftPanelTab === "vision" ? (
                <motion.div
                  key="vision-hub"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <VisionEngine
                    onTriggerLog={(text, type) => addTerminalLog(text, type)}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </motion.div>
              ) : leftPanelTab === "files" ? (
                <motion.div
                  key="files-hub"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <NeuralFileExplorer
                    onTriggerLog={(text, type) => addTerminalLog(text, type)}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    uplinkedFiles={uplinkedFiles}
                    setUplinkedFiles={setUplinkedFiles}
                    onActivateSpeech={speakResponse}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="tasks-hub"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <GoogleTasksHub
                    onTriggerLog={(text, type) => addTerminalLog(text, type)}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Center column: Main AI Interaction Arena (col-span-6) */}
        <main id="center-holographic-deck" className="col-span-6 flex flex-col gap-4 h-full overflow-hidden">
          {/* Futuristic Visualizer Stage */}
          <div
            id="holographic-focus-chamber"
            className="flex-1 bg-gradient-to-b from-slate-900/40 to-cyan-950/10 border border-cyan-500/10 rounded-2xl p-6 relative flex flex-col overflow-hidden"
          >
            {/* Corner Decorative Tech Marks */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-500/20" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-500/20" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-500/20" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500/20" />

            {/* Top Indicator */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/60 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-500" /> Active Holographic Node
              </span>
              <div className="flex items-center gap-3">
                <button
                  id="mute-reactor-sound-btn"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 hover:bg-cyan-500/10 rounded transition-colors text-cyan-500/60 hover:text-cyan-400"
                  title={soundEnabled ? "Mute Speech Synthesis" : "Unmute Speech Synthesis"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                </button>
                <span className="text-[10px] font-mono uppercase bg-cyan-500/10 px-2 py-0.5 text-cyan-400 border border-cyan-500/20 rounded">
                  {isProcessing ? "PROCESSING" : "READY"}
                </span>
              </div>
            </div>

            {/* Chat History Arena */}
            <div
              id="synaptic-history-scroller"
              className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin scrollbar-thumb-cyan-500/20"
            >
              <AnimatePresence initial={false}>
                {history.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-xl font-mono text-xs ${
                        msg.role === "user"
                          ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-200"
                          : "bg-slate-950/60 border border-slate-800/60 text-slate-300"
                      }`}
                    >
                      <div className="text-[9px] font-bold uppercase tracking-wider mb-1 text-cyan-400">
                        {msg.role === "user" ? "STARK CORE COMMAND" : "JARVIS OS RESPONSE"}
                      </div>
                      <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-950/40 border border-cyan-500/10 p-4 rounded-xl max-w-[85%] font-mono text-xs flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-cyan-400/60 uppercase tracking-widest text-[10px]">JARVIS compiling response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Holographic Signal Waveform - Ripples dynamically based on status */}
            <div className="h-16 border-t border-cyan-500/10 pt-3 flex flex-col justify-center items-center relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
              
              <div className="flex items-center justify-center gap-1.5 mb-1 h-8">
                {Array.from({ length: 32 }).map((_, i) => {
                  // Generate an elegant symmetrical waveform height list
                  const distFromCenter = Math.abs(16 - i);
                  let baseHeight = Math.max(3, 24 - distFromCenter * 1.5);
                  if (isSpeaking) {
                    baseHeight = baseHeight * (0.6 + Math.random() * 0.8);
                  } else if (isListening) {
                    baseHeight = baseHeight * (0.4 + Math.random() * 0.7);
                  } else if (isProcessing) {
                    baseHeight = 6 + Math.sin((Date.now() / 150) + i) * 5;
                  } else {
                    baseHeight = 3 + Math.sin((Date.now() / 1000) + i) * 1.5;
                  }

                  return (
                    <motion.div
                      key={i}
                      animate={{ height: baseHeight }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className={`w-0.5 rounded-full transition-colors ${
                        isSpeaking
                          ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                          : isListening
                          ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                          : isProcessing
                          ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                          : "bg-cyan-500/30"
                      }`}
                    />
                  );
                })}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-400/40">
                {isSpeaking
                  ? "SENSORY AUDIO DECODER: SPEAKING"
                  : isListening
                  ? "COGNITIVE SYNAPSE SENSOR: LISTEN ACTIVE"
                  : isProcessing
                  ? "GRID COMPILING COGNITION"
                  : "Uplink Standby Signal Active"}
              </span>
            </div>
          </div>

          {/* Elegant Pill-Shaped Input Command Bar */}
          <div
            id="stark-input-dock"
            className="h-16 bg-slate-950/90 rounded-2xl border border-cyan-500/15 flex items-center px-4 gap-3 shadow-[0_0_15px_rgba(6,182,212,0.05)] relative z-10"
          >
            {/* Inline Suggestion Dropdown */}
            {inputText.trim() && (() => {
              const matching = [
                "status report",
                "emergency recovery",
                "hello jarvis",
                "jarvis sleep",
                "continue previous task",
                "fix websocket",
                "fix flash",
                "generate image of "
              ].filter(cmd => 
                cmd.toLowerCase().includes(inputText.toLowerCase().trim()) &&
                cmd.toLowerCase() !== inputText.toLowerCase().trim()
              );

              if (matching.length === 0) return null;

              return (
                <div className="absolute bottom-18 left-0 right-0 bg-slate-950/95 border border-cyan-500/20 rounded-xl p-1.5 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md z-50 flex flex-col gap-1 max-h-48 overflow-y-auto">
                  <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-cyan-400/50 border-b border-cyan-500/10 mb-1 flex items-center justify-between">
                    <span>SUGGESTED OS COMMANDS</span>
                    <span className="text-[8px] opacity-70 font-bold">CLICK TO POPULATE</span>
                  </div>
                  {matching.map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => {
                        setInputText(cmd);
                        addTerminalLog(`STARK CONSOLE: Suggestion chosen: "${cmd}"`, "system");
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-left text-xs font-mono text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-cyan-500/50 group-hover:text-cyan-400 font-bold">&gt;</span>
                        <span>{cmd}</span>
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 group-hover:text-cyan-500/70 border border-slate-800 group-hover:border-cyan-500/20 px-1.5 py-0.5 rounded uppercase">
                        Autofill
                      </span>
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Listening Mic Trigger Button */}
            <button
              id="mic-listening-trigger-btn"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isListening
                  ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,189,129,0.5)] border border-emerald-400"
                  : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/15"
              }`}
              title="Toggle Speech Recognition"
            >
              {isListening ? (
                <Mic className="w-5 h-5 animate-pulse" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Command Voice Library Trigger Button */}
            <button
              id="command-voice-library-trigger-btn"
              onClick={() => {
                setIsVoiceLibraryOpen(true);
                addTerminalLog("STARK CONSOLE: Opening command voice library registry...", "system");
              }}
              className="w-10 h-10 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/15 flex items-center justify-center transition-all shrink-0"
              title="Command Voice Library"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Live Typing Input Box */}
            <input
              id="hud-keyboard-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-600 font-mono text-sm tracking-wide"
              placeholder="Query J.A.R.V.I.S. core systems or input diagnostics command..."
            />

            {/* Context/Execution Advice info */}
            <div className="hidden md:flex flex-col text-right font-mono text-[9px] text-slate-500 leading-tight">
              <span>ENTER KEY</span>
              <span>TO EXECUTE</span>
            </div>

            {/* Execute Command button */}
            <button
              id="fire-command-btn"
              onClick={() => handleSendCommand()}
              disabled={isProcessing || !inputText.trim()}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                !inputText.trim()
                  ? "bg-slate-900/40 text-slate-700 border-slate-800/40 cursor-not-allowed"
                  : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              }`}
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </main>

        {/* Right column: Arc Reactor Control & Diagnostics (col-span-3) */}
        <aside id="right-tactical-rail" className="col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          
          {/* Arc Reactor Unit */}
          <div className="h-[52%]">
            <ArcReactor
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              powerLevel={reactorPower}
              setPowerLevel={setReactorPower}
            />
          </div>

          {/* System Telemetry Monitor */}
          <div className="flex-1 overflow-hidden">
            <SystemMonitor 
              powerLevel={reactorPower} 
              wsStatus={wsStatus} 
              onSimulateInterruption={triggerWsInterruption}
              onFixWs={handleFixWs}
              flashStatus={flashStatus}
              onSimulateFlashFail={triggerFlashFailure}
              onFixFlash={handleFixFlash}
            />
          </div>
        </aside>
      </div>

      {/* Footer System Status Panel */}
      <footer
        id="cybernetic-system-dashboard-footer"
        className="flex justify-between items-center text-[10px] font-mono border-t border-cyan-500/10 pt-3 text-slate-500 relative z-10"
      >
        <span className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-500/40" />
          SYNAPTIC SECURE SHELL ENCRYPTED: AES-256-GCM
        </span>
        <span className="flex items-center gap-1 text-cyan-400/50">
          <Sparkles className="w-3 h-3 text-cyan-400" /> STARK INDUSTRIAL GLOBAL ACCESS SATELLITE
        </span>
      </footer>

      {/* Voice Command Library Modal */}
      <AnimatePresence>
        {isVoiceLibraryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            id="voice-library-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col gap-4 max-h-[85vh] overflow-hidden relative"
              id="voice-library-modal-body"
            >
              {/* Decorative Tech Corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl pointer-events-none" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-center border-b border-cyan-500/15 pb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold tracking-wider uppercase text-white flex items-center gap-2">
                      Command Voice Library <span className="text-[10px] text-cyan-500/60 font-normal">v2.4.0</span>
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      STARK OS SYSTEM REPLAY & VOICE REGISTRY INDEX
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVoiceLibraryOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-950/50 hover:bg-slate-950 text-slate-400 hover:text-white border border-cyan-500/10 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs font-sans text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-cyan-500/5 shrink-0">
                Execute complex voice or text directives immediately with a single click. Adding custom commands allows quick access to automation workflows, system monitoring tab flips, or custom image queries.
              </p>

              {/* Search & Add Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
                {/* Search Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search past commands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950/80 border border-cyan-500/15 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/45 focus:ring-1 focus:ring-cyan-500/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Add Custom Command Box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCommandText.trim()) return;
                    setVoiceCommands((prev) => {
                      const clean = newCommandText.trim();
                      return prev.some(c => c.toLowerCase() === clean.toLowerCase()) ? prev : [...prev, clean];
                    });
                    addTerminalLog(`STARK REGISTRY: Manually added command to library: "${newCommandText.trim()}"`, "success");
                    setNewCommandText("");
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Register custom command..."
                    value={newCommandText}
                    onChange={(e) => setNewCommandText(e.target.value)}
                    className="flex-1 bg-slate-950/80 border border-cyan-500/15 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/45 focus:ring-1 focus:ring-cyan-500/30"
                  />
                  <button
                    type="submit"
                    disabled={!newCommandText.trim()}
                    className="px-3 bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-1 transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </form>
              </div>

              {/* Command List Container */}
              <div className="flex-1 overflow-y-auto min-h-[200px] border border-cyan-500/10 rounded-xl bg-slate-950/30 p-2 space-y-1.5 scrollbar-thin">
                {filteredCommands.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <VolumeX className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
                    <p className="font-mono text-xs text-slate-500">
                      No matching command registries found in library.
                    </p>
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => (
                    <div
                      key={cmd}
                      className="group flex items-center justify-between p-2.5 rounded-lg border border-cyan-500/5 hover:border-cyan-500/20 bg-slate-950/40 hover:bg-cyan-500/5 transition-all text-left"
                    >
                      <button
                        onClick={() => {
                          setInputText(cmd);
                          setIsVoiceLibraryOpen(false);
                          addTerminalLog(`STARK REPLAY: Replaying command from registry: "${cmd}"`, "success");
                          handleSendCommand(cmd);
                        }}
                        className="flex-1 flex items-center gap-3 pr-2 cursor-pointer text-left focus:outline-none"
                      >
                        <span className="font-mono text-[9px] text-cyan-500/40 font-bold w-5">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-slate-100 font-bold group-hover:text-cyan-400 transition-all truncate">
                            {cmd}
                          </p>
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block mt-0.5">
                            Status: Ready for Synaptic Re-trigger
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quick Trigger Button */}
                        <button
                          onClick={() => {
                            setInputText(cmd);
                            setIsVoiceLibraryOpen(false);
                            addTerminalLog(`STARK REPLAY: Replaying command from registry: "${cmd}"`, "success");
                            handleSendCommand(cmd);
                          }}
                          className="p-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/20 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider"
                          title="Instant replay command"
                        >
                          <Play className="w-3 h-3" /> Re-trigger
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            setVoiceCommands((prev) => prev.filter((c) => c !== cmd));
                            addTerminalLog(`STARK REGISTRY: Command deleted from voice library: "${cmd}"`, "system");
                          }}
                          className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition-all cursor-pointer"
                          title="Delete command"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer status bar */}
              <div className="border-t border-cyan-500/10 pt-3 flex justify-between items-center text-[9px] font-mono text-slate-500 shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  TOTAL COMMAND REGISTRIES: {voiceCommands.length}
                </span>
                <span>ESC key or click overlay to exit</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
