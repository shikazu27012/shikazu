import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Presentation, 
  Download, 
  Sparkles, 
  Layers, 
  Terminal, 
  Copy, 
  Check, 
  Monitor, 
  Cpu, 
  AlertCircle,
  HelpCircle,
  FolderSync,
  Play
} from "lucide-react";
import pptxgen from "pptxgenjs";

interface PresentationCoreProps {
  onTriggerLog: (text: string, type: "system" | "success" | "error") => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

interface SlideTheme {
  id: string;
  name: string;
  bgColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  accentBg: string;
  fontFace: string;
  containerClass: string;
  titleClass: string;
  bulletClass: string;
  accentBoxClass: string;
  bulletChar: string;
  borderClass: string;
  showOverlayGrid: boolean;
  glowEffect: string;
}

interface GeneratedSlide {
  title: string;
  content: string[];
  accentText: string;
}

export default function PresentationCore({ onTriggerLog, isProcessing, setIsProcessing }: PresentationCoreProps) {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(6);
  const [selectedTheme, setSelectedTheme] = useState("stark-armor");
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"ppt" | "uplink">("ppt");
  const [isGenerating, setIsGenerating] = useState(false);

  // Themes matching Stark & J.A.R.V.I.S aesthetics
  const themes: SlideTheme[] = [
    {
      id: "stark-armor",
      name: "Stark Armor (Gold & Crimson)",
      bgColor: "111827", // Dark Slate
      titleColor: "EAB308", // Golden Yellow
      textColor: "E2E8F0", // Slate-200
      accentColor: "EF4444", // Crimson Red
      accentBg: "1E1B4B", // Indigo-950/Red blend
      fontFace: "Arial",
      containerClass: "font-sans text-slate-200 tracking-normal",
      titleClass: "font-extrabold tracking-wider uppercase text-yellow-500 text-sm",
      bulletClass: "font-medium text-[10px] text-slate-300",
      accentBoxClass: "border-red-500/30 bg-red-950/20 shadow-[inset_0_0_8px_rgba(239,68,68,0.1)]",
      bulletChar: "▶",
      borderClass: "border-red-500/30",
      showOverlayGrid: true,
      glowEffect: "shadow-[0_0_15px_rgba(239,68,68,0.15)]"
    },
    {
      id: "neuro-link",
      name: "Neuro Link (Cyan & Obsidian)",
      bgColor: "030712", // Pure Dark
      titleColor: "22D3EE", // Bright Cyan
      textColor: "94A3B8", // Slate-400
      accentColor: "06B6D4", // Deep Cyan
      accentBg: "083344", // Deep Cyan Box
      fontFace: "Courier New",
      containerClass: "font-mono text-cyan-100 tracking-tight",
      titleClass: "font-bold tracking-widest uppercase text-cyan-400 text-xs",
      bulletClass: "font-normal text-[9px] text-cyan-200/90",
      accentBoxClass: "border-cyan-500/40 bg-cyan-950/30 shadow-[inset_0_0_12px_rgba(6,182,212,0.2)]",
      bulletChar: "▪",
      borderClass: "border-cyan-500/40",
      showOverlayGrid: true,
      glowEffect: "shadow-[0_0_20px_rgba(34,211,238,0.2)] animate-pulse"
    },
    {
      id: "malibu-retro",
      name: "Malibu Minimal (Sand & Navy)",
      bgColor: "F8FAFC", // Off White
      titleColor: "0F172A", // Dark Slate
      textColor: "334155", // Charcoal
      accentColor: "EAB308", // Sun Gold
      accentBg: "FEF08A", // Soft Yellow
      fontFace: "Georgia",
      containerClass: "font-serif text-slate-800 tracking-wide",
      titleClass: "font-semibold text-slate-950 tracking-normal capitalize text-sm",
      bulletClass: "font-light italic text-[10px] text-slate-700",
      accentBoxClass: "border-amber-300 bg-amber-50 rounded-lg shadow-sm text-slate-800",
      bulletChar: "•",
      borderClass: "border-slate-300",
      showOverlayGrid: false,
      glowEffect: "shadow-md"
    },
    {
      id: "arc-light",
      name: "Arc Light (Teal & Silver)",
      bgColor: "0F172A", // Slate-900
      titleColor: "2DD4BF", // Mint Teal
      textColor: "CBD5E1", // Soft Silver
      accentColor: "0D9488", // Deep Teal
      accentBg: "115E59", // Forest-Teal
      fontFace: "Trebuchet MS",
      containerClass: "font-sans text-slate-100 tracking-wide",
      titleClass: "font-semibold tracking-wide uppercase text-teal-300 text-xs",
      bulletClass: "font-normal text-[10px] text-slate-300",
      accentBoxClass: "border-teal-500/30 bg-teal-950/30 shadow-[inset_0_0_10px_rgba(45,212,191,0.1)]",
      bulletChar: "◆",
      borderClass: "border-teal-500/30",
      showOverlayGrid: true,
      glowEffect: "shadow-[0_0_15px_rgba(45,212,191,0.15)]"
    }
  ];

  // Copy local integration bridge daemon code
  const localDaemonScript = `/**
 * J.A.R.V.I.S. Secure Desktop Sync Uplink Bridge
 * Save as: jarvis-uplink.js
 * Run on local terminal: node jarvis-uplink.js
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

console.log("🎙️ J.A.R.V.I.S. Neural Bridge Active...");
console.log("🔗 Monitoring local system directories for downloads...");

// Watch standard Download folders to automatically launch files when triggered
const downloadDir = path.join(require('os').homedir(), 'Downloads');

fs.watch(downloadDir, (eventType, filename) => {
  if (filename && filename.endsWith('.pptx') && eventType === 'rename') {
    const filePath = path.join(downloadDir, filename);
    
    // Safety check: ensure file exists
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        console.log(\`📦 New PowerPoint Deck Detected: \${filename}\`);
        console.log(\`🚀 Launching direct system PowerPoint interface...\`);
        
        // Execute PowerPoint on system directly
        const command = process.platform === 'win32' 
          ? \`start "" "\${filePath}"\` 
          : process.platform === 'darwin' 
          ? \`open "\${filePath}"\` 
          : \`xdg-open "\${filePath}"\`;
          
        exec(command, (err) => {
          if (err) console.error("❌ Link failed:", err);
          else console.log("✅ PowerPoint opened on your local machine!");
        });
      }
    }, 1200);
  }
});
`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(localDaemonScript);
    setCopiedScript(true);
    onTriggerLog("Copied J.A.R.V.I.S. System Uplink bridge script to clipboard, Sir.", "success");
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Active Slide State for live builder & previewer
  const [slides, setSlides] = useState<GeneratedSlide[]>([
    {
      title: "STARK WORKSPACE AUTOMATION KERNEL",
      content: [
        "Autonomous pipeline diagnostics with J.A.R.V.I.S. assistance",
        "Direct system integration using secure node-to-node link",
        "Interactive PowerPoint deck compilation using client-side vectors"
      ],
      accentText: "Welcome to the slide builder, Sir. You can generate custom presentations or live-edit this outline right now."
    }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const themeConfig = themes.find((t) => t.id === selectedTheme) || themes[0];

  const handleUpdateSlideTitle = (newTitle: string) => {
    setSlides((prev) =>
      prev.map((slide, idx) => (idx === currentSlideIndex ? { ...slide, title: newTitle } : slide))
    );
  };

  const handleUpdateSlideNote = (newNote: string) => {
    setSlides((prev) =>
      prev.map((slide, idx) => (idx === currentSlideIndex ? { ...slide, accentText: newNote } : slide))
    );
  };

  const handleUpdateSlideBullet = (bulletIdx: number, newVal: string) => {
    setSlides((prev) =>
      prev.map((slide, idx) => {
        if (idx === currentSlideIndex) {
          const updatedContent = [...slide.content];
          updatedContent[bulletIdx] = newVal;
          return { ...slide, content: updatedContent };
        }
        return slide;
      })
    );
  };

  const handleAddSlideBullet = () => {
    setSlides((prev) =>
      prev.map((slide, idx) => {
        if (idx === currentSlideIndex) {
          return { ...slide, content: [...slide.content, "New tactical system bullet point."] };
        }
        return slide;
      })
    );
  };

  const handleRemoveSlideBullet = (bulletIdx: number) => {
    setSlides((prev) =>
      prev.map((slide, idx) => {
        if (idx === currentSlideIndex) {
          return { ...slide, content: slide.content.filter((_, bIdx) => bIdx !== bulletIdx) };
        }
        return slide;
      })
    );
  };

  const handleAddSlide = () => {
    const newSlide: GeneratedSlide = {
      title: "NEW SECTOR COMPLIANCE CHECKLIST",
      content: [
        "Enter system overview point.",
        "Verify standard microgrid connectivity."
      ],
      accentText: "A newly synthesized slide canvas, Sir."
    };
    setSlides((prev) => [...prev, newSlide]);
    setCurrentSlideIndex(slides.length);
    onTriggerLog("Appended new blank slide canvas, Sir.", "system");
  };

  const handleRemoveSlide = (idxToRemove: number) => {
    if (slides.length <= 1) {
      onTriggerLog("At least one slide canvas must remain in the deck array.", "error");
      return;
    }
    const updated = slides.filter((_, idx) => idx !== idxToRemove);
    setSlides(updated);
    setCurrentSlideIndex(Math.max(0, idxToRemove - 1));
    onTriggerLog("Ejected selected slide from deck array.", "system");
  };

  // Run PPT generation sequence
  const handleGeneratePresentation = async () => {
    if (!topic.trim()) {
      onTriggerLog("Please provide a topic or prompt for slide compilation, Sir.", "error");
      return;
    }

    setIsGenerating(true);
    setIsProcessing(true);
    onTriggerLog(`INITIALIZING slide generation: "${topic}" using Selected Theme.`, "system");

    try {
      // 1. Fetch structured slide topics from AI or use local high-quality heuristic model
      onTriggerLog("Syncing with JARVIS Brain core to formulate presentation outline...", "system");
      
      let slidesData: GeneratedSlide[] = [];

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Generate a structured presentation outline on: "${topic}". 
Produce exactly ${slideCount} slides.
The slides should follow a logical narrative: Title/Intro, Background, Problem, Innovation, Architecture/Implementation, Conclusion/Summary.
Output MUST be a JSON array only. Return NOTHING except raw valid JSON. Do not include markdown code block syntax. 
JSON signature:
[
  {
    "title": "Slide Title",
    "content": ["bullet point 1", "bullet point 2", "bullet point 3"],
    "accentText": "Witty J.A.R.V.I.S. speaker note or advice"
  }
]`
          })
        });

        const data = await response.json();
        
        // Extract JSON block from the text response
        let textResult = data.text || "";
        // Clean markdown quotes
        textResult = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const jsonMatch = textResult.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          slidesData = JSON.parse(jsonMatch[0]);
        } else {
          // Attempt raw parse
          slidesData = JSON.parse(textResult);
        }
      } catch (e) {
        console.warn("Gemini output parsing failed, falling back to heuristic slide compiler.", e);
      }

      // 2. Fallback heuristic generator if API parsing is unavailable
      if (!slidesData || slidesData.length === 0) {
        onTriggerLog("Activating offline heuristic slide template for slide compiler.", "system");
        
        slidesData = Array.from({ length: slideCount }).map((_, i) => {
          const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
          if (i === 0) {
            return {
              title: `${capitalizedTopic}: Project Overview`,
              content: [
                `Direct telemetry overview of ${capitalizedTopic} initiatives.`,
                "Syncing cybernetic protocols and system frameworks.",
                "Strategic overview of multi-tier modular arrays."
              ],
              accentText: "A strategic overview of our objectives, Sir."
            };
          } else if (i === slideCount - 1) {
            return {
              title: "Futuristic Core Vision & Diagnostics",
              content: [
                "Re-calibrating next-generation arc system telemetry.",
                "Implementing active error recovery on local node grids.",
                "Stable communications established across all global sectors."
              ],
              accentText: "Absolute nominal operational conditions guaranteed."
            };
          } else {
            return {
              title: `System Phase ${i + 1}: Implementation`,
              content: [
                `Optimizing resource distribution for ${capitalizedTopic}.`,
                "Running continuous diagnostic checks and packet-validation metrics.",
                "High-frequency websocket linkages and state persistence verified."
              ],
              accentText: `Tactical advancement of block ${i + 1} finalized.`
            };
          }
        });
      }

      setSlides(slidesData);
      setCurrentSlideIndex(0);
      onTriggerLog("PowerPoint deck outline successfully loaded into interactive previewer below, Sir.", "success");

    } catch (error: any) {
      console.error("PPTX Outline Fetch Error:", error);
      onTriggerLog(`PPTX build outline error: ${error.message || error}`, "error");
    } finally {
      setIsGenerating(false);
      setIsProcessing(false);
    }
  };

  const handleExportPPTX = async () => {
    setIsGenerating(true);
    setIsProcessing(true);
    onTriggerLog("Exporting slide deck array to local PowerPoint stream...", "system");

    try {
      const ppt = new pptxgen();
      ppt.layout = "LAYOUT_16x9";

      slides.forEach((slideItem, index) => {
        const slide = ppt.addSlide();
        slide.background = { fill: themeConfig.bgColor };

        slide.addText("STARK INDUSTRIES • presentation core v1.3", {
          x: 0.5,
          y: 0.2,
          w: 6,
          h: 0.3,
          fontSize: 8,
          fontFace: "Arial",
          color: themeConfig.accentColor,
          bold: true
        });

        slide.addText(`SLIDE DECK: 0${index + 1} / 0${slides.length}`, {
          x: 10.5,
          y: 0.2,
          w: 2.3,
          h: 0.3,
          fontSize: 8,
          fontFace: "Arial",
          color: themeConfig.accentColor,
          align: "right",
          bold: true
        });

        slide.addShape(ppt.ShapeType.rect, {
          x: 0.5,
          y: 0.5,
          w: 12.3,
          h: 0.02,
          fill: { color: themeConfig.accentColor }
        });

        slide.addText(slideItem.title.toUpperCase(), {
          x: 0.5,
          y: 0.7,
          w: 11.5,
          h: 0.8,
          fontSize: 26,
          fontFace: themeConfig.fontFace,
          color: themeConfig.titleColor,
          bold: true
        });

        const bulletPoints = slideItem.content.map((point) => {
          return { text: `  •  ${point}`, options: { fontSize: 15, color: themeConfig.textColor, lineSpacing: 24 } };
        });

        slide.addText(bulletPoints, {
          x: 0.5,
          y: 1.8,
          w: 7.5,
          h: 4.5,
          fontFace: themeConfig.fontFace
        });

        slide.addShape(ppt.ShapeType.roundRect, {
          x: 8.5,
          y: 1.8,
          w: 4.3,
          h: 4.5,
          fill: { color: themeConfig.accentBg },
          line: { color: themeConfig.accentColor, width: 1 }
        });

        slide.addText("JARVIS SYNAPSE INTERFACE", {
          x: 8.7,
          y: 2.0,
          w: 3.9,
          h: 0.3,
          fontSize: 10,
          fontFace: "Arial",
          color: themeConfig.accentColor,
          bold: true
        });

        slide.addText(slideItem.accentText, {
          x: 8.7,
          y: 2.4,
          w: 3.9,
          h: 3.6,
          fontSize: 12,
          fontFace: themeConfig.fontFace,
          color: themeConfig.textColor,
          italic: true
        });
      });

      const finalFilename = `${topic.trim() ? topic.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "stark-autonomous"}-deck.pptx`;
      await ppt.writeFile({ fileName: finalFilename });
      onTriggerLog("PowerPoint deck compiled successfully! Direct local download triggered.", "success");
    } catch (e: any) {
      onTriggerLog(`PowerPoint compile fail: ${e.message || e}`, "error");
    } finally {
      setIsGenerating(false);
      setIsProcessing(false);
    }
  };

  return (
    <div id="presentation-core-card" className="flex flex-col h-full border border-cyan-500/20 rounded-xl bg-slate-950/80 backdrop-blur-md p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden">
      
      {/* Tab Switcher Headers */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-3 shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("ppt")}
            className={`font-mono text-xs tracking-wider flex items-center gap-1.5 px-2 py-1 rounded transition-all ${
              activeSubTab === "ppt"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                : "text-slate-500 hover:text-cyan-400/80"
            }`}
          >
            <Presentation className="w-4 h-4" /> PPTX GENERATOR & PREVIEW
          </button>
          <button
            onClick={() => setActiveSubTab("uplink")}
            className={`font-mono text-xs tracking-wider flex items-center gap-1.5 px-2 py-1 rounded transition-all ${
              activeSubTab === "uplink"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                : "text-slate-500 hover:text-cyan-400/80"
            }`}
          >
            <Monitor className="w-4 h-4" /> SYSTEM ACCESS UPLINK
          </button>
        </div>
        <span className="font-mono text-[9px] text-cyan-500/40 uppercase tracking-widest hidden sm:inline">
          OFFICE UTILS CORE
        </span>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === "ppt" ? (
          <motion.div
            key="ppt-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex flex-col flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin"
          >
            {/* Slide topic configuration */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider block">
                Presentation Topic / Prompt
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Q3 Stark Arc Reactor Energy Diagnostics, AI Future..."
                className="w-full bg-slate-900/60 border border-cyan-500/15 rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
              />
            </div>

            {/* Theme & Config Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Theme Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider block">
                  Stark Slide Deck Theme
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-1.5 text-[10px] rounded text-left font-mono border transition-all ${
                        selectedTheme === theme.id
                          ? "bg-cyan-500/10 border-cyan-400 text-cyan-300"
                          : "bg-slate-900/30 border-cyan-500/5 text-slate-500 hover:border-cyan-500/20"
                      }`}
                    >
                      <div className="font-semibold text-white text-[10px]">{theme.name.split(" ")[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider count */}
              <div className="flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider block">
                    AI Slide Count: <span className="text-cyan-400 font-semibold">{slideCount} Slides</span>
                  </span>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    value={slideCount}
                    onChange={(e) => setSlideCount(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 mt-1"
                  />
                </div>

                <button
                  onClick={handleGeneratePresentation}
                  disabled={isGenerating || isProcessing}
                  className={`w-full py-2 text-[10px] uppercase tracking-wider font-mono font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all mt-2 ${
                    isGenerating || isProcessing
                      ? "bg-cyan-500/10 text-cyan-500/60 border-cyan-500/10 animate-pulse cursor-not-allowed"
                      : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 border-cyan-400 active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" /> COMPILING...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> AI OUTLINE
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive Slide Builder & Preview Canvas */}
            <div className={`border rounded-lg overflow-hidden bg-slate-950 flex flex-col transition-all duration-300 ${themeConfig.borderClass} ${themeConfig.glowEffect}`}>
              <div className="flex items-center justify-between bg-slate-900/80 px-3 py-1.5 border-b border-cyan-500/10 shrink-0">
                <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Presentation className="w-3.5 h-3.5 animate-pulse" /> Live Render Preview: <strong className="text-white">{themeConfig.name}</strong>
                </span>
                <span className="font-mono text-[9px] text-slate-400">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </span>
              </div>

              {/* Live Render Canvas matching Theme specifications */}
              <div 
                className={`aspect-[16/9] w-full p-4 flex flex-col justify-between relative select-none overflow-hidden transition-all duration-300 border-b ${themeConfig.borderClass} ${themeConfig.containerClass}`}
                style={{ backgroundColor: `#${themeConfig.bgColor}` }}
              >
                {/* Optional Grid Lines Overlay */}
                {themeConfig.showOverlayGrid && (
                  <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:8px_8px]" />
                )}

                {/* Custom watermark metadata */}
                <div className="flex items-center justify-between opacity-60 pointer-events-none mb-1 z-10">
                  <span className="text-[8px] uppercase tracking-widest font-mono font-bold" style={{ color: `#${themeConfig.accentColor}` }}>
                    STARK INDUSTRIES • presentation core v1.3
                  </span>
                  <span className="text-[8px] uppercase tracking-widest font-mono font-bold" style={{ color: `#${themeConfig.accentColor}` }}>
                    SLIDE 0{currentSlideIndex + 1}
                  </span>
                </div>

                <div className="w-full h-[1px] mb-2 z-10" style={{ backgroundColor: `#${themeConfig.accentColor}`, opacity: 0.3 }} />

                {/* Grid layout for Bullet points and Synapse interface block */}
                <div className="grid grid-cols-3 gap-3 flex-1 overflow-hidden items-start pt-1 z-10">
                  {/* Left bullet column (col-span-2) */}
                  <div className="col-span-2 flex flex-col justify-start h-full overflow-hidden">
                    {/* Interactive Slide Title */}
                    <input
                      type="text"
                      value={slides[currentSlideIndex]?.title || ""}
                      onChange={(e) => handleUpdateSlideTitle(e.target.value)}
                      style={{ color: `#${themeConfig.titleColor}` }}
                      className={`bg-transparent border-b border-transparent hover:border-cyan-500/20 focus:border-cyan-500/50 focus:outline-none mb-2 w-full truncate py-0.5 focus:bg-slate-900/30 px-1 rounded transition-all duration-200 ${themeConfig.titleClass}`}
                    />

                    {/* Bullet list */}
                    <ul className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-thin pr-1">
                      {slides[currentSlideIndex]?.content.map((point, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-1.5 group">
                          <span className="text-xs shrink-0 select-none transition-transform duration-300 group-hover:scale-125" style={{ color: `#${themeConfig.accentColor}` }}>
                            {themeConfig.bulletChar}
                          </span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => handleUpdateSlideBullet(bIdx, e.target.value)}
                            style={{ color: `#${themeConfig.textColor}` }}
                            className={`leading-relaxed bg-transparent border-b border-transparent hover:border-cyan-500/15 focus:border-cyan-500/40 focus:outline-none flex-1 py-0 px-1 focus:bg-slate-900/20 rounded ${themeConfig.bulletClass}`}
                          />
                          <button 
                            onClick={() => handleRemoveSlideBullet(bIdx)}
                            className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-500 text-[8px] font-mono px-0.5 shrink-0 transition-opacity"
                            title="Remove bullet point"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Add Bullet action */}
                    <button 
                      onClick={handleAddSlideBullet}
                      className="text-[9px] font-mono hover:brightness-125 mt-1 self-start flex items-center gap-1 transition-all"
                      style={{ color: `#${themeConfig.accentColor}` }}
                    >
                      + Add bullet point
                    </button>
                  </div>

                  {/* Right J.A.R.V.I.S Synapse panel */}
                  <div 
                    className={`h-full p-2 rounded border flex flex-col justify-between overflow-hidden text-[9px] leading-snug transition-all duration-300 ${themeConfig.accentBoxClass}`}
                    style={{ 
                      borderColor: `#${themeConfig.accentColor}`,
                      opacity: 0.95
                    }}
                  >
                    <div>
                      <span className="font-mono font-bold uppercase tracking-wider block mb-1 text-[8px]" style={{ color: `#${themeConfig.accentColor}` }}>
                        JARVIS SPEAKER ASSIST
                      </span>
                      <textarea
                        value={slides[currentSlideIndex]?.accentText || ""}
                        onChange={(e) => handleUpdateSlideNote(e.target.value)}
                        style={{ color: `#${themeConfig.textColor}` }}
                        rows={3}
                        className="w-full bg-transparent border border-transparent hover:border-cyan-500/10 focus:border-cyan-500/30 focus:outline-none resize-none text-[9px] leading-tight"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Canvas Action toolbar */}
              <div className="flex items-center justify-between bg-slate-900/60 p-2 text-xs shrink-0 font-mono">
                {/* Left/Right carousel steps */}
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex((prev) => prev - 1)}
                    className="px-2 py-0.5 bg-slate-900 border border-cyan-500/10 text-cyan-400 rounded hover:bg-cyan-500/10 disabled:opacity-30 disabled:cursor-not-allowed text-[10px]"
                  >
                    ◀ PREV
                  </button>
                  <button
                    disabled={currentSlideIndex === slides.length - 1}
                    onClick={() => setCurrentSlideIndex((prev) => prev + 1)}
                    className="px-2 py-0.5 bg-slate-900 border border-cyan-500/10 text-cyan-400 rounded hover:bg-cyan-500/10 disabled:opacity-30 disabled:cursor-not-allowed text-[10px]"
                  >
                    NEXT ▶
                  </button>
                </div>

                {/* Slide operations */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleAddSlide}
                    className="px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 rounded text-[9px] uppercase"
                  >
                    + ADD SLIDE
                  </button>
                  <button
                    onClick={() => handleRemoveSlide(currentSlideIndex)}
                    className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded text-[9px] uppercase"
                  >
                    DELETE SLIDE
                  </button>
                </div>
              </div>
            </div>

            {/* Direct Export to PowerPoint Suit */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPPTX}
                disabled={isGenerating || isProcessing}
                className="flex-1 py-2.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 border border-emerald-400 font-mono font-bold rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                <Download className="w-4 h-4" /> Export PPTX PowerPoint Deck
              </button>
            </div>

            {/* Direct PPT explanation banner */}
            <div className="bg-slate-900/40 border border-cyan-500/10 rounded-lg p-2.5 font-mono text-[10px] text-cyan-500/70 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Configure your topics above, customize the generated bullet points and titles on the live slide preview canvas in real-time, then hit export. The local sync daemon monitors any exports and opens PowerPoint directly on your computer!
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="uplink-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col flex-1 overflow-y-auto pr-1 space-y-3"
          >
            {/* High Tech System Access description */}
            <div className="space-y-1 text-xs leading-relaxed font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-bold uppercase tracking-wider">
                <Cpu className="w-4 h-4" /> SECURE LOCAL AGENT DAEMON
              </div>
              <p className="text-[10px] text-slate-400">
                To guarantee absolute browser sandboxing security, web applications cannot execute physical scripts or launch desktop apps on your host OS directly.
              </p>
              <p className="text-[10px] text-cyan-500/80">
                To bridge JARVIS with your local Microsoft Office PowerPoint Suite instantly, configure this secure, zero-dependency Node daemon on your system:
              </p>
            </div>

            {/* Daemon Script Container */}
            <div className="relative border border-cyan-500/15 rounded-lg bg-slate-950 p-2 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-cyan-500/5 pb-1 mb-1.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-cyan-500/60" /> jarvis-uplink.js
                </span>
                <button
                  onClick={copyScriptToClipboard}
                  className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 rounded hover:bg-cyan-500/20 transition-all"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> COPY CODE
                    </>
                  )}
                </button>
              </div>

              {/* Readonly preview */}
              <pre className="text-[9px] text-slate-400 font-mono overflow-x-auto select-all max-h-[120px] scrollbar-thin">
                {localDaemonScript}
              </pre>
            </div>

            {/* Launch Instructions */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="border border-cyan-500/5 bg-slate-900/30 p-2 rounded">
                <span className="text-cyan-400 uppercase font-semibold block mb-0.5">Step 1: Setup</span>
                Paste into a local file <code className="text-slate-300">jarvis-uplink.js</code> and launch it using <code className="text-cyan-300">node jarvis-uplink.js</code>.
              </div>
              <div className="border border-cyan-500/5 bg-slate-900/30 p-2 rounded">
                <span className="text-cyan-400 uppercase font-semibold block mb-0.5">Step 2: Connect</span>
                Download any PPTX deck. Your local daemon detects it and launches PowerPoint on your desktop instantly!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

