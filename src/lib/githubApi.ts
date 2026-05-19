// src/lib/githubApi.ts
/**
 * GitHub Contents API wrapper
 * ─ อ่าน / เขียน / ลบ ไฟล์ผ่าน REST ได้เลยจาก browser
 * ─ ต้องใช้ Personal Access Token (PAT) ที่มีสิทธิ์ repo
 *
 * Vercel Deploy Hook
 * ─ แค่ POST ไปที่ hook URL ก็ trigger deploy ได้เลย
 */

export interface GitHubConfig {
  owner: string; // e.g. "A1enny"
  repo: string; // e.g. "portfolio"
  branch: string; // e.g. "main"
  token: string; // GitHub PAT
}

const BASE = "https://api.github.com";

/* ── helpers ── */
function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

/** Get current SHA of a file (needed for update/delete) */
export async function getFileSha(
  cfg: GitHubConfig,
  filePath: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `${BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}?ref=${cfg.branch}`,
      { headers: headers(cfg.token) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha as string;
  } catch {
    return null;
  }
}

/** Create or update a file in the repo */
export async function upsertFile(
  cfg: GitHubConfig,
  filePath: string,
  content: string, // raw string (will be base64 encoded)
  commitMessage: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const sha = await getFileSha(cfg, filePath);
    const body: Record<string, unknown> = {
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(content))), // utf-8 safe base64
      branch: cfg.branch,
    };
    if (sha) body.sha = sha; // required for update

    const res = await fetch(
      `${BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: headers(cfg.token),
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.message ?? "Unknown error" };
    }
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: String(e) };
  }
}

/** Delete a file from the repo */
export async function deleteFile(
  cfg: GitHubConfig,
  filePath: string,
  commitMessage: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const sha = await getFileSha(cfg, filePath);
    if (!sha) return { success: false, error: "File not found" };

    const res = await fetch(
      `${BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}`,
      {
        method: "DELETE",
        headers: headers(cfg.token),
        body: JSON.stringify({
          message: commitMessage,
          sha,
          branch: cfg.branch,
        }),
      },
    );

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.message ?? "Unknown error" };
    }
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: String(e) };
  }
}

/**
 * Push projects.ts data file to GitHub
 * เวลาแก้ข้อมูลใน Admin จะ generate ไฟล์ใหม่แล้ว push ขึ้น repo
 */
export async function pushProjectsData(
  cfg: GitHubConfig,
  content: string,
  commitMessage = "chore: update projects data from admin",
): Promise<{ success: boolean; error?: string }> {
  return upsertFile(cfg, "src/data/projects.ts", content, commitMessage);
}

/* ── VERCEL DEPLOY HOOK ── */

/**
 * Trigger Vercel production deploy
 * ใช้ Deploy Hook URL จาก .env (VITE_VERCEL_DEPLOY_HOOK)
 */
export async function triggerVercelDeploy(
  hookUrl: string,
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const res = await fetch(hookUrl, { method: "POST" });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }
    const data = await res.json();
    return { success: true, jobId: data.job?.id };
  } catch (e: unknown) {
    return { success: false, error: String(e) };
  }
}

/* ── GITHUB REPO INFO ── */

export interface RepoInfo {
  defaultBranch: string;
  lastCommit: {
    sha: string;
    message: string;
    date: string;
    author: string;
  } | null;
}

export async function getRepoInfo(cfg: GitHubConfig): Promise<RepoInfo> {
  try {
    const [repoRes, commitRes] = await Promise.all([
      fetch(`${BASE}/repos/${cfg.owner}/${cfg.repo}`, {
        headers: headers(cfg.token),
      }),
      fetch(
        `${BASE}/repos/${cfg.owner}/${cfg.repo}/commits/${cfg.branch}?per_page=1`,
        { headers: headers(cfg.token) },
      ),
    ]);

    const repo = repoRes.ok ? await repoRes.json() : null;
    const commit = commitRes.ok ? await commitRes.json() : null;

    return {
      defaultBranch: repo?.default_branch ?? cfg.branch,
      lastCommit: commit
        ? {
            sha: (commit.sha as string).slice(0, 7),
            message: commit.commit?.message?.split("\n")[0] ?? "",
            date: commit.commit?.committer?.date ?? "",
            author: commit.commit?.author?.name ?? "",
          }
        : null,
    };
  } catch {
    return { defaultBranch: cfg.branch, lastCommit: null };
  }
}
