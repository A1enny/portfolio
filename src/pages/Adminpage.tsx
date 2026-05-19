// src/pages/AdminPage.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Upload,
  RefreshCw,
  GitBranch,
  Rocket,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Video,
  Eye,
  Settings,
  FolderOpen,
  Loader2,
  ExternalLink,
  Copy,
  Link2,
} from "lucide-react";

import {
  adminLogin,
  adminLogout,
  onAdminAuthChange,
  fetchCategories,
  addCategory,
  deleteCategory,
  addProject,
  updateProject,
  deleteProject,
  uploadImage,
  type FSCategory,
  type FSProjectItem,
  type FSMediaItem,
} from "../lib/supabase";

import {
  triggerVercelDeploy,
  getRepoInfo,
  type GitHubConfig,
} from "../lib/githubApi";

import type { User } from "@supabase/supabase-js";

/* ══════════════════════════════════════════════
   TYPES & CONSTANTS
══════════════════════════════════════════════ */

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;
const DEPLOY_HOOK = import.meta.env.VITE_VERCEL_DEPLOY_HOOK as string;

function getGitConfig(): GitHubConfig | null {
  try {
    const raw = localStorage.getItem("admin_git_config");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveGitConfig(cfg: GitHubConfig) {
  localStorage.setItem("admin_git_config", JSON.stringify(cfg));
}

type Toast = { id: number; type: "success" | "error" | "info"; msg: string };

/* ══════════════════════════════════════════════
   SMALL UTILITY COMPONENTS
══════════════════════════════════════════════ */

function Spinner({ size = 18 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" />;
}

function Badge({
  children,
  color = "zinc",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  const map: Record<string, string> = {
    zinc: "bg-zinc-800 text-zinc-300 border-zinc-700",
    green: "bg-green-950 text-green-400 border-green-800",
    blue: "bg-blue-950 text-blue-400 border-blue-800",
    red: "bg-red-950 text-red-400 border-red-800",
    amber: "bg-amber-950 text-amber-400 border-amber-800",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${map[color] ?? map.zinc}`}
    >
      {children}
    </span>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl
              ${
                t.type === "success"
                  ? "border-green-700 bg-green-950/90 text-green-300"
                  : t.type === "error"
                    ? "border-red-700 bg-red-950/90 text-red-300"
                    : "border-zinc-700 bg-zinc-900/90 text-zinc-200"
              }`}
          >
            {t.type === "success" ? (
              <Check size={14} />
            ) : t.type === "error" ? (
              <AlertCircle size={14} />
            ) : (
              <RefreshCw size={14} />
            )}
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════
   LOGIN SCREEN
══════════════════════════════════════════════ */

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState(ADMIN_EMAIL ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminLogin(email, password);
      onLogin();
    } catch {
      setError("Invalid credentials. Check email / password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.04) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="rounded-2xl border border-white/10 bg-[#111] p-8 shadow-2xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 border border-white/10">
              <Lock size={16} className="text-white/70" />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.15em] uppercase text-white/30">
                Admin Panel
              </p>
              <p className="text-base font-semibold text-white">Pasin.dev</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] text-white/40 mb-1.5 tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition"
                placeholder="admin@email.com"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 mb-1.5 tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="flex items-center gap-2 text-xs text-red-400">
                <AlertCircle size={12} /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? <Spinner size={15} /> : <Lock size={14} />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   IMAGE UPLOADER
══════════════════════════════════════════════ */

interface UploaderProps {
  onUploaded: (url: string) => void;
  folder?: string;
}

function ImageUploader({ onUploaded, folder = "uploads" }: UploaderProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setError("");
    const path = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    try {
      const url = await uploadImage(file, path, ({ progress }) =>
        setProgress(Math.round(progress)),
      );
      onUploaded(url);
      setProgress(null);
    } catch (e: unknown) {
      setError(String(e));
      setProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/3 p-6 text-center transition hover:border-white/30 hover:bg-white/5"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {progress !== null ? (
        <>
          <Spinner size={20} />
          <p className="text-xs text-white/50">{progress}%</p>
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-white/50 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <Upload
            size={18}
            className="text-white/30 transition group-hover:text-white/60"
          />
          <p className="text-xs text-white/40 group-hover:text-white/60 transition">
            Drop image or click to upload
          </p>
        </>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MEDIA ITEM EDITOR
══════════════════════════════════════════════ */

function MediaEditor({
  items,
  onChange,
}: {
  items: FSMediaItem[];
  onChange: (items: FSMediaItem[]) => void;
}) {
  const [ytInput, setYtInput] = useState("");

  const addYouTube = () => {
    const raw = ytInput.trim();
    if (!raw) return;
    let videoId = raw;
    try {
      const u = new URL(raw);
      if (u.hostname === "youtu.be")
        videoId = u.pathname.slice(1).split("?")[0];
      else videoId = u.searchParams.get("v") ?? raw;
    } catch {}
    onChange([...items, { type: "youtube", videoId }]);
    setYtInput("");
  };

  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 p-2"
          >
            {item.type === "image" ? (
              <img
                src={item.src}
                alt=""
                className="h-10 w-14 rounded-md object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded-md bg-red-900/40 border border-red-800/40">
                <Video size={14} className="text-red-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/60 truncate">
                {item.type === "image" ? item.src : `youtube: ${item.videoId}`}
              </p>
            </div>
            <button
              onClick={() => remove(i)}
              className="flex-shrink-0 rounded-lg p-1.5 text-white/30 hover:bg-red-950 hover:text-red-400 transition"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      <ImageUploader
        folder="projects"
        onUploaded={(url) => onChange([...items, { type: "image", src: url }])}
      />

      <div className="flex gap-2">
        <input
          type="text"
          value={ytInput}
          onChange={(e) => setYtInput(e.target.value)}
          placeholder="YouTube URL or video ID"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition"
        />
        <button
          onClick={addYouTube}
          className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/70 hover:bg-white/12 transition flex items-center gap-1.5"
        >
          <Video size={13} /> Add
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PROJECT FORM MODAL
══════════════════════════════════════════════ */

const emptyProject = (
  categoryId = "",
  category = "",
): Omit<FSProjectItem, "id" | "createdAt" | "updatedAt"> => ({
  categoryId,
  category,
  title: "",
  tagline: "",
  description: "",
  coverImage: "",
  media: [],
  images: [],
  year: new Date().getFullYear().toString(),
  role: "",
  liveUrl: "",
  githubUrl: "",
  highlights: [],
  tags: [],
  order: 0,
});

interface ProjectFormProps {
  categoryName?: string;
  initial?: FSProjectItem;
  categoryId: string;
  onSave: (
    data: Omit<FSProjectItem, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  onClose: () => void;
}

function ProjectForm({
  initial,
  categoryId,
  categoryName = "",
  onSave,
  onClose,
}: ProjectFormProps) {
  const [form, setForm] = useState(
    initial ? { ...initial } : emptyProject(categoryId, categoryName),
  );
  const [saving, setSaving] = useState(false);
  const [highlightInput, setHighlightInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    set("highlights", [...form.highlights, highlightInput.trim()]);
    setHighlightInput("");
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    set("tags", [...form.tags, tagInput.trim()]);
    setTagInput("");
  };

  const handleSave = async () => {
    if (!form.title || !form.tagline) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm py-8 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 className="text-base font-semibold text-white">
            {initial ? "Edit Project" : "New Project"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6 overflow-y-auto max-h-[80vh]">
          {(
            [
              "title",
              "tagline",
              "year",
              "role",
              "liveUrl",
              "githubUrl",
            ] as const
          ).map((field) => (
            <div key={field}>
              <label className="block text-[11px] text-white/40 mb-1.5 capitalize tracking-wide">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                value={(form[field] as string) ?? ""}
                onChange={(e) => set(field, e.target.value as never)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition"
              />
            </div>
          ))}

          <div>
            <label className="block text-[11px] text-white/40 mb-1.5 tracking-wide">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-1.5 tracking-wide">
              Cover Image
            </label>
            {form.coverImage && (
              <img
                src={form.coverImage}
                alt=""
                className="mb-2 h-24 w-full rounded-xl object-cover"
              />
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => set("coverImage", e.target.value)}
                placeholder="URL or upload below"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition"
              />
            </div>
            <div className="mt-2">
              <ImageUploader
                folder="covers"
                onUploaded={(url) => set("coverImage", url)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-1.5 tracking-wide">
              Media (Images + YouTube)
            </label>
            <MediaEditor items={form.media} onChange={(m) => set("media", m)} />
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-1.5 tracking-wide">
              Highlights
            </label>
            <div className="flex flex-col gap-1.5 mb-2">
              {form.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5"
                >
                  <span className="flex-1 text-xs text-white/70">{h}</span>
                  <button
                    onClick={() =>
                      set(
                        "highlights",
                        form.highlights.filter((_, j) => j !== i),
                      )
                    }
                    className="text-white/30 hover:text-red-400 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHighlight()}
                placeholder="Add highlight…"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition"
              />
              <button
                onClick={addHighlight}
                className="rounded-xl border border-white/10 bg-white/8 px-3 text-xs text-white/70 hover:bg-white/12 transition"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-1.5 tracking-wide">
              Tags / Tech Stack
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((t, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs text-white/60"
                >
                  {t}
                  <button
                    onClick={() =>
                      set(
                        "tags",
                        form.tags.filter((_, j) => j !== i),
                      )
                    }
                    className="text-white/30 hover:text-red-400 transition"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="React, Figma, etc."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition"
              />
              <button
                onClick={addTag}
                className="rounded-xl border border-white/10 bg-white/8 px-3 text-xs text-white/70 hover:bg-white/12 transition"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-1.5 tracking-wide">
              Order (display position)
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => set("order", Number(e.target.value))}
              className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/25 transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/8 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/8 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50 transition"
          >
            {saving ? <Spinner size={14} /> : <Check size={14} />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   CATEGORY MANAGER PANEL
══════════════════════════════════════════════ */

interface CatPanelProps {
  categories: FSCategory[];
  onRefresh: () => void;
  pushToast: (t: Omit<Toast, "id">) => void;
}

function CategoryManager({ categories, onRefresh, pushToast }: CatPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<{
    catId: string;
    project?: FSProjectItem;
  } | null>(null);
  const [confirmDel, setConfirmDel] = useState<{
    type: "cat" | "proj";
    catId: string;
    projId?: string;
    label: string;
  } | null>(null);
  const [newCat, setNewCat] = useState({
    id: "",
    category: "",
    icon: "📁",
    order: 0,
  });
  const [showNewCat, setShowNewCat] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  const handleAddCat = async () => {
    if (!newCat.id || !newCat.category) return;
    setSavingCat(true);
    try {
      await addCategory(newCat);
      pushToast({
        type: "success",
        msg: `Category "${newCat.category}" created`,
      });
      setShowNewCat(false);
      setNewCat({ id: "", category: "", icon: "📁", order: 0 });
      onRefresh();
    } catch (e: unknown) {
      pushToast({ type: "error", msg: String(e) });
    } finally {
      setSavingCat(false);
    }
  };

  const handleDelConfirm = async () => {
    if (!confirmDel) return;
    try {
      if (confirmDel.type === "cat") {
        await deleteCategory(confirmDel.catId);
        pushToast({ type: "success", msg: "Category deleted" });
      } else if (confirmDel.projId) {
        await deleteProject(confirmDel.catId, confirmDel.projId);
        pushToast({ type: "success", msg: "Project deleted" });
      }
      setConfirmDel(null);
      onRefresh();
    } catch (e: unknown) {
      pushToast({ type: "error", msg: String(e) });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-white">
          Categories & Projects
        </h2>
        <button
          onClick={() => setShowNewCat(!showNewCat)}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white transition"
        >
          <Plus size={13} /> New Category
        </button>
      </div>

      <AnimatePresence>
        {showNewCat && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-white/10 bg-white/4 p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/40 mb-1">
                    ID (slug)
                  </label>
                  <input
                    value={newCat.id}
                    onChange={(e) =>
                      setNewCat({
                        ...newCat,
                        id: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }
                    placeholder="e.g. web-design"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1">
                    Display Name
                  </label>
                  <input
                    value={newCat.category}
                    onChange={(e) =>
                      setNewCat({ ...newCat, category: e.target.value })
                    }
                    placeholder="Web · UI/UX"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1">
                    Icon (emoji)
                  </label>
                  <input
                    value={newCat.icon}
                    onChange={(e) =>
                      setNewCat({ ...newCat, icon: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/25 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={newCat.order}
                    onChange={(e) =>
                      setNewCat({ ...newCat, order: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/25 transition"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowNewCat(false)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCat}
                  disabled={savingCat}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-50 transition"
                >
                  {savingCat ? <Spinner size={12} /> : <Plus size={12} />}{" "}
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {categories.map((cat) => (
        <div
          key={cat.id}
          className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/4 transition"
            onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
          >
            <span className="text-lg">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{cat.category}</p>
              <p className="text-[11px] text-white/35">
                {cat.id} · {cat.items.length} projects
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectForm({ catId: cat.id });
                }}
                className="rounded-lg border border-white/8 bg-white/6 p-1.5 text-white/40 hover:text-white hover:bg-white/12 transition"
              >
                <Plus size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDel({
                    type: "cat",
                    catId: cat.id,
                    label: cat.category,
                  });
                }}
                className="rounded-lg border border-white/8 bg-white/6 p-1.5 text-white/40 hover:text-red-400 hover:bg-red-950 transition"
              >
                <Trash2 size={13} />
              </button>
              <ChevronDown
                size={14}
                className={`text-white/30 transition-transform ${expanded === cat.id ? "rotate-180" : ""}`}
              />
            </div>
          </div>

          <AnimatePresence initial={false}>
            {expanded === cat.id && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-white/6 px-4 py-3 flex flex-col gap-2">
                  {cat.items.length === 0 && (
                    <p className="text-xs text-white/25 text-center py-2">
                      No projects yet
                    </p>
                  )}
                  {cat.items.map((proj) => (
                    <div
                      key={proj.id}
                      className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 p-2.5 group"
                    >
                      <img
                        src={proj.coverImage}
                        alt=""
                        className="h-10 w-14 rounded-md object-cover flex-shrink-0 bg-white/5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/85 truncate">
                          {proj.title}
                        </p>
                        <p className="text-[11px] text-white/35 truncate">
                          {proj.tagline}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() =>
                            setProjectForm({ catId: cat.id, project: proj })
                          }
                          className="rounded-lg p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDel({
                              type: "proj",
                              catId: cat.id,
                              projId: proj.id,
                              label: proj.title,
                            })
                          }
                          className="rounded-lg p-1.5 text-white/40 hover:text-red-400 hover:bg-red-950 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <Badge color="zinc">{proj.year}</Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <AnimatePresence>
        {projectForm && (
          <ProjectForm
            initial={projectForm.project}
            categoryId={projectForm.catId}
            categoryName={
              categories.find((c) => c.id === projectForm.catId)?.category ?? ""
            }
            onClose={() => {
              setProjectForm(null);
              onRefresh();
            }}
            onSave={async (data) => {
              if (projectForm.project) {
                await updateProject(
                  projectForm.catId,
                  projectForm.project.id,
                  data,
                );
                pushToast({ type: "success", msg: "Project updated" });
              } else {
                await addProject(projectForm.catId, data);
                pushToast({ type: "success", msg: "Project created" });
              }
              onRefresh();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl"
            >
              <p className="text-base font-semibold text-white mb-2">
                Delete "{confirmDel.label}"?
              </p>
              <p className="text-sm text-white/45 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDel(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelConfirm}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DEPLOY PANEL  (updated version from doc 2)
══════════════════════════════════════════════ */

interface GHRepo {
  full_name: string;
  name: string;
  owner: { login: string };
  default_branch: string;
  private: boolean;
}
interface GHBranch {
  name: string;
}

function DeployPanel({
  pushToast,
}: {
  pushToast: (t: Omit<Toast, "id">) => void;
}) {
  const [token, setToken] = useState(() => getGitConfig()?.token ?? "");
  const [showToken, setShowToken] = useState(false);
  const [repos, setRepos] = useState<GHRepo[]>([]);
  const [branches, setBranches] = useState<GHBranch[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GHRepo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [fetchingBranches, setFetchingBranches] = useState(false);
  const [repoInfo, setRepoInfo] = useState<Awaited<
    ReturnType<typeof getRepoInfo>
  > | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<
    "idle" | "running" | "done" | "error"
  >("idle");

  useEffect(() => {
    const saved = getGitConfig();
    if (!saved?.token) return;
    setToken(saved.token);
    if (saved.owner && saved.repo) {
      fetchReposWithToken(saved.token, {
        owner: saved.owner,
        repo: saved.repo,
        branch: saved.branch,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReposWithToken = async (
    pat: string,
    restore?: { owner: string; repo: string; branch: string },
  ) => {
    if (!pat.trim()) {
      pushToast({ type: "error", msg: "ใส่ PAT Token ก่อนครับ" });
      return;
    }
    setFetchingRepos(true);
    setRepos([]);
    setSelectedRepo(null);
    setBranches([]);
    setRepoInfo(null);
    try {
      const all: GHRepo[] = [];
      for (let page = 1; page <= 3; page++) {
        const res = await fetch(
          `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`,
          {
            headers: {
              Authorization: `Bearer ${pat}`,
              Accept: "application/vnd.github+json",
            },
          },
        );
        if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`);
        const data: GHRepo[] = await res.json();
        all.push(...data);
        if (data.length < 100) break;
      }
      setRepos(all);
      if (restore) {
        const found = all.find(
          (r) => r.name === restore.repo && r.owner.login === restore.owner,
        );
        if (found) {
          setSelectedRepo(found);
          await loadBranches(pat, found, restore.branch);
        }
      }
      pushToast({ type: "success", msg: `พบ ${all.length} repos ✓` });
    } catch (e: unknown) {
      pushToast({ type: "error", msg: String(e) });
    } finally {
      setFetchingRepos(false);
    }
  };

  const loadBranches = async (
    pat: string,
    repo: GHRepo,
    selectBranch?: string,
  ) => {
    setFetchingBranches(true);
    setBranches([]);
    setRepoInfo(null);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo.full_name}/branches?per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${pat}`,
            Accept: "application/vnd.github+json",
          },
        },
      );
      if (!res.ok) throw new Error(`GitHub ${res.status}`);
      const data: GHBranch[] = await res.json();
      setBranches(data);
      const branch = selectBranch ?? repo.default_branch;
      setSelectedBranch(branch);
      const cfg: GitHubConfig = {
        owner: repo.owner.login,
        repo: repo.name,
        branch,
        token: pat,
      };
      const info = await getRepoInfo(cfg);
      setRepoInfo(info);
      saveGitConfig(cfg);
    } catch (e: unknown) {
      pushToast({ type: "error", msg: String(e) });
    } finally {
      setFetchingBranches(false);
    }
  };

  const handleSelectRepo = async (fullName: string) => {
    const repo = repos.find((r) => r.full_name === fullName);
    if (!repo) return;
    setSelectedRepo(repo);
    await loadBranches(token, repo);
  };

  const handleSelectBranch = async (branch: string) => {
    setSelectedBranch(branch);
    if (!selectedRepo) return;
    const cfg: GitHubConfig = {
      owner: selectedRepo.owner.login,
      repo: selectedRepo.name,
      branch,
      token,
    };
    saveGitConfig(cfg);
    setFetchingBranches(true);
    try {
      const info = await getRepoInfo(cfg);
      setRepoInfo(info);
    } finally {
      setFetchingBranches(false);
    }
  };

  const handleDeploy = async () => {
    if (!DEPLOY_HOOK) {
      pushToast({ type: "error", msg: "No Vercel Deploy Hook configured" });
      return;
    }
    setDeploying(true);
    setDeployStatus("running");
    try {
      const res = await triggerVercelDeploy(DEPLOY_HOOK);
      if (res.success) {
        setDeployStatus("done");
        pushToast({
          type: "success",
          msg: "🚀 Vercel deploy triggered! ใช้เวลาประมาณ 1-2 นาที",
        });
      } else {
        setDeployStatus("error");
        pushToast({ type: "error", msg: res.error ?? "Deploy failed" });
      }
    } finally {
      setDeploying(false);
      setTimeout(() => setDeployStatus("idle"), 8000);
    }
  };

  const isConnected = !!selectedRepo && !fetchingRepos;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">
          Deploy & GitHub
        </h2>
        <p className="text-[11px] text-white/35 leading-relaxed">
          ข้อมูล project เก็บใน{" "}
          <strong className="text-white/60">Supabase</strong> — แก้ข้อมูลในหน้า
          Projects แล้ว{" "}
          <strong className="text-white/60">กด Deploy ได้เลย</strong> ไม่ต้อง
          push GitHub ใหม่
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-4">
        <p className="text-xs font-semibold text-blue-400 mb-3 flex items-center gap-1.5">
          <span>💡</span> Flow จริง
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {[
            {
              label: "แก้ข้อมูล",
              sub: "Admin Panel",
              color: "bg-blue-900/60 text-blue-300 border-blue-700/50",
            },
            { label: "→", arrow: true },
            {
              label: "Supabase",
              sub: "บันทึกอัตโนมัติ",
              color: "bg-green-900/60 text-green-300 border-green-700/50",
            },
            { label: "→", arrow: true },
            {
              label: "Deploy Hook",
              sub: "กดปุ่มด้านล่าง",
              color: "bg-purple-900/60 text-purple-300 border-purple-700/50",
            },
            { label: "→", arrow: true },
            {
              label: "Vercel Build",
              sub: "~1-2 นาที",
              color: "bg-zinc-800 text-zinc-300 border-zinc-600/50",
            },
            { label: "→", arrow: true },
            {
              label: "Production ✓",
              sub: "live!",
              color: "bg-green-900/60 text-green-300 border-green-700/50",
            },
          ].map((s, i) =>
            s.arrow ? (
              <span key={i} className="text-white/20 text-[11px]">
                →
              </span>
            ) : (
              <div key={i} className="flex flex-col">
                <span
                  className={`text-[10px] font-medium px-2 py-1 rounded-md border ${s.color}`}
                >
                  {s.label}
                </span>
                {s.sub && (
                  <span className="text-[9px] text-white/25 text-center mt-0.5">
                    {s.sub}
                  </span>
                )}
              </div>
            ),
          )}
        </div>
        <div className="flex flex-col gap-1.5 text-[11px] text-blue-300/60 leading-relaxed border-t border-blue-900/40 pt-3">
          <p className="flex items-start gap-1.5">
            <Check size={11} className="text-green-400 mt-0.5 flex-shrink-0" />
            Vercel ดึง{" "}
            <strong className="text-blue-300/80">code จาก GitHub</strong> + ดึง{" "}
            <strong className="text-blue-300/80">ข้อมูลจาก Supabase</strong>{" "}
            runtime ทุกครั้งที่ผู้ใช้เปิดเว็บ
          </p>
          <p className="flex items-start gap-1.5">
            <Check size={11} className="text-green-400 mt-0.5 flex-shrink-0" />
            ไม่ต้อง push code ขึ้น GitHub ทุกครั้งที่แก้ข้อมูล — push แค่ตอนแก้{" "}
            <strong className="text-blue-300/80">code จริงๆ</strong>
          </p>
          <p className="flex items-start gap-1.5">
            <AlertCircle
              size={11}
              className="text-amber-400 mt-0.5 flex-shrink-0"
            />
            กด Deploy เพื่อ clear cache / force rebuild เท่านั้น ปกติไม่จำเป็น
          </p>
        </div>
      </div>

      {/* Vercel Deploy */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Rocket size={14} className="text-white/40" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Vercel Deploy
          </span>
          <Badge color="green">Ready</Badge>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2">
          <Link2 size={12} className="text-white/30 flex-shrink-0" />
          <p className="text-[11px] text-white/40 font-mono truncate flex-1">
            {DEPLOY_HOOK
              ? DEPLOY_HOOK.slice(0, 70) + "…"
              : "No hook configured in .env"}
          </p>
        </div>

        <motion.button
          onClick={handleDeploy}
          disabled={deploying || !DEPLOY_HOOK}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`flex items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-semibold transition disabled:opacity-40
            ${
              deployStatus === "done"
                ? "bg-green-600 text-white"
                : deployStatus === "error"
                  ? "bg-red-600 text-white"
                  : "bg-white text-black hover:bg-white/90"
            }`}
        >
          {deploying ? (
            <Spinner size={16} />
          ) : deployStatus === "done" ? (
            <Check size={16} />
          ) : (
            <Rocket size={16} />
          )}
          {deploying
            ? "Triggering Deploy…"
            : deployStatus === "done"
              ? "Deploy Triggered! ✓ รอ 1-2 นาที"
              : deployStatus === "error"
                ? "Deploy Failed — ลองใหม่"
                : "Deploy to Production"}
        </motion.button>

        {(deployStatus === "running" || deployStatus === "done") && (
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition"
          >
            <ExternalLink size={11} /> ดู Deploy Status บน Vercel Dashboard
          </a>
        )}
      </div>

      {/* GitHub Status (optional) */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-white/40" />
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              GitHub Status
            </span>
          </div>
          <Badge color="zinc">Optional</Badge>
        </div>
        <p className="text-[11px] text-white/30 -mt-2 leading-relaxed">
          ใช้สำหรับดู last commit เท่านั้น — ไม่จำเป็นต้องกรอกถ้าไม่ต้องการ
        </p>

        {/* PAT */}
        <div>
          <label className="block text-[11px] text-white/40 mb-1.5">
            git add .
            <br />
            git commit -m "Your commit message"
            <br />
            git push origin main
            <br />
            <br />
          </label>
          <label className="block text-[11px] text-white/40 mb-1.5">
            PAT Token
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && fetchReposWithToken(token)
                }
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 pr-9 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition"
              />
              <button
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
              >
                <Eye size={13} />
              </button>
            </div>
            <button
              onClick={() => fetchReposWithToken(token)}
              disabled={fetchingRepos || !token.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/15 disabled:opacity-40 transition whitespace-nowrap"
            >
              {fetchingRepos ? <Spinner size={13} /> : <RefreshCw size={13} />}
              {fetchingRepos ? "Loading…" : "Fetch Repos"}
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-white/25">
            scope: <span className="font-mono text-white/40">repo</span>{" "}
            (Settings → Developer settings → Personal access tokens)
          </p>
        </div>

        {/* Repo dropdown */}
        {repos.length > 0 && (
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5">
              Repository
            </label>
            <div className="relative">
              <select
                value={selectedRepo?.full_name ?? ""}
                onChange={(e) => handleSelectRepo(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30 transition cursor-pointer"
              >
                <option value="" className="bg-zinc-900">
                  — เลือก Repository —
                </option>
                {repos.map((r) => (
                  <option
                    key={r.full_name}
                    value={r.full_name}
                    className="bg-zinc-900"
                  >
                    {r.private ? "🔒 " : "📂 "}
                    {r.full_name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
              />
            </div>
          </div>
        )}

        {/* Branch dropdown */}
        {selectedRepo && (
          <div>
            <label className="block text-[11px] text-white/40 mb-1.5">
              Branch
            </label>
            <div className="relative">
              {fetchingBranches ? (
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <Spinner size={13} />
                  <span className="text-sm text-white/40">
                    Loading branches…
                  </span>
                </div>
              ) : (
                <>
                  <select
                    value={selectedBranch}
                    onChange={(e) => handleSelectBranch(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30 transition cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option
                        key={b.name}
                        value={b.name}
                        className="bg-zinc-900"
                      >
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Connected + last commit */}
        {isConnected && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge color="green">
                <Check size={10} /> Connected
              </Badge>
              <span className="text-[11px] text-white/35">
                {selectedRepo.full_name} / {selectedBranch}
              </span>
            </div>
            {repoInfo?.lastCommit && (
              <div className="rounded-xl border border-white/6 bg-white/4 p-3 flex flex-col gap-1">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">
                  Last Commit
                </p>
                <p className="text-xs font-mono text-white/80 truncate">
                  <span className="text-white/45">
                    {repoInfo.lastCommit.sha}
                  </span>{" "}
                  — {repoInfo.lastCommit.message}
                </p>
                <p className="text-[11px] text-white/35">
                  by {repoInfo.lastCommit.author} ·{" "}
                  {new Date(repoInfo.lastCommit.date).toLocaleString("th-TH", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   QUICK UPLOAD PANEL
══════════════════════════════════════════════ */

function UploadPanel({
  pushToast,
}: {
  pushToast: (t: Omit<Toast, "id">) => void;
}) {
  const [uploads, setUploads] = useState<{ name: string; url: string }[]>([]);
  const [folder, setFolder] = useState("misc");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold text-white">Quick Image Upload</h2>

      <div className="flex items-center gap-2">
        <label className="text-xs text-white/40">Folder:</label>
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-white/25 transition w-40"
        />
      </div>

      <ImageUploader
        folder={folder}
        onUploaded={(url) => {
          const name = url.split("/").pop()?.split("?")[0] ?? url;
          setUploads((u) => [{ name, url }, ...u]);
          pushToast({ type: "success", msg: "Uploaded ✓" });
        }}
      />

      <div className="flex flex-col gap-2">
        {uploads.map((u, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3"
          >
            <img
              src={u.url}
              alt=""
              className="h-10 w-14 rounded-md object-cover flex-shrink-0"
            />
            <p className="flex-1 text-xs text-white/50 truncate font-mono">
              {u.url}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(u.url);
                pushToast({ type: "info", msg: "URL copied!" });
              }}
              className="rounded-lg p-1.5 text-white/30 hover:text-white hover:bg-white/10 transition"
            >
              <Copy size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SETTINGS PANEL
══════════════════════════════════════════════ */

function SettingsPanel({
  user,
  onLogout,
  pushToast,
}: {
  user: User;
  onLogout: () => void;
  pushToast: (t: Omit<Toast, "id">) => void;
}) {
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);

  const handleMigrate = async () => {
    if (
      !window.confirm(
        "⚠️ รัน Migration จะเขียนข้อมูลจาก projects.ts ลง Supabase\nถ้ามีข้อมูลอยู่แล้วจะถูก overwrite\n\nดำเนินการต่อ?",
      )
    )
      return;
    setMigrating(true);
    try {
      const { runMigration } = await import("../scripts/migrate");
      await runMigration();
      setMigrated(true);
      pushToast({
        type: "success",
        msg: "Migration สำเร็จ! ตรวจสอบ Supabase ได้เลย",
      });
    } catch (e: unknown) {
      pushToast({ type: "error", msg: "Migration ล้มเหลว: " + String(e) });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold text-white">Settings</h2>

      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-lg">
          {user.email?.[0]?.toUpperCase() ?? "A"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{user.email}</p>
          <Badge color="green">Admin</Badge>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-white/60 hover:text-red-400 hover:bg-red-950 hover:border-red-800 transition"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
          Environment
        </p>
        <div className="flex flex-col gap-2 font-mono text-[11px]">
          {[
            ["Supabase URL", import.meta.env.VITE_SUPABASE_URL],
            ["Admin Email", import.meta.env.VITE_ADMIN_EMAIL],
            ["Deploy Hook", DEPLOY_HOOK ? "✓ Configured" : "✗ Not set"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="text-white/30 w-32 flex-shrink-0">{k}</span>
              <span className="text-white/60 truncate">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 p-5">
        <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-1">
          Data Migration
        </p>
        <p className="text-[11px] text-white/30 mb-4">
          Import ข้อมูลจาก{" "}
          <span className="font-mono text-white/50">projects.ts</span> เข้า
          Supabase — รันแค่ครั้งเดียว หลังจากนั้นจัดการข้อมูลผ่าน Admin ได้เลย
        </p>
        <button
          onClick={handleMigrate}
          disabled={migrating || migrated}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition
            ${
              migrated
                ? "bg-green-950 border border-green-800 text-green-400 cursor-default"
                : "bg-amber-500/10 border border-amber-700/50 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
            }`}
        >
          {migrating ? (
            <>
              <Spinner size={13} /> กำลัง migrate...
            </>
          ) : migrated ? (
            <>
              <Check size={13} /> Migration สำเร็จแล้ว
            </>
          ) : (
            <>
              <Upload size={13} /> Run Migration
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN ADMIN PAGE
══════════════════════════════════════════════ */

type Tab = "projects" | "upload" | "deploy" | "settings";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "projects", label: "Projects", icon: <FolderOpen size={15} /> },
  { id: "upload", label: "Upload", icon: <ImageIcon size={15} /> },
  { id: "deploy", label: "Deploy", icon: <Rocket size={15} /> },
  { id: "settings", label: "Settings", icon: <Settings size={15} /> },
];

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("projects");
  const [categories, setCategories] = useState<FSCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== id)),
      3500,
    );
  }, []);

  const loadCategories = useCallback(async () => {
    setLoadingCats(true);
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (e: unknown) {
      pushToast({ type: "error", msg: String(e) });
    } finally {
      setLoadingCats(false);
    }
  }, [pushToast]);

  useEffect(() => {
    const unsub = onAdminAuthChange((u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) loadCategories();
    });
    return unsub;
  }, [loadCategories]);

  const handleLogout = async () => {
    await adminLogout();
    setUser(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={loadCategories} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right,rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-md bg-white/90" />
            <span className="text-sm font-semibold">Admin Panel</span>
            <Badge color="zinc">Pasin.dev</Badge>
          </div>
          <div className="flex items-center gap-2">
            {loadingCats && <Spinner size={14} />}
            <button
              onClick={loadCategories}
              className="rounded-lg p-1.5 text-white/30 hover:text-white hover:bg-white/8 transition"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-6 flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-48 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition whitespace-nowrap
                  ${
                    tab === t.id
                      ? "bg-white/10 text-white border border-white/12"
                      : "text-white/45 hover:text-white hover:bg-white/5"
                  }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "projects" && (
                <CategoryManager
                  categories={categories}
                  onRefresh={loadCategories}
                  pushToast={pushToast}
                />
              )}
              {tab === "upload" && <UploadPanel pushToast={pushToast} />}
              {tab === "deploy" && <DeployPanel pushToast={pushToast} />}
              {tab === "settings" && (
                <SettingsPanel
                  user={user}
                  onLogout={handleLogout}
                  pushToast={pushToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ToastStack toasts={toasts} />
    </div>
  );
}
