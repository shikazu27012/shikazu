import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Eye, 
  Image as ImageIcon, 
  Sliders, 
  Compass, 
  Layers, 
  ExternalLink,
  Cpu,
  Bookmark,
  Trash2,
  Minimize2,
  Maximize2
} from "lucide-react";

interface VisionEngineProps {
  onTriggerLog: (text: string, type: "system" | "success" | "error") => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

interface GeneratedImage {
  id: string;
  prompt: string;
  enhancedPrompt: string;
  style: string;
  aspectRatio: string;
  timestamp: string;
  imageBytes: string;
  mimeType: string;
  isFallback: boolean;
}

export default function VisionEngine({ onTriggerLog, isProcessing, setIsProcessing }: VisionEngineProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cyberpunk");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [activeStage, setActiveStage] = useState<string>("Standby");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("jarvis_vision_history");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setHistory(parsed);
        if (parsed.length > 0) {
          setPreviewImage(parsed[0]);
        }
      } catch (err) {
        console.error("Failed to parse cached history", err);
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newImage: GeneratedImage) => {
    const updated = [newImage, ...history].slice(0, 20); // Keep last 20
    setHistory(updated);
    setPreviewImage(newImage);
    localStorage.setItem("jarvis_vision_history", JSON.stringify(updated));
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    setPreviewImage(null);
    localStorage.removeItem("jarvis_vision_history");
    onTriggerLog("Vision cache and neural archives cleared.", "system");
  };

  // Trigger copy prompt
  const copyPromptToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
    onTriggerLog("Holographic prompt signature copied to buffer.", "success");
  };

  // Download Image Helper
  const downloadImage = (image: GeneratedImage) => {
    const link = document.createElement("a");
    link.href = `data:${image.mimeType};base64,${image.imageBytes}`;
    link.download = `jarvis_synthesis_${image.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onTriggerLog(`Downloaded synthesized visual: jarvis_synthesis_${image.id}.jpg`, "success");
  };

  // Image Generation Handler
  const handleSynthesizeImage = async () => {
    if (!prompt.trim() || isSynthesizing || isProcessing) return;

    setIsSynthesizing(true);
    setIsProcessing(true);
    onTriggerLog(`INITIALIZING GRAPHICS SYNTHESIS: "${prompt}"`, "system");

    // Dynamic stage indicator simulation
    const stages = [
      "Interpreting Core Query...",
      "Configuring Aspect Matrix...",
      "Applying Stark HUD Prompt Enhancement...",
      "Connecting to Imagen 3 Neural Network...",
      "Compiling Volumetric Pixels...",
      "Rendering Holographic Textures..."
    ];

    let currentStageIndex = 0;
    setActiveStage(stages[currentStageIndex]);

    const stageTimer = setInterval(() => {
      if (currentStageIndex < stages.length - 1) {
        currentStageIndex++;
        setActiveStage(stages[currentStageIndex]);
      }
    }, 1500);

    try {
      const response = await fetch("/api/jarvis/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio, style })
      });

      if (!response.ok) {
        throw new Error("Synapse uplink failed. Code 500.");
      }

      const data = await response.json();
      clearInterval(stageTimer);

      if (data.success && data.imageBytes) {
        const newImg: GeneratedImage = {
          id: Math.random().toString(36).substring(2, 9).toUpperCase(),
          prompt,
          enhancedPrompt: data.enhancedPrompt || prompt,
          style,
          aspectRatio,
          timestamp: new Date().toLocaleTimeString(),
          imageBytes: data.imageBytes,
          mimeType: data.mimeType || "image/jpeg",
          isFallback: !!data.isFallback
        };

        saveToHistory(newImg);
        
        if (data.isFallback) {
          onTriggerLog("Neural Imagen API offline. Executed Stark local high-res placeholder synthesis.", "system");
        } else {
          onTriggerLog("HOLOGRAPHIC SYNTHESIS COMPLETE: Volumetric asset registered.", "success");
        }
      } else {
        throw new Error(data.error || "Internal model failed to output pixel bytes.");
      }

    } catch (err: any) {
      clearInterval(stageTimer);
      console.error(err);
      onTriggerLog(`SYNTHESIS FAILURE: ${err.message || "Grid compilation timed out."}`, "error");
    } finally {
      setIsSynthesizing(false);
      setIsProcessing(false);
      setActiveStage("Standby");
    }
  };

  // Preset prompts
  const presets = [
    { label: "Stark Arc Reactor Blueprint", prompt: "Close up technical CAD blueprint schematic of a glowing blue iron man arc reactor with neon cybernetic details", style: "blueprint", ratio: "1:1" },
    { label: "Malibu Beach Cyber Laboratory", prompt: "Tony Stark's Malibu mansion laboratory filled with futuristic holographic HUD terminals, server racks, and high-tech tools, looking out to ocean", style: "cyberpunk", ratio: "16:9" },
    { label: "Red Iron Man Helmet Armor", prompt: "Sleek metallic red and gold iron man helmet with glowing cyan eyes, dramatic studio dark lighting, realistic metallic reflections", style: "photorealistic", ratio: "1:1" },
    { label: "Futuristic Stark Supercar", prompt: "A sleek silver and gold high-tech Stark supercar driving through futuristic Malibu streets with neon sunset lights", style: "cyberpunk", ratio: "16:9" }
  ];

  return (
    <div id="vision-engine-card" className="flex flex-col h-full border border-cyan-500/20 rounded-xl bg-slate-950/80 backdrop-blur-md p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-3 shrink-0">
        <span className="font-mono text-xs text-cyan-400 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> JARVIS HOLOGRAPHIC VISION ENGINE
        </span>
        <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">
          SYS STATUS: {isSynthesizing ? "COMPILING" : "STANDBY"}
        </span>
      </div>

      {/* Main Column Split */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden min-h-0">
        
        {/* Left Side: Creation Controls */}
        <div className="flex flex-col space-y-3 overflow-y-auto pr-1">
          
          {/* Quick presets */}
          <div>
            <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest mb-1.5 block">
              <Compass className="w-3 h-3 inline mr-1 text-cyan-500/50" /> Pre-configured Visual Signatures
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(p.prompt);
                    setStyle(p.style);
                    setAspectRatio(p.ratio);
                    onTriggerLog(`Loaded pre-configured signature: ${p.label}`, "system");
                  }}
                  className="p-1.5 text-left font-mono text-[9px] leading-tight bg-slate-900/40 hover:bg-slate-900/80 border border-cyan-500/5 hover:border-cyan-500/20 rounded-md text-cyan-300/80 transition-all truncate"
                  title={p.prompt}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div className="flex flex-col space-y-1">
            <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest flex justify-between">
              <span>Enter Volumetric Prompt</span>
              <span className={`${prompt.length > 250 ? "text-yellow-500" : "text-cyan-500/40"}`}>
                {prompt.length}/300
              </span>
            </span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 300))}
              disabled={isSynthesizing}
              placeholder="Describe the holographic structure, blueprint, or hardware scenery to synthesize..."
              className="w-full h-20 bg-slate-950/60 border border-cyan-500/10 rounded-lg p-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500/30 placeholder:text-cyan-500/20 resize-none"
            />
          </div>

          {/* Matrix Controls */}
          <div className="grid grid-cols-2 gap-3">
            {/* Style Selector */}
            <div className="space-y-1">
              <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest block">
                <Sliders className="w-3 h-3 inline mr-1 text-cyan-500/50" /> Stylization Matrix
              </span>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                disabled={isSynthesizing}
                className="w-full bg-slate-950/60 border border-cyan-500/10 rounded-md p-1.5 text-[10px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/30"
              >
                <option value="cyberpunk">Futuristic Cyberpunk</option>
                <option value="photorealistic">8K Photorealistic</option>
                <option value="blueprint">Stark CAD Blueprint</option>
                <option value="minimalist">Minimalist Modern</option>
                <option value="fantasy">High Fantasy Render</option>
                <option value="vintage">1970s Analog Film</option>
              </select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1">
              <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest block">
                <Layers className="w-3 h-3 inline mr-1 text-cyan-500/50" /> Aspect Matrix
              </span>
              <div className="grid grid-cols-5 gap-1">
                {["1:1", "16:9", "9:16", "4:3", "3:4"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    disabled={isSynthesizing}
                    className={`p-1.5 font-mono text-[9px] rounded transition-all text-center ${
                      aspectRatio === r
                        ? "bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-bold"
                        : "bg-slate-950/40 border border-cyan-500/5 text-slate-500 hover:text-cyan-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Big action button */}
          <button
            onClick={handleSynthesizeImage}
            disabled={isSynthesizing || !prompt.trim() || isProcessing}
            className={`w-full py-2.5 font-mono text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all border ${
              isSynthesizing || !prompt.trim() || isProcessing
                ? "bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed"
                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            }`}
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>SYNTHESIZING: {activeStage}</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>COMPILE HOLOGRAPHIC GRAPHIC</span>
              </>
            )}
          </button>

          {/* Historical Roll */}
          <div className="flex-1 min-h-[100px] flex flex-col pt-2 border-t border-cyan-500/10">
            <div className="flex items-center justify-between mb-1.5 shrink-0">
              <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest block">
                <Bookmark className="w-3 h-3 inline mr-1" /> Vision Log Archives
              </span>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="font-mono text-[8px] text-red-400/60 hover:text-red-400 flex items-center gap-1 uppercase"
                >
                  <Trash2 className="w-3 h-3" /> Purge Cache
                </button>
              )}
            </div>
            
            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-cyan-500/5 rounded-lg p-4 text-center">
                <ImageIcon className="w-6 h-6 text-cyan-500/10 mb-1" />
                <span className="font-mono text-[10px] text-cyan-500/30 uppercase">No visual logs in cache.</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                {history.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setPreviewImage(img)}
                    className={`relative aspect-square border rounded-md overflow-hidden bg-slate-950 transition-all ${
                      previewImage?.id === img.id
                        ? "border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                        : "border-cyan-500/5 hover:border-cyan-500/20"
                    }`}
                  >
                    <img
                      src={`data:${img.mimeType};base64,${img.imageBytes}`}
                      alt={img.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 hover:bg-transparent" />
                    {img.isFallback && (
                      <span className="absolute bottom-0.5 right-0.5 bg-amber-500 text-slate-950 font-mono text-[6px] px-0.5 rounded font-extrabold uppercase scale-90">
                        Local
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Visualizer Canvas Frame */}
        <div className="flex flex-col h-full bg-slate-950/60 border border-cyan-500/10 rounded-xl p-3 relative overflow-hidden min-h-0">
          {/* Outer grid decor */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d405_1px,transparent_1px),linear-gradient(to_bottom,#06b6d405_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="flex items-center justify-between border-b border-cyan-500/5 pb-1.5 mb-2 relative z-10 shrink-0">
            <span className="font-mono text-[9px] text-cyan-400 tracking-wider uppercase flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Volumetric Output Preview
            </span>
            {previewImage && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] text-cyan-500/50">
                  REF: {previewImage.id} ({previewImage.aspectRatio})
                </span>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 bg-slate-900/60 hover:bg-slate-900 border border-cyan-500/10 hover:border-cyan-500/30 rounded text-cyan-400"
                  title="Toggle Fullscreen Projection"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Active Image Canvas Frame */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 z-10">
            <AnimatePresence mode="wait">
              {isSynthesizing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center p-6 text-center"
                >
                  {/* Glowing energy arc */}
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/20 animate-spin" style={{ animationDuration: "12s" }} />
                    <div className="absolute inset-2 rounded-full border border-double border-cyan-400 animate-spin" style={{ animationDuration: "3s" }} />
                    <div className="absolute inset-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest animate-pulse mb-1">
                    SYNTHESIZING MATRIX
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 max-w-[200px] leading-relaxed truncate">
                    {activeStage}
                  </div>
                </motion.div>
              ) : previewImage ? (
                <motion.div
                  key={previewImage.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full flex flex-col justify-between"
                >
                  {/* Image render */}
                  <div className="flex-1 relative rounded-lg border border-cyan-500/10 overflow-hidden bg-slate-950 flex items-center justify-center group">
                    <img
                      src={`data:${previewImage.mimeType};base64,${previewImage.imageBytes}`}
                      alt={previewImage.prompt}
                      referrerPolicy="no-referrer"
                      className={`max-w-full max-h-full object-contain ${
                        previewImage.aspectRatio === "9:16" ? "h-full" : "w-full"
                      }`}
                    />
                    
                    {/* Corner overlay HUD decor */}
                    <div className="absolute top-2 left-2 text-[8px] font-mono bg-slate-950/80 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">
                      IMAGEN_STARK_SENS_V3
                    </div>
                    
                    {/* Glowing scanning line */}
                    <div className="absolute inset-x-0 h-0.5 bg-cyan-400/20 shadow-[0_0_8px_#22d3ee] top-0 animate-bounce" style={{ animationDuration: "6s" }} />
                  </div>

                  {/* Details and Action Controls */}
                  <div className="mt-3 space-y-2 shrink-0">
                    <div className="p-2 bg-slate-900/40 border border-cyan-500/5 rounded-lg">
                      <div className="font-mono text-[9px] text-cyan-400/80 leading-normal line-clamp-2" title={previewImage.prompt}>
                        <span className="text-cyan-500 font-bold uppercase mr-1">Prompt:</span>
                        {previewImage.prompt}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadImage(previewImage)}
                        className="flex-1 py-1.5 font-mono text-[10px] uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-md flex items-center justify-center gap-1.5 transition-all font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Asset
                      </button>

                      <button
                        onClick={() => copyPromptToClipboard(previewImage.prompt)}
                        className="p-1.5 bg-slate-900/60 hover:bg-slate-900 border border-cyan-500/10 hover:border-cyan-500/20 text-cyan-300 rounded-md transition-all flex items-center justify-center"
                        title="Copy prompt signature"
                      >
                        {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center p-6 text-slate-600">
                  <ImageIcon className="w-12 h-12 text-cyan-500/5 mx-auto mb-2" />
                  <p className="font-mono text-xs uppercase text-cyan-500/20">Standby. No visual compilation active.</p>
                  <p className="font-mono text-[9px] text-slate-700 max-w-[180px] mx-auto mt-1 leading-normal">
                    Query prompt and configure matrices to synthesize volumetric imagery.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Fullscreen Overlay Modal projection */}
      <AnimatePresence>
        {isFullscreen && previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col p-6 font-mono text-cyan-100"
          >
            {/* Holographic scanner active overlays */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d403_1px,transparent_1px),linear-gradient(to_bottom,#06b6d403_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-cyan-400/40 pointer-events-none" />
            <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-cyan-400/40 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-cyan-400/40 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-cyan-400/40 pointer-events-none" />

            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-3 mb-4 shrink-0">
              <span className="text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold flex items-center gap-2">
                <Cpu className="w-5 h-5 animate-pulse" /> FULLSCREEN HOLOGRAPHIC PROJECTION MODULE
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded text-xs tracking-wider uppercase transition-all"
              >
                Close Projection
              </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
              {/* Fullscreen Image */}
              <div className="flex-1 border border-cyan-500/10 rounded-xl overflow-hidden bg-slate-900/20 relative flex items-center justify-center p-2">
                <img
                  src={`data:${previewImage.mimeType};base64,${previewImage.imageBytes}`}
                  alt={previewImage.prompt}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(6,182,212,0.15)] rounded"
                />
                
                {/* Horizontal scanning light overlay */}
                <div className="absolute inset-x-0 h-1 bg-cyan-500/30 top-0 shadow-[0_0_12px_#22d3ee] animate-pulse" />
              </div>

              {/* Side Parameters panel */}
              <div className="w-80 flex flex-col justify-between border-l border-cyan-500/10 pl-6 shrink-0">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-cyan-500/40 uppercase tracking-widest block mb-1">Volumetric Prompt</span>
                    <p className="text-xs text-cyan-200 leading-relaxed bg-slate-900/40 border border-cyan-500/5 p-3 rounded-lg">
                      {previewImage.prompt}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-cyan-500/40 uppercase tracking-widest block mb-1">Stark Prompt Enhancement Matrix</span>
                    <p className="text-[11px] text-cyan-400/80 leading-relaxed bg-slate-950/80 border border-cyan-500/5 p-3 rounded-lg">
                      {previewImage.enhancedPrompt}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-cyan-500/40 uppercase tracking-widest block mb-0.5">Asset Ref</span>
                      <span className="text-xs text-cyan-200 uppercase font-bold">{previewImage.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-500/40 uppercase tracking-widest block mb-0.5">Aspect Matrix</span>
                      <span className="text-xs text-cyan-200 font-bold">{previewImage.aspectRatio}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-500/40 uppercase tracking-widest block mb-0.5">Stylization Theme</span>
                      <span className="text-xs text-cyan-200 capitalize font-bold">{previewImage.style}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-500/40 uppercase tracking-widest block mb-0.5">Synthesis Method</span>
                      <span className={`text-xs font-bold ${previewImage.isFallback ? "text-amber-400" : "text-emerald-400"}`}>
                        {previewImage.isFallback ? "Stark Fallback" : "Google Imagen"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => downloadImage(previewImage)}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-1.5 uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                  >
                    <Download className="w-4.5 h-4.5" />
                    Download Asset Archive
                  </button>
                  <button
                    onClick={() => copyPromptToClipboard(previewImage.prompt)}
                    className="w-full py-2 bg-slate-900 border border-cyan-500/20 hover:border-cyan-400/40 text-cyan-300 rounded-lg flex items-center justify-center gap-1.5 uppercase tracking-wider text-xs transition-all"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied Signature!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Prompt Signature</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
