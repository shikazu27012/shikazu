import React, { useState, useEffect } from "react";
import {
  ListTodo,
  CheckSquare,
  Square,
  Calendar,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  LogOut,
  Loader2,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  ListPlus,
  CheckCircle2,
} from "lucide-react";
import { User } from "firebase/auth";
import {
  initAuth,
  googleSignIn,
  logout,
} from "../lib/firebaseAuth";

interface GoogleTasksHubProps {
  onTriggerLog: (text: string, type: "system" | "success" | "error") => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

export interface TaskList {
  id: string;
  title: string;
  updated?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: "needsAction" | "completed";
  due?: string;
  completed?: string;
}

export default function GoogleTasksHub({
  onTriggerLog,
  isProcessing,
  setIsProcessing,
}: GoogleTasksHubProps) {
  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // API States
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Form States
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // UI Filter State
  const [taskFilter, setTaskFilter] = useState<"all" | "active" | "completed">("all");

  // Destructive confirmation state (Custom modal)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete_task" | "delete_list";
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: "delete_task",
    targetId: "",
    targetName: "",
  });

  // 1. Listen for auth changes & cached token
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, cachedToken) => {
        setUser(currentUser);
        setToken(cachedToken);
        setNeedsAuth(false);
        onTriggerLog(`STARK CRYPTO-SECURE: Authorized session for ${currentUser.email}`, "success");
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch lists automatically when authorized
  useEffect(() => {
    if (token) {
      fetchTaskLists();
    }
  }, [token]);

  // Fetch tasks automatically when selected list changes
  useEffect(() => {
    if (token && selectedListId) {
      fetchTasks(selectedListId);
    } else {
      setTasks([]);
    }
  }, [selectedListId, token]);

  // Handle Login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    onTriggerLog("STARK OAUTH: Launching secure Google credentials prompt...", "system");
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
        onTriggerLog(`STARK OAUTH: Access token established. Synaptic link verified for ${result.user.email}`, "success");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      onTriggerLog(`STARK OAUTH ERROR: Secure handshake terminated. (${err.message})`, "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
      setTaskLists([]);
      setTasks([]);
      onTriggerLog("STARK CRYPTO-SECURE: Purged local OAuth token cached session. Session terminated.", "system");
    } catch (err: any) {
      onTriggerLog(`STARK LOGOUT ERROR: Purge failed.`, "error");
    }
  };

  // Fetch Task Lists
  const fetchTaskLists = async () => {
    if (!token) return;
    setIsLoadingLists(true);
    setIsProcessing(true);
    onTriggerLog("GOOGLE TASKS: Synchronizing task registry lists...", "system");
    try {
      const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to synchronize lists.`);
      }
      const data = await res.json();
      const lists = data.items || [];
      setTaskLists(lists);
      onTriggerLog(`GOOGLE TASKS: Successfully localized ${lists.length} task lists.`, "success");

      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
      }
    } catch (err: any) {
      console.error("Fetch lists error:", err);
      onTriggerLog(`GOOGLE TASKS ERROR: Synchronization offline. ${err.message}`, "error");
    } finally {
      setIsLoadingLists(false);
      setIsProcessing(false);
    }
  };

  // Fetch Tasks for a specific List
  const fetchTasks = async (listId: string) => {
    if (!token || !listId) return;
    setIsLoadingTasks(true);
    setIsProcessing(true);
    onTriggerLog("GOOGLE TASKS: Accessing specific registry list catalog...", "system");
    try {
      // Fetch both completed and active tasks
      const res = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch tasks.`);
      }
      const data = await res.json();
      const taskItems = data.items || [];
      setTasks(taskItems);
      onTriggerLog(`GOOGLE TASKS: Localized ${taskItems.length} registry entries.`, "success");
    } catch (err: any) {
      console.error("Fetch tasks error:", err);
      onTriggerLog(`GOOGLE TASKS ERROR: Task extraction failure. ${err.message}`, "error");
    } finally {
      setIsLoadingTasks(false);
      setIsProcessing(false);
    }
  };

  // Create Task List
  const handleCreateTaskList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newListName.trim()) return;
    setIsCreatingList(true);
    setIsProcessing(true);
    onTriggerLog(`GOOGLE TASKS: Provisioning new task registry: "${newListName}"...`, "system");
    try {
      const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newListName.trim() }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Creation request rejected.`);
      }
      const newList = await res.json();
      setTaskLists((prev) => [newList, ...prev]);
      setSelectedListId(newList.id);
      setNewListName("");
      onTriggerLog(`GOOGLE TASKS: Created list "${newList.title}" successfully.`, "success");
    } catch (err: any) {
      console.error("Create list error:", err);
      onTriggerLog(`GOOGLE TASKS ERROR: Registry provisioning rejected. ${err.message}`, "error");
    } finally {
      setIsCreatingList(false);
      setIsProcessing(false);
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedListId || !newTaskTitle.trim()) return;
    setIsCreatingTask(true);
    setIsProcessing(true);
    onTriggerLog(`GOOGLE TASKS: Registering task item "${newTaskTitle}"...`, "system");

    // Format RFC3339 date if supplied
    let formattedDue: string | undefined = undefined;
    if (newTaskDue) {
      formattedDue = new Date(newTaskDue).toISOString();
    }

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          notes: newTaskNotes.trim() || undefined,
          due: formattedDue,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Task insertion rejected.`);
      }
      const createdTask = await res.json();
      setTasks((prev) => [createdTask, ...prev]);
      setNewTaskTitle("");
      setNewTaskNotes("");
      setNewTaskDue("");
      onTriggerLog(`GOOGLE TASKS: Task "${createdTask.title}" compiled successfully.`, "success");
    } catch (err: any) {
      console.error("Create task error:", err);
      onTriggerLog(`GOOGLE TASKS ERROR: Compiler failure during task creation: ${err.message}`, "error");
    } finally {
      setIsCreatingTask(false);
      setIsProcessing(false);
    }
  };

  // Toggle Task Completion Status
  const handleToggleTask = async (task: Task) => {
    if (!token || !selectedListId) return;
    const isCompleted = task.status === "completed";
    const newStatus = isCompleted ? "needsAction" : "completed";
    
    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    onTriggerLog(
      `GOOGLE TASKS: Flipping task status for "${task.title}" to ${newStatus.toUpperCase()}...`,
      "system"
    );

    try {
      const res = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: task.id,
            title: task.title,
            notes: task.notes,
            status: newStatus,
          }),
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Status synchronization failed.`);
      }
      const updatedTask = await res.json();
      
      // Update local array with accurate server state
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updatedTask : t))
      );
      onTriggerLog(
        `GOOGLE TASKS: Synchronized status of "${updatedTask.title}" successfully.`,
        "success"
      );
    } catch (err: any) {
      console.error("Toggle task error:", err);
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      onTriggerLog(`GOOGLE TASKS ERROR: Status switch sync failed: ${err.message}`, "error");
    }
  };

  // Trigger Destructive Action Confirmations
  const promptDeleteTask = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      type: "delete_task",
      targetId: id,
      targetName: name,
    });
  };

  const promptDeleteList = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      type: "delete_list",
      targetId: id,
      targetName: name,
    });
  };

  // Confirm and execute delete operations
  const handleConfirmDelete = async () => {
    const { type, targetId, targetName } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    
    if (!token) return;
    setIsProcessing(true);

    if (type === "delete_task") {
      onTriggerLog(`GOOGLE TASKS: Initiating destruction of task: "${targetName}"...`, "system");
      try {
        const res = await fetch(
          `https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${targetId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Destruction request rejected.`);
        }
        setTasks((prev) => prev.filter((t) => t.id !== targetId));
        onTriggerLog(`GOOGLE TASKS: Successfully deleted task "${targetName}".`, "success");
      } catch (err: any) {
        console.error("Delete task failed:", err);
        onTriggerLog(`GOOGLE TASKS ERROR: Task deletion failed: ${err.message}`, "error");
      } finally {
        setIsProcessing(false);
      }
    } else if (type === "delete_list") {
      onTriggerLog(`GOOGLE TASKS: Initiating destruction of task list: "${targetName}"...`, "system");
      try {
        const res = await fetch(
          `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${targetId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Destruction request rejected.`);
        }
        setTaskLists((prev) => prev.filter((l) => l.id !== targetId));
        setSelectedListId(taskLists.find((l) => l.id !== targetId)?.id || "");
        onTriggerLog(`GOOGLE TASKS: Successfully deleted list "${targetName}".`, "success");
      } catch (err: any) {
        console.error("Delete list failed:", err);
        onTriggerLog(`GOOGLE TASKS ERROR: Task list deletion failed: ${err.message}`, "error");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Filter tasks based on selected filter option
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "active") return t.status === "needsAction";
    if (taskFilter === "completed") return t.status === "completed";
    return true;
  });

  const activeTasksCount = tasks.filter((t) => t.status === "needsAction").length;

  return (
    <div
      id="google-tasks-core-widget"
      className="flex flex-col h-full border border-cyan-500/20 rounded-xl bg-slate-950/80 backdrop-blur-md p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] relative"
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/40 rounded-tl pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/40 rounded-tr pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500/40 rounded-bl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/40 rounded-br pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2.5 mb-3 shrink-0">
        <span className="font-mono text-xs text-cyan-400 tracking-wider flex items-center gap-1.5 font-bold">
          <ListTodo className="w-4 h-4 text-cyan-400" /> GOOGLE TASKS SYNAPSE
        </span>
        <div className="flex items-center gap-2">
          {token && (
            <button
              onClick={fetchTaskLists}
              disabled={isLoadingLists || isLoadingTasks}
              className="p-1 rounded bg-cyan-500/10 border border-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer disabled:opacity-40"
              title="Synchronize registry volumes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLists || isLoadingTasks ? "animate-spin" : ""}`} />
            </button>
          )}
          <span className="font-mono text-[9px] text-cyan-500/50">
            SECURE LINK: {user ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
      </div>

      {/* Auth Screen (Prompt when not logged in) */}
      {needsAuth ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-cyan-500/5 flex items-center justify-center border border-cyan-500/20 animate-pulse">
            <ListTodo className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h4 className="font-mono text-xs text-slate-100 uppercase tracking-widest font-bold">
              Google Workspace Handshake Required
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              To browse, update, create, or delete tasks safely inside this HUD, please authorize with your Google account.
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="gsi-material-button font-mono cursor-pointer scale-95 hover:scale-100 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents font-semibold text-xs tracking-wider">Sign in with Google</span>
            </div>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
          {/* Active User Card & Disconnect */}
          <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-cyan-500/10 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Google User"}
                  className="w-5.5 h-5.5 rounded-full border border-cyan-500/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5.5 h-5.5 rounded-full bg-cyan-500/15 flex items-center justify-center font-mono text-[9px] text-cyan-400 font-bold">
                  {user?.displayName ? user.displayName[0] : "S"}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[10px] text-slate-200 truncate font-semibold leading-none">
                  {user?.displayName || "Stark Administrator"}
                </span>
                <span className="text-[8px] font-mono text-cyan-500/50 leading-none mt-0.5">
                  Scope: Google Tasks Synapse
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 rounded bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-mono uppercase"
              title="Revoke cached tokens"
            >
              <LogOut className="w-3 h-3" /> Disconnect
            </button>
          </div>

          {/* List Selector / Creator Row */}
          <div className="grid grid-cols-12 gap-2 shrink-0">
            <div className="col-span-7">
              <label className="block text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest mb-1 font-bold">
                Selected Registry
              </label>
              {isLoadingLists ? (
                <div className="h-8 flex items-center bg-slate-950/40 border border-cyan-500/10 rounded px-2">
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin mr-1.5" />
                  <span className="font-mono text-[10px] text-slate-500">Syncing registry...</span>
                </div>
              ) : (
                <div className="flex gap-1.5 items-center">
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="w-full h-8 bg-slate-950/80 border border-cyan-500/15 text-[11px] font-mono text-slate-200 rounded px-2 py-0.5 focus:outline-none focus:border-cyan-500/40"
                  >
                    {taskLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.title.toUpperCase()}
                      </option>
                    ))}
                    {taskLists.length === 0 && (
                      <option value="">NO REGISTRY DETECTED</option>
                    )}
                  </select>
                  {selectedListId && taskLists.length > 1 && (
                    <button
                      onClick={() =>
                        promptDeleteList(
                          selectedListId,
                          taskLists.find((l) => l.id === selectedListId)?.title || ""
                        )
                      }
                      className="h-8 px-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
                      title="Destroy selected task list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="col-span-5">
              <label className="block text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest mb-1 font-bold">
                Create Registry
              </label>
              <form onSubmit={handleCreateTaskList} className="flex gap-1">
                <input
                  type="text"
                  placeholder="Registry title..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="flex-1 h-8 bg-slate-950/80 border border-cyan-500/15 text-[11px] font-mono text-slate-200 rounded px-2 focus:outline-none focus:border-cyan-500/40"
                />
                <button
                  type="submit"
                  disabled={isCreatingList || !newListName.trim()}
                  className="h-8 px-2 bg-cyan-500/15 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/20 disabled:opacity-30 rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="Provision custom registry"
                >
                  <ListPlus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* New Task Entry Area */}
          <div className="bg-slate-900/30 border border-cyan-500/5 p-2 rounded-lg shrink-0">
            <span className="block text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest mb-1.5 font-bold">
              Compile New Task Registry Entry
            </span>
            <form onSubmit={handleCreateTask} className="space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Task title (e.g. Calibrate thruster vector)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  className="flex-1 h-8 bg-slate-950/80 border border-cyan-500/15 text-[11px] font-mono text-slate-200 rounded px-2 focus:outline-none focus:border-cyan-500/40"
                />
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="h-8 bg-slate-950/80 border border-cyan-500/15 text-[11px] font-mono text-slate-400 rounded px-1.5 focus:outline-none focus:border-cyan-500/40 shrink-0"
                />
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Optional technical descriptions or notes..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="flex-1 h-8 bg-slate-950/80 border border-cyan-500/15 text-[11px] font-mono text-slate-200 rounded px-2 focus:outline-none focus:border-cyan-500/40"
                />
                <button
                  type="submit"
                  disabled={isCreatingTask || !newTaskTitle.trim() || !selectedListId}
                  className="h-8 px-3.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-30 rounded text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Compile
                </button>
              </div>
            </form>
          </div>

          {/* Tasks Catalog Area */}
          <div className="flex-1 flex flex-col min-h-0 border border-cyan-500/10 rounded-lg bg-slate-950/40">
            {/* Catalog Subheader */}
            <div className="flex items-center justify-between p-2 border-b border-cyan-500/10 bg-slate-900/30 text-[10px] font-mono shrink-0">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-500" /> REGISTRY: {filteredTasks.length} ENTRIES
              </span>
              {/* Filters */}
              <div className="flex items-center gap-1 border border-cyan-500/10 p-0.5 rounded bg-slate-950/60">
                <button
                  onClick={() => setTaskFilter("all")}
                  className={`px-1.5 py-0.5 rounded-sm text-[8px] transition-all cursor-pointer uppercase font-bold ${
                    taskFilter === "all"
                      ? "bg-cyan-500/25 text-cyan-300"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTaskFilter("active")}
                  className={`px-1.5 py-0.5 rounded-sm text-[8px] transition-all cursor-pointer uppercase font-bold ${
                    taskFilter === "active"
                      ? "bg-cyan-500/25 text-cyan-300"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Active ({activeTasksCount})
                </button>
                <button
                  onClick={() => setTaskFilter("completed")}
                  className={`px-1.5 py-0.5 rounded-sm text-[8px] transition-all cursor-pointer uppercase font-bold ${
                    taskFilter === "completed"
                      ? "bg-cyan-500/25 text-cyan-300"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Task list container */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
              {isLoadingTasks ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                    Synchronizing sector contents...
                  </p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-slate-700 animate-pulse" />
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                    No matching sector records found.
                  </p>
                  <p className="font-sans text-[9px] text-slate-600">
                    Sector list is currently empty under chosen filter.
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === "completed";
                  const taskDue = task.due ? new Date(task.due) : null;
                  const isOverdue =
                    taskDue &&
                    !isDone &&
                    taskDue.getTime() < new Date().setHours(0, 0, 0, 0);

                  return (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between p-2 rounded border transition-all text-left group ${
                        isDone
                          ? "bg-emerald-950/5 border-emerald-500/10 opacity-60"
                          : isOverdue
                          ? "bg-rose-950/10 border-rose-500/25 shadow-[0_0_8px_rgba(239,68,68,0.05)]"
                          : "bg-slate-900/30 border-cyan-500/10 hover:border-cyan-500/30 hover:bg-cyan-500/5"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="mt-0.5 text-cyan-500 hover:text-cyan-300 transition-all cursor-pointer shrink-0"
                          title={isDone ? "Mark as active" : "Mark as completed"}
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-cyan-500/40 group-hover:text-cyan-400" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-mono text-xs font-bold leading-snug truncate ${
                              isDone
                                ? "line-through text-slate-500"
                                : "text-slate-100 group-hover:text-cyan-400 transition-all"
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.notes && (
                            <p className="font-sans text-[10px] text-slate-400 leading-relaxed mt-0.5 whitespace-pre-wrap truncate max-h-12 overflow-hidden">
                              {task.notes}
                            </p>
                          )}
                          {taskDue && (
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-[8px] px-1.5 py-0.5 rounded mt-1.5 uppercase font-bold leading-none ${
                                isDone
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : isOverdue
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/20 animate-pulse"
                                  : "bg-cyan-500/10 text-cyan-400"
                              }`}
                            >
                              <Calendar className="w-2.5 h-2.5" />
                              Due: {taskDue.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                              {isOverdue && !isDone && " • OVERDUE"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                        <button
                          onClick={() => promptDeleteTask(task.id, task.title)}
                          className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                          title="Purge task from sector"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Deletion Confirmation Dialog (MANDATORY per workspace-integration rules) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-xl p-5 shadow-[0_0_25px_rgba(244,63,94,0.15)] relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rose-500 pointer-events-none" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rose-500 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rose-500 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rose-500 pointer-events-none" />

            <div className="flex gap-3">
              <div className="w-9 h-9 rounded bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-mono text-xs text-rose-400 uppercase tracking-widest font-bold">
                  Destructive Action Shield
                </h4>
                <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                  Are you absolutely sure you want to purge{" "}
                  <strong className="text-white">"{confirmModal.targetName}"</strong>? This will permanently erase it from Google's cloud storage.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}
                className="px-3 py-1.5 bg-slate-950/60 hover:bg-slate-950 text-slate-400 rounded text-[10px] font-mono uppercase tracking-wider border border-cyan-500/10 hover:border-cyan-500/30 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded text-[10px] font-mono uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(244,63,94,0.2)] transition-all cursor-pointer"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
