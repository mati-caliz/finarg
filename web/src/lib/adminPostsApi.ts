import type { Post, PostCategory, PostImpact } from "@/lib/labrechaApi";

export interface PostDraft {
  slug: string;
  title: string;
  category: PostCategory;
  summary: string | null;
  content: string;
  impacts: PostImpact[] | null;
  published: boolean;
}

export class AdminApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function adminRequest<ResponseBody>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<ResponseBody> {
  const response = await fetch(`/api/admin/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) {
    return undefined as ResponseBody;
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data && typeof data.detail === "string"
        ? data.detail
        : typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
          ? data.error
          : `Error ${response.status}`;
    throw new AdminApiError(response.status, detail);
  }
  return data as ResponseBody;
}

export const adminSessionApi = {
  check: () => adminRequest<{ authenticated: boolean }>("session", "GET"),
  login: (password: string) => adminRequest<{ authenticated: boolean }>("session", "POST", { password }),
  logout: () => adminRequest<{ authenticated: boolean }>("session", "DELETE"),
};

export const adminPostsApi = {
  listAll: () => adminRequest<Post[]>("data/posts/all", "GET"),
  create: (draft: PostDraft) => adminRequest<Post>("data/posts", "POST", draft),
  update: (postId: number, draft: PostDraft) =>
    adminRequest<Post>(`data/posts/${postId}`, "PUT", draft),
  remove: (postId: number) => adminRequest<undefined>(`data/posts/${postId}`, "DELETE"),
};
