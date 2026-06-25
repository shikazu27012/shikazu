import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  Cpu, 
  Activity, 
  Settings, 
  Zap, 
  Sparkles, 
  Mail, 
  Check, 
  RefreshCw, 
  Grid, 
  Wrench, 
  Plus, 
  Send, 
  Terminal, 
  CheckCircle,
  TrendingUp,
  Sliders,
  Power,
  Copy
} from "lucide-react";

interface ThinkingMatrixProps {
  onTriggerLog: (text: string, type: "system" | "success" | "error" | "user" | "jarvis") => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

interface FeatureModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "automation" | "performance" | "utility";
  status: "uninstalled" | "compiling" | "active";
}

interface AutonomousThought {
  id: string;
  timestamp: string;
  thought: string;
  intensity: number; // 1-100%
  focusArea: string;
}

export default function ThinkingMatrix({ onTriggerLog, isProcessing, setIsProcessing }: ThinkingMatrixProps) {
  const [thoughts, setThoughts] = useState<AutonomousThought[]>([
    {
      id: "thought-1",
      timestamp: new Date().toLocaleTimeString(),
      thought: "Parsing user workflow patterns... Detected multi-step email drafting overhead.",
      intensity: 88,
      focusArea: "INTELLIGENCE ENGINE"
    },
    {
      id: "thought-2",
      timestamp: new Date().toLocaleTimeString(),
      thought: "Analyzing local system cache sectors. Parity block distribution requires alignment.",
      intensity: 65,
      focusArea: "SYSTEM KERNEL"
    },
    {
      id: "thought-3",
      timestamp: new Date().toLocaleTimeString(),
      thought: "Synthesizing optimal presentation structure for office delivery pipelines.",
      intensity: 94,
      focusArea: "OFFICE UTILS"
    }
  ]);

  const [availableFeatures, setAvailableFeatures] = useState<FeatureModule[]>([
    {
      id: "email-automator",
      name: "Smart Mail Task Companion",
      description: "Generates high-fidelity professional drafts and extracts action plans from transcripts autonomously.",
      icon: <Mail className="w-5 h-5 text-cyan-400" />,
      category: "automation",
      status: "uninstalled"
    },
    {
      id: "synapse-booster",
      name: "Synapse Clock Booster",
      description: "Manages system clock multiplier. Simulates deep thread cleaning for performance acceleration.",
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      category: "performance",
      status: "uninstalled"
    },
    {
      id: "power-regulator",
      name: "Quantum Grid Regulator",
      description: "Allocates auxiliary micro-currents. Maximize processing power by balancing cybernetic grid nodes.",
      icon: <Grid className="w-5 h-5 text-amber-400" />,
      category: "utility",
      status: "uninstalled"
    }
  ]);

  // Active App States once compiled
  const [emailSubject, setEmailSubject] = useState("");
  const [emailInstructions, setEmailInstructions] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [savedDrafts, setSavedDrafts] = useState<string[]>([]);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Performance state
  const [boostLevel, setBoostLevel] = useState(40);
  const [isBoosting, setIsBoosting] = useState(false);

  // Power grid state
  const [gridNodes, setGridNodes] = useState([
    { id: "core", name: "Core Node", val: 50, active: true },
    { id: "buffer", name: "I/O Buffer", val: 30, active: false },
    { id: "audio", name: "Acoustic", val: 20, active: true },
    { id: "satellite", name: "Uplink", val: 40, active: false }
  ]);

  // Active Feature UI State
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);

  // Dynamic autonomous thought generator loop
  useEffect(() => {
    const thoughtBank = [
      "Running continuous core temperature scans... Arc reactor flux remains steady.",
      "Syncing network packets. Minor solar flare fluctuation detected on satellite stream.",
      "Optimizing local storage sectors. Clearing temporary telemetry telemetry logs.",
      "Formulating custom styling protocols. Preferred display font Inter is performing optimally.",
      "Drafting potential strategic action files for user's outstanding presentation.",
      "Synthesizing new automation nodes to reduce repetitive copy-paste activities.",
      "Pre-compiling neural pipelines. Memory headroom checked: 4.2 GB available."
    ];

    const interval = setInterval(() => {
      const randomThought = thoughtBank[Math.floor(Math.random() * thoughtBank.length)];
      const focusAreas = ["NEURAL COGITION", "KERNEL MONITOR", "OFFICE DECK", "REACTION REGULATOR", "SYNAPSE STRATEGIST"];
      const newThought: AutonomousThought = {
        id: `thought-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        thought: randomThought,
        intensity: Math.floor(Math.random() * 40) + 60,
        focusArea: focusAreas[Math.floor(Math.random() * focusAreas.length)]
      };

      setThoughts((prev) => [newThought, ...prev.slice(0, 4)]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  // Compile / Install Feature
  const handleInstallFeature = (id: string) => {
    onTriggerLog(`INITIATING system synthesis: Compiling "${id}" modules...`, "system");
    
    // Set status to compiling
    setAvailableFeatures((prev) => 
      prev.map((f) => f.id === id ? { ...f, status: "compiling" } : f)
    );

    setTimeout(() => {
      // Complete installation
      setAvailableFeatures((prev) => 
        prev.map((f) => f.id === id ? { ...f, status: "active" } : f)
      );
      setActiveFeatureId(id);
      onTriggerLog(`SYNTAX SUCCESS: Modular system feature "${id}" compiled and active, Sir.`, "success");
    }, 2800);
  };

  // Generate Email Automation Helper
  const handleGenerateEmail = async () => {
    if (!emailSubject.trim() && !emailInstructions.trim()) {
      onTriggerLog("Please provide instructions or a subject for J.A.R.V.I.S. to formulate the draft.", "error");
      return;
    }

    setIsProcessing(true);
    onTriggerLog("Cognitive engine formulating email content autonomously...", "system");

    try {
      const response = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Formulate a professional Stark-style email draft. Subject: "${emailSubject}". Details/Instructions: "${emailInstructions}".
Respond with ONLY the email draft text, framed inside visual dashes. No introductory conversational filler like 'Here is your draft'.`
        })
      });

      const data = await response.json();
      setGeneratedDraft(data.text || "Draft compilation failed.");
      onTriggerLog("Email draft successfully synthesized! Copied to local draft buffers.", "success");
    } catch (e) {
      // Fallback
      const fallback = `Subject: RE: ${emailSubject || "Stark Systems Synchronization"}\n\nDear recipient,\n\nI hope this message finds you well. Regarding the coordinates for our upcoming project deployment, J.A.R.V.I.S. has finalized the diagnostic checks. We are fully prepared to synchronize local workspace pipelines as scheduled.\n\nPlease let us know if your system architecture is fully aligned.\n\nBest regards,\nStark Operations Group`;
      setGeneratedDraft(fallback);
      onTriggerLog("Autonomously drafted offline fallback template.", "success");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopiedDraft(true);
    onTriggerLog("Email draft copied to clipboard.", "success");
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleSaveDraft = () => {
    setSavedDrafts((prev) => [...prev, generatedDraft]);
    setGeneratedDraft("");
    setEmailSubject("");
    setEmailInstructions("");
    onTriggerLog("Email draft committed to system logs, Sir.", "success");
  };

  const runPerformanceBoost = () => {
    setIsBoosting(true);
    onTriggerLog("ACTIVATING deep cache flush and synapse clock booster...", "system");
    
    setTimeout(() => {
      setBoostLevel((prev) => Math.min(100, prev + 25));
      setIsBoosting(false);
      onTriggerLog("SYNAPSE OPTIMIZATION: Thread scheduler boosted successfully. Execution latency decreased by 40%.", "success");
    }, 2000);
  };

  const toggleNode = (nodeId: string) => {
    setGridNodes((prev) => 
      prev.map((n) => n.id === nodeId ? { ...n, active: !n.active, val: !n.active ? n.val + 10 : n.val - 10 } : n)
    );
    onTriggerLog(`GRID ADJUSTMENT: Synapse node "${nodeId}" balanced.`, "system");
  };

  return (
    <div id="thinking-matrix-card" className="flex flex-col h-full border border-cyan-500/20 rounded-xl bg-slate-950/80 backdrop-blur-md p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden">
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono text-xs text-cyan-300 font-bold tracking-wider">
            NEURAL COGITIATION MATRIX
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-cyan-500/40">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>AUTONOMOUS CORES ACTIVE</span>
        </div>
      </div>

      {/* Main Grid: Split into autonomous stream and feature creator */}
      <div className="flex-1 flex flex-col overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        
        {/* Dynamic Monologue / Monitored Thoughts */}
        <div className="border border-cyan-500/10 bg-slate-900/30 rounded-lg p-3">
          <span className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider block mb-2">
            Dynamic Thought Stream
          </span>
          <div className="space-y-2">
            {thoughts.map((t) => (
              <div key={t.id} className="font-mono text-[10px] flex items-start gap-2 border-b border-cyan-500/5 pb-1.5 last:border-0 last:pb-0">
                <span className="text-cyan-500/30 text-[9px]">{t.timestamp}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-semibold text-[9px] uppercase tracking-wider">
                      [{t.focusArea}]
                    </span>
                    <span className="text-slate-500 text-[8px]">{t.intensity}% priority</span>
                  </div>
                  <p className="text-slate-300 mt-0.5">{t.thought}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Incubator list */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider block">
            J.A.R.V.I.S. Self-Proposed Automations
          </span>

          <div className="space-y-2">
            {availableFeatures.map((feat) => {
              const isActive = feat.status === "active";
              const isCompiling = feat.status === "compiling";

              return (
                <div 
                  key={feat.id} 
                  className={`border rounded-lg p-3 transition-all ${
                    isActive 
                      ? "bg-slate-950/90 border-cyan-500/30" 
                      : "bg-slate-900/10 border-cyan-500/10 hover:border-cyan-500/25"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-900 rounded border border-cyan-500/10">
                        {feat.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          {feat.name}
                        </h4>
                        <span className="text-[9px] font-mono text-cyan-500/50 uppercase">
                          Type: {feat.category}
                        </span>
                      </div>
                    </div>

                    {/* Compile Action button */}
                    {!isActive && !isCompiling && (
                      <button
                        onClick={() => handleInstallFeature(feat.id)}
                        className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono font-bold rounded uppercase transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Plus className="w-3 h-3" /> Synthesis Node
                      </button>
                    )}

                    {isCompiling && (
                      <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[9px] font-mono rounded uppercase flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Compiling...
                      </span>
                    )}

                    {isActive && (
                      <button
                        onClick={() => setActiveFeatureId(activeFeatureId === feat.id ? null : feat.id)}
                        className={`px-2.5 py-1 border text-[9px] font-mono rounded uppercase transition-all flex items-center gap-1 active:scale-95 ${
                          activeFeatureId === feat.id
                            ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        <Check className="w-3 h-3" /> {activeFeatureId === feat.id ? "CLOSE INTERFACE" : "OPEN INTERFACE"}
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono mt-2 leading-relaxed">
                    {feat.description}
                  </p>

                  {/* Nested Active App View once compiled */}
                  <AnimatePresence>
                    {isActive && activeFeatureId === feat.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-cyan-500/10 overflow-hidden"
                      >
                        {/* 1. SMART EMAIL AUTOMATION WIDGET */}
                        {feat.id === "email-automator" && (
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-cyan-500/60 uppercase">Recipient & Subject</span>
                              <input
                                type="text"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="e.g. Pepper Potts - Delivery Coordination"
                                className="w-full bg-slate-950/80 border border-cyan-500/10 rounded p-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500/40 placeholder:text-slate-700"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-cyan-500/60 uppercase">Draft Guidance Prompt</span>
                              <textarea
                                value={emailInstructions}
                                onChange={(e) => setEmailInstructions(e.target.value)}
                                placeholder="Explain delivery delays of reactor parts, verify safety systems..."
                                rows={2}
                                className="w-full bg-slate-950/80 border border-cyan-500/10 rounded p-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500/40 placeholder:text-slate-700 resize-none"
                              />
                            </div>

                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={handleGenerateEmail}
                                disabled={isProcessing}
                                className="px-2.5 py-1 bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-[10px] font-mono font-bold rounded uppercase transition-all flex items-center gap-1 active:scale-95 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> Synthesize Draft
                              </button>
                            </div>

                            {generatedDraft && (
                              <div className="bg-slate-950 border border-cyan-500/15 rounded p-2 mt-2">
                                <div className="flex items-center justify-between border-b border-cyan-500/5 pb-1 mb-1.5">
                                  <span className="text-[8px] font-mono text-cyan-500/40 uppercase">Synthesized Output</span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={handleCopyEmail}
                                      className="p-1 bg-cyan-500/10 text-cyan-400 rounded hover:bg-cyan-500/20 text-[8px] flex items-center gap-1"
                                    >
                                      {copiedDraft ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} COPY
                                    </button>
                                    <button
                                      onClick={handleSaveDraft}
                                      className="p-1 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20 text-[8px] flex items-center gap-1"
                                    >
                                      COMMIT DRAFT
                                    </button>
                                  </div>
                                </div>
                                <pre className="text-[9px] text-slate-300 font-mono whitespace-pre-wrap select-all max-h-[120px] overflow-y-auto">
                                  {generatedDraft}
                                </pre>
                              </div>
                            )}

                            {savedDrafts.length > 0 && (
                              <div className="mt-2 text-[9px] font-mono text-cyan-500/40">
                                🔒 Committed Archives: {savedDrafts.length} drafts stored in secure session logs.
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. SYNAPSE BOOSTER WIDGET */}
                        {feat.id === "synapse-booster" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between font-mono">
                              <span className="text-[9px] text-cyan-500/50 uppercase">Synaptic Throughput Status</span>
                              <span className="text-xs text-cyan-300 font-bold">{boostLevel}% Multiplier</span>
                            </div>

                            {/* visual load line */}
                            <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                              <div 
                                className="h-full bg-emerald-400 shadow-[0_0_8px_#10b981] transition-all duration-1000" 
                                style={{ width: `${boostLevel}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-[9px] font-mono text-slate-500">
                                Latency Level: <strong className="text-emerald-400">{(100 - boostLevel) * 0.15} ms</strong>
                              </div>
                              <button
                                onClick={runPerformanceBoost}
                                disabled={isBoosting || boostLevel >= 100}
                                className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-1 active:scale-95 ${
                                  boostLevel >= 100
                                    ? "bg-slate-900 text-slate-600 cursor-not-allowed border-slate-800"
                                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                                }`}
                              >
                                {isBoosting ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Purging Cache...
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3 h-3" /> Optimise Threads
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 3. QUANTUM POWER REGULATOR */}
                        {feat.id === "power-regulator" && (
                          <div className="space-y-2">
                            <div className="text-[9px] font-mono text-cyan-500/50 uppercase mb-2">
                              Redirect node current flow to optimize Jarvis:
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {gridNodes.map((node) => (
                                <button
                                  key={node.id}
                                  onClick={() => toggleNode(node.id)}
                                  className={`p-2 border rounded font-mono text-[9px] text-left transition-all ${
                                    node.active
                                      ? "bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                                      : "bg-slate-900/30 border-slate-800/40 text-slate-500 hover:border-cyan-500/15"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">{node.name}</span>
                                    <Power className={`w-3 h-3 ${node.active ? "text-cyan-400" : "text-slate-600"}`} />
                                  </div>
                                  <div className="text-[8px] text-slate-500 mt-1">
                                    Current flow: {node.active ? `${node.val} Amp` : "Offline"}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
