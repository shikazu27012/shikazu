import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  Globe,
  Shield,
  ArrowRight,
  TrendingUp,
  Cpu,
  Lock,
  Download,
  CheckCircle,
  Clock,
  Briefcase,
  Sparkles,
  Zap,
  Check,
  AlertCircle
} from "lucide-react";
import pptxgen from "pptxgenjs";

interface RoadmapProps {
  onTriggerLog: (text: string, type: "system" | "success" | "error" | "user" | "jarvis") => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

interface RoadmapItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  pillBg: string;
  textColor: string;
  accentColor: string;
  overview: string;
  benefits: string[];
  strategy: {
    phase: string;
    timeline: string;
    title: string;
    details: string;
  }[];
  businessImpact: {
    metric: string;
    description: string;
    roi: string;
  };
}

export default function ArchitectureRoadmap({ onTriggerLog, isProcessing, setIsProcessing }: RoadmapProps) {
  const [activeTab, setActiveTab] = useState<"modular" | "scalability" | "security">("modular");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [isExporting, setIsExporting] = useState(false);

  const roadmapData: { [key: string]: RoadmapItem } = {
    modular: {
      id: "modular",
      title: "Modular Service-Oriented Architecture (SOA)",
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      color: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      bgColor: "bg-cyan-950/10",
      pillBg: "bg-cyan-500/10",
      textColor: "text-cyan-200",
      accentColor: "06B6D4",
      overview: "Complete decoupling of frontend, backend, AI orchestration engines, neural memory graphs, and third-party enterprise integrations. By treating each core capability as an independent service boundary, the ecosystem ensures elastic service scaling, rapid continuous deployment, and modular future-proofing.",
      benefits: [
        "Independent Service Deployment: Deploy, patch, and scale microservices independently with zero system downtime.",
        "Agnostic AI Integration Substrate: Hot-swap or parallel-route across LLMs, local SLMs, or vision APIs without core database refactoring.",
        "Ejected Development Velocity: Separates visual components from backend logic, allowing specialized developer guilds to build concurrently.",
        "Fault Isolation & Isolation Boundaries: A critical exception in an automation adapter or database connection cannot degrade core messaging pipelines."
      ],
      strategy: [
        {
          phase: "Phase 1: Foundation Refactoring",
          timeline: "Q3 2026",
          title: "Service Boundaries & API Contracts",
          details: "Deconstruct monolithic controllers into isolated Express endpoints, establishing strict OpenAPI/Swagger contracts. Migrate client-only operations to static SPA storage, preparing container builds for production deployment."
        },
        {
          phase: "Phase 2: Event-Driven Fabric",
          timeline: "Q4 2026",
          title: "Pub/Sub Bus & GraphQL Federation",
          details: "Integrate a robust event bus (RabbitMQ/Kafka) for real-time distributed updates. Orchestrate front-facing microservices via a federated GraphQL gateway to maximize client querying performance and data retrieval density."
        },
        {
          phase: "Phase 3: Ecosystem SDKs",
          timeline: "Q1 2027",
          title: "gRPC Hub & Modular Plug-In Architecture",
          details: "Publish high-speed gRPC service endpoints. Deliver a developer SDK enabling enterprise clients to register bespoke AI-agents and enterprise automation modules directly into the unified runtime."
        }
      ],
      businessImpact: {
        metric: "45% Reduction in Time-To-Market",
        description: "Eliminates systemic architectural lock-in, enabling enterprise clients to adopt newly published foundational AI models in hours rather than quarters.",
        roi: "Slashes developer onboarding times by 50% and reduces technical debt remediation overhead by $220k annually."
      }
    },
    scalability: {
      id: "scalability",
      title: "Elastic Enterprise Scalability",
      icon: <Globe className="w-5 h-5 text-emerald-400" />,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-950/10",
      pillBg: "bg-emerald-500/10",
      textColor: "text-emerald-200",
      accentColor: "10B981",
      overview: "A highly resilient, multi-region cloud-native infrastructure engineered to effortlessly support millions of concurrent business workflows, automated API runs, and interactive AI sessions with stable sub-100ms response latencies.",
      benefits: [
        "Elastic Container Auto-Scaling: Real-time container spin-up and scale-out based on inbound requests, queuing backlog, or CPU profiling.",
        "Multi-Region Edge Caching: Anycast DNS routing combined with intelligent CDN edge caching delivers ultra-low latency globally.",
        "High-Availability Failover (99.99% SLA): Automated Active-Active clusters across multiple zones prevent single-points-of-failure.",
        "Distributed Synaptic Storage: Resilient Redis caching clusters paired with scalable cloud data systems guarantee real-time session state."
      ],
      strategy: [
        {
          phase: "Phase 1: Infrastructure as Code",
          timeline: "Q3 2026",
          title: "Terraform & Kubernetes Clustering",
          details: "Establish immutable Infrastructure-as-Code (IaC) via Terraform. Deploy production-grade Kubernetes (EKS/GKE) clusters with Horizontal Pod Autoscalers (HPA) and automated Node provisioning."
        },
        {
          phase: "Phase 2: Synaptic Cache Layer",
          timeline: "Q4 2026",
          title: "Redis Clustering & CDN Offloading",
          details: "Provision high-speed distributed Redis Enterprise cache layers to handle user session states and AI conversation buffers. Deploy global edge endpoints to offload asset delivery."
        },
        {
          phase: "Phase 3: Global Mesh & Chaos",
          timeline: "Q1 2027",
          title: "Active-Active Multi-Region Replication",
          details: "Initiate globally replicated database fabrics. Conduct proactive Chaos Engineering tests to prove automatic sub-60s recovery times during simulated zone failures."
        }
      ],
      businessImpact: {
        metric: "99.99% Continuous Operational Uptime",
        description: "Assures persistent system availability for mission-critical enterprise workflows and investor-facing public demonstrations during peak traffic spikes.",
        roi: "Saves up to 35% in infrastructure expenditure via scale-to-zero compute profiling during non-business periods."
      }
    },
    security: {
      id: "security",
      title: "Security, Privacy & Responsible AI",
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      color: "text-rose-400",
      borderColor: "border-rose-500/30",
      bgColor: "bg-rose-950/10",
      pillBg: "bg-rose-500/10",
      textColor: "text-rose-200",
      accentColor: "F43F5E",
      overview: "Enterprise-grade defensive engineering and ethical AI governance protocols. Designed to secure sensitive client data, block advanced injection vectors, and enforce strict regulatory compliance.",
      benefits: [
        "Zero-Trust Authentication: Seamless SAML 2.0 / OIDC integrations with granular role-based access control (RBAC) schemas.",
        "Defense-In-Depth Encryption: Military-grade AES-256 encryption at rest and TLS 1.3 in transit with Hardware Security Module (HSM) keys.",
        "Active Synaptic Guardrail Pipelines: Content moderation filters that sanitize prompts and block malicious script injections.",
        "Tamper-Proof Audit Logging: Cryptographically sealed, immutable ledger tracking data access to facilitate internal corporate audits."
      ],
      strategy: [
        {
          phase: "Phase 1: Zero-Trust Hardening",
          timeline: "Q3 2026",
          title: "SAML/OIDC Auth & HSM Encryption",
          details: "Deploy enterprise Single Sign-On (SSO) interfaces. Establish strict envelope-encryption policies for PII data using KMS-backed master keys."
        },
        {
          phase: "Phase 2: AI Guardrail Pipelines",
          timeline: "Q4 2026",
          title: "Real-time Prompt and Response Interceptors",
          details: "Embed real-time inspection layers (e.g., NeMo Guardrails) to scan conversational inputs. Prevent prompt-injection, PII leakage, and AI hallucination propagation."
        },
        {
          phase: "Phase 3: Compliance Certification",
          timeline: "Q1 2027",
          title: "SOC 2 Type II, ISO 27001 & HIPAA Readiness",
          details: "Conduct independent third-party penetration testing. Align policies and implement continuous monitoring to secure SOC 2 Type II and ISO 27001 certifications."
        }
      ],
      businessImpact: {
        metric: "100% Data Sovereignty Compliance",
        description: "Zero-leakage guarantees safeguard corporate intellectual property and secure regulatory standing under global mandates.",
        roi: "Mitigates multi-million dollar regulatory risk while acting as an direct catalyst to win security-sensitive government and financial contracts."
      }
    }
  };

  const handleExportPPTX = async () => {
    setIsExporting(true);
    setIsProcessing(true);
    onTriggerLog("Compiling world-class enterprise architecture presentation deck...", "system");

    try {
      const ppt = new pptxgen();
      ppt.layout = "LAYOUT_16x9";

      // --- SLIDE 1: Title & Vision ---
      const slide1 = ppt.addSlide();
      slide1.background = { fill: "090D1A" }; // Royal Dark Obsidian

      // Tech Mark Accent lines
      slide1.addShape(ppt.ShapeType.rect, { x: 0.5, y: 0.5, w: 12.3, h: 0.03, fill: { color: "06B6D4" } });
      
      slide1.addText("STARK INDUSTRIES • GLOBAL SYSTEMS ROADMAP", {
        x: 0.5, y: 0.6, w: 10, h: 0.4, fontSize: 10, fontFace: "Courier New", color: "06B6D4", bold: true
      });

      slide1.addText("THE ENTERPRISE AI ROADMAP", {
        x: 0.5, y: 1.5, w: 11.5, h: 1.0, fontSize: 38, fontFace: "Arial", color: "FFFFFF", bold: true
      });

      slide1.addText("A World-Class, Production-Ready Architectural Vision", {
        x: 0.5, y: 2.4, w: 11.5, h: 0.5, fontSize: 18, fontFace: "Arial", color: "22D3EE", italic: true
      });

      slide1.addShape(ppt.ShapeType.roundRect, {
        x: 0.5, y: 3.5, w: 12.3, h: 2.2, fill: { color: "0E172C" }, line: { color: "1E293B", width: 1 }
      });

      slide1.addText("GLOBAL MISSION STATEMENT", {
        x: 0.8, y: 3.7, w: 11, h: 0.3, fontSize: 11, fontFace: "Courier New", color: "EAB308", bold: true
      });

      slide1.addText(
        "\"Create a secure, scalable, intelligent, and future-ready AI ecosystem capable of supporting real-world deployment, enterprise workloads, and long-term innovation while delivering exceptional user experiences.\"",
        {
          x: 0.8, y: 4.1, w: 11.5, h: 1.3, fontSize: 18, fontFace: "Arial", color: "E2E8F0", italic: true, lineSpacing: 24
        }
      );

      slide1.addText("CONFIDENTIAL • FOR BOARD & INVESTOR REVIEW ONLY", {
        x: 0.5, y: 6.8, w: 6, h: 0.3, fontSize: 8, fontFace: "Arial", color: "475569"
      });

      // --- SLIDES 2, 3, 4: Area Breakdowns ---
      Object.values(roadmapData).forEach((area, index) => {
        const slide = ppt.addSlide();
        slide.background = { fill: "0F172A" }; // Deep Corporate Slate

        // Watermark header
        slide.addText(`PILLAR 0${index + 1} / 03: ${area.title.toUpperCase()}`, {
          x: 0.5, y: 0.3, w: 10, h: 0.3, fontSize: 9, fontFace: "Courier New", color: area.accentColor, bold: true
        });
        slide.addShape(ppt.ShapeType.rect, { x: 0.5, y: 0.6, w: 12.3, h: 0.02, fill: { color: area.accentColor } });

        // Overview
        slide.addText("EXECUTIVE OVERVIEW", {
          x: 0.5, y: 0.9, w: 4, h: 0.3, fontSize: 10, fontFace: "Arial", color: "94A3B8", bold: true
        });
        slide.addText(area.overview, {
          x: 0.5, y: 1.2, w: 6.8, h: 1.6, fontSize: 13, fontFace: "Arial", color: "E2E8F0", lineSpacing: 20
        });

        // Benefits (Checklist style)
        slide.addText("KEY ENTERPRISE BENEFITS", {
          x: 0.5, y: 3.0, w: 4, h: 0.3, fontSize: 10, fontFace: "Arial", color: "94A3B8", bold: true
        });

        const benefitsBullets = area.benefits.map((b) => {
          const split = b.split(": ");
          return [
            { text: "✔  ", options: { bold: true, color: area.accentColor } },
            { text: split[0] + ": ", options: { bold: true, color: "FFFFFF" } },
            { text: split[1], options: { color: "CBD5E1" } }
          ];
        });

        benefitsBullets.forEach((bulletArr, bIdx) => {
          slide.addText(bulletArr, {
            x: 0.5, y: 3.3 + (bIdx * 0.75), w: 6.8, h: 0.65, fontSize: 10.5, fontFace: "Arial", lineSpacing: 14
          });
        });

        // Right Column: Phased Roadmap Timeline
        slide.addShape(ppt.ShapeType.roundRect, {
          x: 7.7, y: 0.9, w: 5.1, h: 3.6, fill: { color: "0B0F19" }, line: { color: "1E293B", width: 1 }
        });

        slide.addText("IMPLEMENTATION TIMELINE", {
          x: 8.0, y: 1.1, w: 4.5, h: 0.3, fontSize: 10, fontFace: "Courier New", color: "EAB308", bold: true
        });

        area.strategy.forEach((strat, sIdx) => {
          const topOffset = 1.45 + (sIdx * 0.95);
          
          // Timeline Node Bubble
          slide.addShape(ppt.ShapeType.roundRect, {
            x: 8.0, y: topOffset, w: 0.9, h: 0.25, fill: { color: area.accentColor + "15" }, line: { color: area.accentColor, width: 1 }
          });
          slide.addText(strat.timeline, {
            x: 8.0, y: topOffset, w: 0.9, h: 0.25, fontSize: 8.5, fontFace: "Courier New", color: area.accentColor, bold: true, align: "center"
          });

          slide.addText(strat.title.toUpperCase(), {
            x: 9.1, y: topOffset - 0.05, w: 3.5, h: 0.3, fontSize: 10, fontFace: "Arial", color: "FFFFFF", bold: true
          });

          slide.addText(strat.details, {
            x: 8.0, y: topOffset + 0.3, w: 4.6, h: 0.5, fontSize: 8.5, fontFace: "Arial", color: "94A3B8", lineSpacing: 12
          });
        });

        // Bottom Banner: Business Impact
        slide.addShape(ppt.ShapeType.roundRect, {
          x: 7.7, y: 4.7, w: 5.1, h: 1.7, fill: { color: area.accentColor + "10" }, line: { color: area.accentColor + "40", width: 1 }
        });

        slide.addText("ENTERPRISE BUSINESS IMPACT", {
          x: 8.0, y: 4.9, w: 4.5, h: 0.3, fontSize: 9.5, fontFace: "Courier New", color: "EAB308", bold: true
        });

        slide.addText([
          { text: "Target Metric: ", options: { bold: true, color: "FFFFFF" } },
          { text: area.businessImpact.metric + "\n", options: { bold: true, color: area.accentColor } },
          { text: "Financial ROI: ", options: { bold: true, color: "FFFFFF" } },
          { text: area.businessImpact.roi, options: { color: "CBD5E1" } }
        ], {
          x: 8.0, y: 5.25, w: 4.5, h: 1.0, fontSize: 10.5, fontFace: "Arial", lineSpacing: 16
        });
      });

      // Save Presentation
      const filename = `stark-production-architecture-roadmap.pptx`;
      await ppt.writeFile({ fileName: filename });
      onTriggerLog("Enterprise PowerPoint Roadmap compiled successfully! Initiating secure desktop sync, Sir.", "success");
    } catch (err: any) {
      console.error(err);
      onTriggerLog(`Roadmap compilation failure: ${err.message || err}`, "error");
    } finally {
      setIsExporting(false);
      setIsProcessing(false);
    }
  };

  const activeData = roadmapData[activeTab];

  return (
    <div id="architecture-roadmap-panel" className="flex flex-col h-full border border-cyan-500/20 rounded-xl bg-slate-950/80 backdrop-blur-md p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden">
      
      {/* Panel header and Mode selectors */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="font-mono text-xs font-bold tracking-wider uppercase text-white">
            Architecture Roadmap
          </h2>
        </div>
        <div className="flex gap-1.5 bg-slate-900/60 p-0.5 rounded border border-cyan-500/10">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider rounded transition-all ${
              viewMode === "grid" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Bento Grid
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={`px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider rounded transition-all ${
              viewMode === "timeline" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Timeline Phase
          </button>
        </div>
      </div>

      {/* Goal Statement Banner */}
      <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-2.5 mb-3 font-sans relative shrink-0 overflow-hidden">
        <div className="absolute top-0 right-0 p-1.5 opacity-20">
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
        <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold mb-1">
          Final Architectural Goal Statement
        </span>
        <p className="text-xs text-white leading-relaxed italic pr-4">
          "Create a secure, scalable, intelligent, and future-ready AI ecosystem capable of supporting real-world deployment, enterprise workloads, and long-term innovation while delivering exceptional user experiences."
        </p>
      </div>

      {/* Interactive Bento / Timeline Layout Container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
        {viewMode === "grid" ? (
          <>
            {/* 3 Pillars Tabs */}
            <div className="grid grid-cols-3 gap-2 shrink-0">
              {Object.values(roadmapData).map((area) => {
                const isActive = activeTab === area.id;
                return (
                  <button
                    key={area.id}
                    onClick={() => {
                      setActiveTab(area.id as any);
                      onTriggerLog(`Aligned telemetry display to: ${area.title}`, "system");
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                      isActive
                        ? `${area.borderColor} ${area.bgColor} text-white shadow-[0_0_10px_rgba(6,182,212,0.05)]`
                        : "bg-slate-900/30 border-cyan-500/5 text-slate-500 hover:border-cyan-500/15 hover:text-slate-300"
                    }`}
                  >
                    <div className="mb-1">{area.icon}</div>
                    <span className="font-mono text-[9px] tracking-wider font-bold uppercase truncate w-full">
                      {area.id === "modular" ? "Architecture" : area.id === "scalability" ? "Scalability" : "Security/AI"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pillar Details Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className={`border rounded-lg p-3 bg-slate-900/40 relative overflow-hidden ${activeData.borderColor}`}
              >
                {/* Visual Accent Badge */}
                <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${activeData.pillBg} ${activeData.color} absolute top-3 right-3 font-bold`}>
                  Active Pillar
                </span>

                <h3 className={`font-mono text-xs font-bold tracking-wider uppercase mb-1.5 ${activeData.color}`}>
                  {activeData.title}
                </h3>

                {/* Core Overview */}
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3 font-sans">
                  {activeData.overview}
                </p>

                {/* Benefits list */}
                <div className="space-y-2 mb-3 border-t border-cyan-500/5 pt-2.5">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                    Key Enterprise Benefits
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {activeData.benefits.map((benefit, bIdx) => {
                      const [title, desc] = benefit.split(": ");
                      return (
                        <div key={bIdx} className="flex items-start gap-1.5 text-[10px]">
                          <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${activeData.color}`} />
                          <p className="leading-normal font-sans text-slate-300">
                            <strong className="text-white">{title}</strong>: {desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Business Impact block */}
                <div className={`p-2 rounded border border-dashed flex flex-col gap-1 ${activeData.borderColor} bg-slate-950/50`}>
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-3.5 h-3.5 ${activeData.color}`} />
                    <span className="text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                      Business Impact: {activeData.businessImpact.metric}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    {activeData.businessImpact.description}
                  </p>
                  <div className="text-[9px] font-mono text-amber-400 uppercase tracking-wide border-t border-cyan-500/5 pt-1 mt-0.5">
                    <strong>ROI Projection:</strong> {activeData.businessImpact.roi}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          /* Timeline view: multi-phased roadmap */
          <div className="border border-cyan-500/10 rounded-lg p-3 bg-slate-900/20 space-y-4">
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
              Consolidated Implementation Phases
            </span>

            <div className="relative border-l border-cyan-500/20 pl-4 ml-1 space-y-4">
              {/* Combine phase steps across pillars for a continuous narrative */}
              {[
                {
                  phase: "Phase 1: Zero-Trust foundation",
                  timeline: "Q3 2026",
                  pillar: "Modular SOA & Security",
                  title: "Decoupled Boundaries & Access Controls",
                  details: "Migrate current monolithic Express logic into isolated Docker boundaries. Implement Single Sign-On (SSO) using industry-standard OAuth2/OIDC, and mandate AES-256 state encryption at rest utilizing secure KMS master keys."
                },
                {
                  phase: "Phase 2: Synaptic Mesh Fabric",
                  timeline: "Q4 2026",
                  pillar: "Scalability & Governance",
                  title: "Kafka Event Bus & LLM Safety Guardrails",
                  details: "Integrate high-speed Kafka queues for async system automation. Implement intermediate content moderation middleware to sanitize inbound commands and filter model outputs against PII or malicious script injection."
                },
                {
                  phase: "Phase 3: Autonomous Scale",
                  timeline: "Q1 2027",
                  pillar: "Global Infrastructure",
                  title: "Active-Active Regional clusters",
                  details: "Coordinate production deployments globally on Kubernetes (EKS/GKE) with horizontal autoscaling. Deploy federated database shards and conduct active disaster recovery chaos testing to prove sub-60s RTO objectives."
                }
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline bullet dot */}
                  <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] border border-slate-950" />
                  
                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-400 font-bold uppercase text-[9px] bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        {step.timeline}
                      </span>
                      <span className="font-mono text-[8px] text-slate-500 uppercase tracking-wider">
                        {step.pillar}
                      </span>
                    </div>
                    <h4 className="font-mono font-bold text-white text-xs tracking-wider uppercase">
                      {step.title}
                    </h4>
                    <p className="text-slate-400 font-sans leading-relaxed text-[10px]">
                      {step.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Primary Slide Deck Exporter */}
      <button
        onClick={handleExportPPTX}
        disabled={isExporting || isProcessing}
        className="w-full mt-3.5 py-2.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40 border border-cyan-400 font-mono font-bold rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0"
      >
        <Download className="w-4 h-4" /> Export Pitch-Ready PPTX Deck
      </button>

      {/* Info footer */}
      <div className="mt-2.5 bg-slate-900/50 border border-cyan-500/10 rounded p-2 text-[9px] font-mono text-cyan-500/70 flex gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          Telemetry configured for board presentations and venture presentations. Selecting <strong>Export</strong> outputs a 16:9 widescreen PowerPoint deck with corporate obsidian layouts, Sir.
        </p>
      </div>
    </div>
  );
}
