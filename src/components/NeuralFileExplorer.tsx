import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  File as FileIcon, 
  Trash2, 
  Search, 
  Eye, 
  Sparkles, 
  Cpu, 
  Layers, 
  Check, 
  X, 
  ArrowRight,
  HardDrive,
  Info,
  ChevronRight,
  FileCode,
  FileImage,
  FileText,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
  Bell,
  Activity
} from "lucide-react";

interface NeuralFileExplorerProps {
  onTriggerLog: (text: string, type: "system" | "success" | "error") => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  uplinkedFiles: { [fileName: string]: string };
  setUplinkedFiles: React.Dispatch<React.SetStateAction<{ [fileName: string]: string }>>;
  onActivateSpeech?: (text: string) => void;
}

interface ServerFile {
  name: string;
  size: number;
  uploadedAt: string;
  mimeType: string;
}

interface SyncNotification {
  id: string;
  message: string;
  type: "added" | "removed" | "modified" | "system";
  timestamp: Date;
}

export default function NeuralFileExplorer({
  onTriggerLog,
  isProcessing,
  setIsProcessing,
  uplinkedFiles,
  setUplinkedFiles,
  onActivateSpeech
}: NeuralFileExplorerProps) {
  const [files, setFiles] = useState<ServerFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<ServerFile | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileIsText, setFileIsText] = useState<boolean>(true);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"metadata" | "preview" | "hexdump">("metadata");
  
  // Local File System Sync States
  const [syncStatus, setSyncStatus] = useState<"connected" | "syncing" | "error">("connected");
  const [lastSyncTime, setLastSyncTime] = useState<string>("Initializing...");
  const [syncNotifications, setSyncNotifications] = useState<SyncNotification[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFirstLoadRef = useRef<boolean>(true);

  // Fetch and monitor files from server uploads directory
  const fetchFiles = async (isQuiet = false) => {
    if (!isQuiet) {
      setSyncStatus("syncing");
    }
    try {
      const res = await fetch("/api/jarvis/files");
      const data = await res.json();
      if (data.success) {
        const newFiles: ServerFile[] = data.files || [];
        
        // Skip comparison checks on the very first load to prevent noise
        if (isFirstLoadRef.current) {
          setFiles(newFiles);
          isFirstLoadRef.current = false;
          setSyncStatus("connected");
          setLastSyncTime(new Date().toLocaleTimeString());
          return;
        }

        // Deep-comparison checks to identify external machine changes
        const added = newFiles.filter(nf => !files.some(of => of.name === nf.name));
        const removed = files.filter(of => !newFiles.some(nf => nf.name === of.name));
        const modified = newFiles.filter(nf => {
          const matched = files.find(of => of.name === nf.name);
          return matched && (matched.size !== nf.size || matched.uploadedAt !== nf.uploadedAt);
        });

        let hasChanges = false;
        const newNotifs: SyncNotification[] = [];

        // Handle addition notifications
        if (added.length > 0) {
          hasChanges = true;
          added.forEach(file => {
            const msg = `Sir, a new local file array "${file.name}" was registered on the machine.`;
            onTriggerLog(`[FILE RADAR] Added: "${file.name}"`, "success");
            newNotifs.push({
              id: Math.random().toString(),
              message: `File integrated: ${file.name}`,
              type: "added",
              timestamp: new Date()
            });
            if (onActivateSpeech) {
              onActivateSpeech(`I have registered a new file on the local grid, Sir. "${file.name}" is now available.`);
            }
          });
        }

        // Handle removal notifications
        if (removed.length > 0) {
          hasChanges = true;
          removed.forEach(file => {
            const msg = `Sir, the file node "${file.name}" was purged or removed from the machine.`;
            onTriggerLog(`[FILE RADAR] Purged: "${file.name}"`, "system");
            newNotifs.push({
              id: Math.random().toString(),
              message: `File purged: ${file.name}`,
              type: "removed",
              timestamp: new Date()
            });
            if (onActivateSpeech) {
              onActivateSpeech(`Tactical update, Sir. The file "${file.name}" is no longer present on the local storage system.`);
            }
          });
        }

        // Handle modification notifications
        if (modified.length > 0) {
          hasChanges = true;
          modified.forEach(file => {
            const msg = `Sir, the file node "${file.name}" has been modified on the local machine.`;
            onTriggerLog(`[FILE RADAR] Modified: "${file.name}"`, "success");
            newNotifs.push({
              id: Math.random().toString(),
              message: `File modified: ${file.name}`,
              type: "modified",
              timestamp: new Date()
            });
            if (onActivateSpeech) {
              onActivateSpeech(`File update detected, Sir. "${file.name}" has been modified. Re-compiling state.`);
            }
          });
        }

        if (hasChanges) {
          setFiles(newFiles);
          setSyncNotifications(prev => [
            ...newNotifs,
            ...prev
          ].slice(0, 15)); // Keep last 15 sync logs
        }

        setSyncStatus("connected");
        setLastSyncTime(new Date().toLocaleTimeString());
      } else {
        setSyncStatus("error");
        onTriggerLog(`Failed to query neural storage repository.`, "error");
      }
    } catch (err: any) {
      console.error("Storage fetch failed:", err);
      setSyncStatus("error");
      onTriggerLog(`Offline state detected: Local file deck running in sandboxed isolation.`, "error");
    }
  };

  // Set up synchronization polling interval
  useEffect(() => {
    fetchFiles();
    
    // Check every 4 seconds for real-time background local changes
    const interval = setInterval(() => {
      fetchFiles(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [files]);

  // Format file size helper
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      uploadFileToServer(droppedFile);
    }
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFileToServer(e.target.files[0]);
    }
  };

  // Upload file process using base64 and standard JSON POST
  const uploadFileToServer = async (file: File) => {
    if (isUploading) return;
    
    // File size safety guard: Max 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      onTriggerLog(`SYNAPTIC ERROR: File "${file.name}" exceeds 15MB tactical processing limit.`, "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    onTriggerLog(`INITIALIZING NEURAL TRANSMISSION: "${file.name}" byte stream staging...`, "system");

    const reader = new FileReader();
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.floor((e.loaded / e.total) * 40) + 10; // scale to 10-50% progress
        setUploadProgress(pct);
      }
    };

    reader.onload = async (e) => {
      try {
        setUploadProgress(60);
        const result = e.target?.result as string;
        const base64Data = result.split(",")[1];
        
        setUploadProgress(80);
        const response = await fetch("/api/jarvis/upload-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            base64Data
          })
        });

        const data = await response.json();
        setUploadProgress(100);

        if (data.success) {
          onTriggerLog(`NEURAL STORAGE SYNCHRONIZED: Transferred "${file.name}" (${formatBytes(file.size)})`, "success");
          fetchFiles();
          
          // Auto-select uploaded file
          setSelectedFile(data.file);
          fetchFileContent(data.file.name);
        } else {
          onTriggerLog(`SYNAPTIC WRITE REJECTED: ${data.error || "Uplink handshake failed"}`, "error");
        }
      } catch (err: any) {
        console.error("Uplink failed:", err);
        onTriggerLog(`NEURAL GRID COLLAPSE: Could not route file byte array.`, "error");
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      }
    };

    reader.onerror = () => {
      onTriggerLog(`SENSORY ENCODER CORRUPTION: Failed to read file bytes.`, "error");
      setIsUploading(false);
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  };

  // Load a file's content
  const fetchFileContent = async (fileName: string) => {
    setIsLoadingContent(true);
    setFileContent("");
    try {
      const res = await fetch(`/api/jarvis/file-content/${encodeURIComponent(fileName)}`);
      const data = await res.json();
      if (data.success) {
        setFileContent(data.content);
        setFileIsText(data.isText);
        // Automatically switch to correct view tab
        if (data.isText) {
          setInspectorTab("preview");
        } else {
          setInspectorTab("hexdump");
        }
      } else {
        onTriggerLog(`Could not retrieve holographic contents of ${fileName}.`, "error");
      }
    } catch (err: any) {
      console.error("Failed to load file content:", err);
      onTriggerLog(`Uplink broken: Local indexers unresponsive.`, "error");
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Handle selected file change
  const handleSelectFile = (file: ServerFile) => {
    setSelectedFile(file);
    fetchFileContent(file.name);
  };

  // Delete file handler
  const handleDeleteFile = async (e: React.MouseEvent, file: ServerFile) => {
    e.stopPropagation();
    if (!window.confirm(`Purge "${file.name}" from JARVIS core storage repository, Sir?`)) return;

    try {
      const response = await fetch("/api/jarvis/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name })
      });

      const data = await response.json();
      if (data.success) {
        onTriggerLog(`PURGED NEURAL NODE: File "${file.name}" deleted successfully.`, "success");
        
        // Remove from uplinked files context if present
        if (uplinkedFiles[file.name]) {
          const updated = { ...uplinkedFiles };
          delete updated[file.name];
          setUplinkedFiles(updated);
        }

        if (selectedFile?.name === file.name) {
          setSelectedFile(null);
          setFileContent("");
        }
        fetchFiles();
      } else {
        onTriggerLog(`PURGE FAILURE: ${data.error || "Unknown response from server storage."}`, "error");
      }
    } catch (err) {
      console.error("Purge failure:", err);
      onTriggerLog(`HARD-DRIVE EXCLUSION LOCKED: System was unable to unregister file nodes.`, "error");
    }
  };

  // Uplink File contents directly into JARVIS Neural Cognition / Chat Context
  const handleUplinkToCore = () => {
    if (!selectedFile) return;
    
    // Put in state
    setUplinkedFiles(prev => ({
      ...prev,
      [selectedFile.name]: fileContent
    }));

    onTriggerLog(`SYNAPTIC UPLINK SECURED: Synchronized "${selectedFile.name}" with JARVIS Neural Cognition Core.`, "success");
    
    const talkMsg = `I have successfully synchronized the contents of "${selectedFile.name}" with my active cognitive core, Sir. I am fully ready to analyze this dataset, interpret its code, or answer questions with context-aware precision. How shall we proceed?`;
    
    if (onActivateSpeech) {
      onActivateSpeech(talkMsg);
    }
  };

  // Check if a file is already uplinked in the context
  const isUplinked = (fileName: string) => {
    return !!uplinkedFiles[fileName];
  };

  // Direct export download via browser Blob URLs
  const handleExportSelectedFile = () => {
    if (!selectedFile || !fileContent) return;
    onTriggerLog(`PREPARING BYTESTREAM FOR EXPORT: "${selectedFile.name}"...`, "system");
    try {
      let blob: Blob;
      if (fileIsText) {
        blob = new Blob([fileContent], { type: selectedFile.mimeType });
      } else {
        const byteCharacters = atob(fileContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: selectedFile.mimeType });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onTriggerLog(`EXPORT COMPLETE: "${selectedFile.name}" downloaded to local file system.`, "success");
      if (onActivateSpeech) {
        onActivateSpeech(`Direct export complete for ${selectedFile.name}, Sir.`);
      }
    } catch (err: any) {
      console.error("Export failure:", err);
      onTriggerLog(`EXPORT ERROR: Could not compile data stream.`, "error");
    }
  };

  const handleExportFileByName = async (fileName: string, mimeType: string) => {
    onTriggerLog(`PREPARING DIRECT EXPORT BYTESTREAM: "${fileName}"...`, "system");
    try {
      const res = await fetch(`/api/jarvis/file-content/${encodeURIComponent(fileName)}`);
      const data = await res.json();
      if (data.success) {
        let blob: Blob;
        if (data.isText) {
          blob = new Blob([data.content], { type: mimeType });
        } else {
          const byteCharacters = atob(data.content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: mimeType });
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onTriggerLog(`EXPORT COMPLETE: Direct file "${fileName}" downloaded successfully.`, "success");
        if (onActivateSpeech) {
          onActivateSpeech(`Direct file export complete for ${fileName}, Sir.`);
        }
      } else {
        onTriggerLog(`EXPORT ERROR: Could not retrieve data stream for "${fileName}".`, "error");
      }
    } catch (err: any) {
      console.error("Export failure:", err);
      onTriggerLog(`EXPORT FAILURE: Synaptic handshaking interrupted.`, "error");
    }
  };

  // Helper to generate elegant Hexadecimal and ASCII Byte Dump
  const generateHexDump = (base64: string, maxBytes = 384): string => {
    try {
      const binary = atob(base64);
      const lines = [];
      for (let i = 0; i < Math.min(binary.length, maxBytes); i += 16) {
        const chunk = binary.slice(i, i + 16);
        const hex = [];
        const ascii = [];
        for (let j = 0; j < 16; j++) {
          if (j < chunk.length) {
            const charCode = chunk.charCodeAt(j);
            hex.push(charCode.toString(16).padStart(2, "0").toUpperCase());
            ascii.push(charCode >= 32 && charCode <= 126 ? chunk[j] : ".");
          } else {
            hex.push("  ");
            ascii.push(" ");
          }
        }
        const offset = i.toString(16).padStart(4, "0").toUpperCase();
        lines.push(`${offset}  ${hex.slice(0, 8).join(" ")}  ${hex.slice(8).join(" ")}  |${ascii.join("")}|`);
      }
      if (binary.length > maxBytes) {
        lines.push(`... [Truncated for preview. Total physical size: ${binary.length} bytes]`);
      }
      return lines.join("\n");
    } catch (e) {
      return "Hexadecimal serialization protocol error: Content payload is corrupt or not in correct base64 form.";
    }
  };

  // Get responsive Icon based on file extension
  const getFileIcon = (mimeType: string, name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (mimeType.startsWith("image/")) return <FileImage className="w-4 h-4 text-emerald-400" />;
    if (mimeType.startsWith("text/markdown") || ext === "md") return <FileCode className="w-4 h-4 text-purple-400" />;
    if (mimeType.includes("json") || mimeType.includes("javascript") || mimeType.includes("typescript") || ext === "js" || ext === "ts" || ext === "tsx" || ext === "html" || ext === "css") {
      return <FileCode className="w-4 h-4 text-cyan-400 font-bold" />;
    }
    if (mimeType.startsWith("text/")) return <FileText className="w-4 h-4 text-amber-400" />;
    return <FileIcon className="w-4 h-4 text-slate-400" />;
  };

  // Filter list
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div id="neural-file-explorer-card" className="flex flex-col h-full border border-cyan-500/20 rounded-xl bg-slate-950/80 backdrop-blur-md p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden">
      
      {/* Tab Header & Active Sync Indicator */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-3 shrink-0">
        <span className="font-mono text-xs text-cyan-400 tracking-wider flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-cyan-400" /> NEURAL DATA DECK
        </span>
        
        {/* Dynamic Connection Monitor & Radar Alerts */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-cyan-500/10 px-2 py-0.5 rounded-full" title={`Last synchronized at: ${lastSyncTime}`}>
            {syncStatus === "syncing" && (
              <RefreshCw className="w-2.5 h-2.5 text-cyan-400 animate-spin" />
            )}
            {syncStatus === "connected" && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            )}
            {syncStatus === "error" && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
            )}
            <span className={`text-[8px] tracking-wider uppercase font-bold ${syncStatus === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
              {syncStatus === "syncing" ? "Syncing..." : syncStatus === "connected" ? "Uplink: Live" : "Uplink: Error"}
            </span>
          </div>

          {/* Notification Center Popover Trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="relative p-1 bg-slate-900/85 border border-cyan-500/15 hover:border-cyan-500/40 rounded text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer"
              title="View Local File System changes log"
            >
              <Bell className="w-3.5 h-3.5" />
              {syncNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 text-[8px] font-extrabold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-slate-950 scale-90">
                  {syncNotifications.length}
                </span>
              )}
            </button>

            {/* Notification Center Dropdown Portal */}
            <AnimatePresence>
              {showNotificationCenter && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-64 bg-slate-950/95 border border-cyan-500/20 rounded-lg p-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.9)] z-50 font-mono"
                >
                  <div className="flex items-center justify-between border-b border-cyan-500/10 pb-1.5 mb-2">
                    <span className="text-[9px] uppercase text-cyan-400 font-bold flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" /> FILE RADAR LOG
                    </span>
                    <button 
                      onClick={() => {
                        setSyncNotifications([]);
                        setShowNotificationCenter(false);
                      }}
                      className="text-[8px] text-slate-500 hover:text-cyan-400 uppercase font-bold"
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                    {syncNotifications.length === 0 ? (
                      <div className="text-center py-4 text-slate-600 text-[8px] uppercase">
                        No changes detected.
                      </div>
                    ) : (
                      syncNotifications.map(n => (
                        <div key={n.id} className="p-1.5 bg-slate-900/40 border border-cyan-500/5 rounded text-[9px] leading-tight flex flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span className={`font-bold uppercase text-[7px] px-1 rounded ${
                              n.type === "added" ? "bg-emerald-500/10 text-emerald-400" :
                              n.type === "removed" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                            }`}>
                              {n.type}
                            </span>
                            <span className="text-[7px] text-slate-600">
                              {n.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <span className="text-slate-300">{n.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="border-t border-cyan-500/10 pt-1.5 mt-2 text-center text-[7.5px] text-cyan-500/45 uppercase leading-none">
                    AUTOPILOT SCAN: 4s INTERVALS
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side List, Right Side Inspector */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        
        {/* Left Side: Drag/Drop & File List (col-span-5) */}
        <div className="col-span-5 flex flex-col gap-3 min-h-0">
          
          {/* Drag & Drop Upload Portal */}
          <div
            id="drag-upload-portal"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed p-3.5 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden group shrink-0 ${
              isDragging
                ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : isUploading
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-cyan-500/15 hover:border-cyan-500/30 bg-slate-900/15 hover:bg-cyan-500/5"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelectChange}
              className="hidden"
            />
            
            {/* Holographic Radar Scanning Grid Overlay (Uploading state) */}
            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 font-mono p-2">
                <Cpu className="w-6 h-6 text-amber-400 animate-spin mb-1.5" />
                <span className="text-[10px] text-amber-400 font-bold tracking-widest animate-pulse">TRANSMITTING PORTAL</span>
                <div className="w-full max-w-[120px] bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all duration-200" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[8px] text-amber-500/60 mt-1">{uploadProgress}% COMPLETE</span>
              </div>
            )}

            <Upload className={`w-5 h-5 mb-1.5 transition-transform duration-300 ${
              isDragging ? "text-emerald-400 scale-110 -translate-y-0.5" : "text-cyan-400/70 group-hover:-translate-y-0.5 group-hover:text-cyan-400"
            }`} />
            
            <p className="font-mono text-[10px] leading-snug text-slate-300 font-medium">
              DRAG & DROP NEURAL FILE
            </p>
            <p className="font-mono text-[8px] text-cyan-500/50 mt-0.5 uppercase tracking-wider">
              or click to upload raw byte data (Max 15MB)
            </p>
          </div>

          {/* Search Box */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-cyan-500/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file registries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-cyan-500/10 rounded-md py-1 px-2 pl-8 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500/35 placeholder:text-slate-600"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Uploaded Files Table list */}
          <div className="flex-1 overflow-y-auto border border-cyan-500/5 rounded-lg bg-slate-950/45 divide-y divide-cyan-500/5 pr-1 min-h-[140px]">
            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 font-mono">
                <FileIcon className="w-5 h-5 text-slate-700 mb-1.5" />
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">No matching file arrays</span>
              </div>
            ) : (
              filteredFiles.map((file) => {
                const selected = selectedFile?.name === file.name;
                const activeContext = isUplinked(file.name);

                return (
                  <div
                    key={file.name}
                    onClick={() => handleSelectFile(file)}
                    className={`flex items-center justify-between p-2 cursor-pointer transition-all ${
                      selected
                        ? "bg-cyan-500/10 border-l-2 border-cyan-400"
                        : "hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getFileIcon(file.mimeType, file.name)}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-mono text-[11px] font-medium text-slate-200 truncate leading-tight">
                          {file.name}
                        </span>
                        <span className="font-mono text-[8px] text-cyan-500/45 leading-none mt-0.5 uppercase tracking-wide">
                          {formatBytes(file.size)} {activeContext && "• UPLINK ACTIVE"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {activeContext && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" title="Synchronized with JARVIS Cognition" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportFileByName(file.name, file.mimeType);
                        }}
                        className="p-1 hover:bg-cyan-500/20 text-slate-500 hover:text-cyan-400 rounded transition-colors"
                        title="Direct export to local system"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFile(e, file)}
                        className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title="Purge file node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: File Inspector & Detailed Viewer (col-span-7) */}
        <div className="col-span-7 flex flex-col border border-cyan-500/10 rounded-lg bg-slate-950/60 p-3 overflow-hidden min-h-0">
          
          {selectedFile ? (
            <div className="flex flex-col h-full min-h-0">
              
              {/* File Title and Quick Details */}
              <div className="flex items-center justify-between border-b border-cyan-500/5 pb-2 mb-2.5 shrink-0">
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-xs font-bold text-cyan-300 truncate tracking-wide uppercase flex items-center gap-1.5">
                    {getFileIcon(selectedFile.mimeType, selectedFile.name)}
                    {selectedFile.name}
                  </span>
                  <span className="font-mono text-[8px] text-cyan-500/50 mt-0.5">
                    MIME: {selectedFile.mimeType} | SIZE: {formatBytes(selectedFile.size)}
                  </span>
                </div>

                {/* Uplink status indicators / triggers */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleExportSelectedFile}
                    disabled={isLoadingContent || !fileContent}
                    className="flex items-center gap-1 font-mono text-[9px] bg-slate-900/80 hover:bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2 py-1 rounded font-bold hover:border-cyan-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download/Export file to local system"
                  >
                    <Download className="w-3 h-3" /> Export Node
                  </button>

                  {isUplinked(selectedFile.name) ? (
                    <span className="flex items-center gap-1 font-mono text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded uppercase font-bold animate-pulse">
                      <Check className="w-3 h-3" /> Core Synced
                    </span>
                  ) : (
                    <button
                      onClick={handleUplinkToCore}
                      disabled={isLoadingContent}
                      className="flex items-center gap-1 font-mono text-[9px] bg-cyan-500 text-slate-950 px-2 py-1 rounded font-bold hover:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                      title="Upload raw data to JARVIS chat context"
                    >
                      <Sparkles className="w-3 h-3" /> Sync Cognition
                    </button>
                  )}
                </div>
              </div>

              {/* Inspector View Options Tabs */}
              <div className="flex items-center gap-2 mb-2 border-b border-cyan-500/5 pb-1 shrink-0">
                <button
                  onClick={() => setInspectorTab("metadata")}
                  className={`font-mono text-[9px] uppercase py-1 px-2.5 rounded transition-colors ${
                    inspectorTab === "metadata"
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                      : "text-slate-500 hover:text-cyan-400/80"
                  }`}
                >
                  <Info className="inline-block w-3 h-3 mr-1 align-text-bottom" /> Node Data
                </button>

                {fileIsText && (
                  <button
                    onClick={() => setInspectorTab("preview")}
                    className={`font-mono text-[9px] uppercase py-1 px-2.5 rounded transition-colors ${
                      inspectorTab === "preview"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                        : "text-slate-500 hover:text-cyan-400/80"
                    }`}
                  >
                    <Eye className="inline-block w-3 h-3 mr-1 align-text-bottom" /> Text Viewer
                  </button>
                )}

                {!fileIsText && selectedFile.mimeType.startsWith("image/") && (
                  <button
                    onClick={() => setInspectorTab("preview")}
                    className={`font-mono text-[9px] uppercase py-1 px-2.5 rounded transition-colors ${
                      inspectorTab === "preview"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                        : "text-slate-500 hover:text-cyan-400/80"
                    }`}
                  >
                    <Eye className="inline-block w-3 h-3 mr-1 align-text-bottom" /> Image Render
                  </button>
                )}

                <button
                  onClick={() => setInspectorTab("hexdump")}
                  className={`font-mono text-[9px] uppercase py-1 px-2.5 rounded transition-colors ${
                    inspectorTab === "hexdump"
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                      : "text-slate-500 hover:text-cyan-400/80"
                  }`}
                >
                  <Layers className="inline-block w-3 h-3 mr-1 align-text-bottom" /> Hex Stream
                </button>
              </div>

              {/* Inspector Content Viewport */}
              <div className="flex-1 overflow-hidden min-h-0 bg-slate-950/40 border border-cyan-500/5 rounded-lg p-2.5 relative">
                
                {isLoadingContent ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <Cpu className="w-5 h-5 text-cyan-400 animate-spin mb-1" />
                    <span className="text-[9px] text-cyan-500/50 uppercase tracking-widest animate-pulse">Compiling stream...</span>
                  </div>
                ) : (
                  <div className="h-full overflow-auto text-[10px] scrollbar-thin scrollbar-thumb-cyan-500/10 pr-1">
                    
                    {/* METADATA VIEW */}
                    {inspectorTab === "metadata" && (
                      <div className="space-y-3 font-mono">
                        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded p-2 text-cyan-300">
                          <span className="text-[9px] text-cyan-500/40 block mb-0.5 uppercase">Synaptic Node Classification</span>
                          <span className="font-bold">STARK LAB DATA SUBROUTINE</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-slate-400">
                          <div className="bg-slate-900/30 p-2 border border-slate-900/60 rounded">
                            <span className="text-[8px] text-slate-600 block uppercase">Identifier Name</span>
                            <span className="text-[11px] font-bold text-slate-300 break-all">{selectedFile.name}</span>
                          </div>
                          <div className="bg-slate-900/30 p-2 border border-slate-900/60 rounded">
                            <span className="text-[8px] text-slate-600 block uppercase">Sector Size</span>
                            <span className="text-[11px] font-bold text-slate-300">{formatBytes(selectedFile.size)}</span>
                          </div>
                          <div className="bg-slate-900/30 p-2 border border-slate-900/60 rounded col-span-2">
                            <span className="text-[8px] text-slate-600 block uppercase">Ingestion Time Stamp</span>
                            <span className="text-[10px] text-slate-300">{new Date(selectedFile.uploadedAt).toLocaleString()}</span>
                          </div>
                          <div className="bg-slate-900/30 p-2 border border-slate-900/60 rounded col-span-2">
                            <span className="text-[8px] text-slate-600 block uppercase">Security clearance</span>
                            <span className="text-[10px] text-emerald-400">PASSED (ENCRYPTED NODAL AES-256)</span>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-col gap-1.5">
                          <span className="text-[9px] text-cyan-400/40 uppercase">Cognitive Core Status</span>
                          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/20 border border-cyan-500/5 rounded">
                            <span className={`w-1.5 h-1.5 rounded-full ${isUplinked(selectedFile.name) ? "bg-emerald-500 shadow-[0_0_5px_#10b981]" : "bg-amber-400"}`} />
                            <span className="text-[9px] text-slate-400">
                              {isUplinked(selectedFile.name) 
                                ? "This file is fully cached in active conversational memory workspace." 
                                : "This file is stored but offline. Click 'Sync Cognition' above to analyze."}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PREVIEW VIEW */}
                    {inspectorTab === "preview" && (
                      <div className="h-full">
                        {fileIsText ? (
                          <pre className="font-mono text-[10px] text-cyan-200 leading-relaxed whitespace-pre select-all bg-slate-950/20 rounded p-1">
                            {fileContent || "[No text content found inside node file]"}
                          </pre>
                        ) : selectedFile.mimeType.startsWith("image/") ? (
                          <div className="flex items-center justify-center h-full p-2 bg-slate-900/20 rounded-md border border-cyan-500/5 relative overflow-hidden group">
                            <img
                              src={`data:${selectedFile.mimeType};base64,${fileContent}`}
                              alt={selectedFile.name}
                              className="max-h-[220px] max-w-full object-contain rounded shadow-lg border border-cyan-500/15"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <Info className="w-5 h-5 text-cyan-500/40 mb-1.5" />
                            <span className="uppercase text-[9px] text-cyan-500/65">Visual rendering not supported for binary streams.</span>
                            <span className="text-[8px] text-slate-500 mt-1 uppercase">Please switch to Hex Stream or Node Data tab</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* HEX DUMP VIEW */}
                    {inspectorTab === "hexdump" && (
                      <div className="h-full select-all font-mono">
                        <div className="text-[8px] text-cyan-500/50 uppercase border-b border-cyan-500/10 pb-1 mb-1.5 flex justify-between">
                          <span>OFFSET   HEXADECIMAL SERIAL ARRAY                        ASCII SYMBOLS</span>
                          <span>HEX STREAM INJECTOR</span>
                        </div>
                        <pre className="text-[9px] leading-tight text-slate-400 select-all font-bold tracking-wider leading-relaxed whitespace-pre">
                          {fileIsText 
                            ? generateHexDump(btoa(fileContent))
                            : generateHexDump(fileContent)}
                        </pre>
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 font-mono">
              <HardDrive className="w-8 h-8 text-cyan-500/15 mb-2.5 animate-pulse" />
              <p className="text-cyan-400/50 text-[11px] uppercase tracking-widest font-bold">
                Awaiting Storage Select
              </p>
              <p className="text-[9px] text-slate-600 uppercase max-w-[200px] mt-1 leading-normal">
                Select any uploaded file registry on the left rail to initialize the Holographic Inspector Matrix.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
