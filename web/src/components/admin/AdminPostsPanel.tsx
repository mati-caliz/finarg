"use client";

import { Badge, Button, Card } from "@/components/core";
import { POST_CATEGORY_LABELS, formatPostDate } from "@/components/posts/postCategories";
import { POST_IMPACT_META } from "@/components/posts/postImpacts";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminApiError, type PostDraft, adminPostsApi, adminSessionApi } from "@/lib/adminPostsApi";
import {
  POST_CATEGORIES,
  POST_IMPACT_KINDS,
  type Post,
  type PostCategory,
  type PostImpact,
  type PostImpactKind,
} from "@/lib/labrechaApi";
import { LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const EMPTY_DRAFT: PostDraft = {
  slug: "",
  title: "",
  category: "idea",
  summary: null,
  content: "",
  impacts: null,
  published: false,
};

const EMPTY_IMPACT: PostImpact = { kind: "tiempo", value: "", label: "" };

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function toDraft(post: Post): PostDraft {
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    summary: post.summary,
    content: post.content,
    impacts: post.impacts,
    published: post.published,
  };
}

const fieldStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--line2)",
  background: "var(--raise)",
  color: "var(--ink)",
  fontSize: "0.875rem",
  fontFamily: "var(--font-display)",
} as const;

const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--ink2)",
} as const;

interface LoginFormProps {
  onAuthenticated: () => void;
}

function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await adminSessionApi.login(password);
      onAuthenticated();
    } catch (error) {
      setErrorMessage(error instanceof AdminApiError ? error.message : "Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}
      >
        <label style={labelStyle} htmlFor="admin-password">
          Contraseña
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={fieldStyle}
        />
        {errorMessage && (
          <p style={{ fontSize: "0.8125rem", color: "var(--neg)", margin: 0 }}>{errorMessage}</p>
        )}
        <button
          type="submit"
          disabled={submitting || password.length === 0}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--gap)",
            background: "var(--gap)",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting || password.length === 0 ? 0.6 : 1,
          }}
        >
          Ingresar
        </button>
      </form>
    </Card>
  );
}

interface PostFormProps {
  initialDraft: PostDraft;
  isNew: boolean;
  saving: boolean;
  errorMessage: string | null;
  onSave: (draft: PostDraft) => void;
  onCancel: () => void;
}

function PostForm({ initialDraft, isNew, saving, errorMessage, onSave, onCancel }: PostFormProps) {
  const [draft, setDraft] = useState<PostDraft>(initialDraft);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  const canSave =
    draft.title.trim().length > 0 && draft.slug.length > 0 && draft.content.trim().length > 0;

  return (
    <Card>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canSave) {
            const completeImpacts = (draft.impacts ?? []).filter(
              (impact) => impact.value.trim().length > 0 && impact.label.trim().length > 0,
            );
            onSave({ ...draft, impacts: completeImpacts.length > 0 ? completeImpacts : null });
          }
        }}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <h2
          style={{
            font: "var(--fw-semibold) 1.125rem/var(--lh-heading) var(--font-display)",
            margin: 0,
          }}
        >
          {isNew ? "Nueva publicación" : `Editando: ${initialDraft.title}`}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle} htmlFor="post-title">
            Título
          </label>
          <input
            id="post-title"
            value={draft.title}
            onChange={(event) => {
              const title = event.target.value;
              setDraft((current) => ({
                ...current,
                title,
                slug: slugTouched ? current.slug : slugify(title),
              }));
            }}
            style={fieldStyle}
          />
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 240px" }}>
            <label style={labelStyle} htmlFor="post-slug">
              Slug (URL)
            </label>
            <input
              id="post-slug"
              value={draft.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setDraft((current) => ({ ...current, slug: slugify(event.target.value) }));
              }}
              style={{ ...fieldStyle, fontFamily: "var(--font-jb-mono)" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "0 1 180px" }}>
            <label style={labelStyle} htmlFor="post-category">
              Categoría
            </label>
            <select
              id="post-category"
              value={draft.category}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  category: event.target.value as PostCategory,
                }))
              }
              style={fieldStyle}
            >
              {POST_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {POST_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle} htmlFor="post-summary">
            Resumen (opcional)
          </label>
          <input
            id="post-summary"
            value={draft.summary ?? ""}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                summary: event.target.value.length > 0 ? event.target.value : null,
              }))
            }
            style={fieldStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={labelStyle}>Impactos estimados</span>
          {(draft.impacts ?? []).map((impact, index) => (
            <div
              key={`impact-${index}-${impact.kind}`}
              style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
            >
              <select
                value={impact.kind}
                onChange={(event) => {
                  const kind = event.target.value as PostImpactKind;
                  setDraft((current) => ({
                    ...current,
                    impacts: (current.impacts ?? []).map((item, itemIndex) =>
                      itemIndex === index ? { ...item, kind } : item,
                    ),
                  }));
                }}
                style={{ ...fieldStyle, width: 150, flex: "0 0 auto" }}
              >
                {POST_IMPACT_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {POST_IMPACT_META[kind].label}
                  </option>
                ))}
              </select>
              <input
                value={impact.value}
                placeholder="Valor (ej: -30 min)"
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((current) => ({
                    ...current,
                    impacts: (current.impacts ?? []).map((item, itemIndex) =>
                      itemIndex === index ? { ...item, value } : item,
                    ),
                  }));
                }}
                style={{
                  ...fieldStyle,
                  width: 160,
                  flex: "0 1 auto",
                  fontFamily: "var(--font-jb-mono)",
                }}
              />
              <input
                value={impact.label}
                placeholder="Descripción corta"
                onChange={(event) => {
                  const label = event.target.value;
                  setDraft((current) => ({
                    ...current,
                    impacts: (current.impacts ?? []).map((item, itemIndex) =>
                      itemIndex === index ? { ...item, label } : item,
                    ),
                  }));
                }}
                style={{ ...fieldStyle, flex: "1 1 200px" }}
              />
              <button
                type="button"
                aria-label="Quitar impacto"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    impacts: (current.impacts ?? []).filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
                style={{
                  border: "1px solid var(--line)",
                  background: "var(--raise)",
                  color: "var(--ink3)",
                  borderRadius: "var(--radius-md)",
                  padding: 6,
                  cursor: "pointer",
                  display: "inline-flex",
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() =>
              setDraft((current) => ({
                ...current,
                impacts: [...(current.impacts ?? []), { ...EMPTY_IMPACT }],
              }))
            }
          >
            Agregar impacto
          </Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle} htmlFor="post-content">
            Contenido (Markdown)
          </label>
          <textarea
            id="post-content"
            value={draft.content}
            onChange={(event) =>
              setDraft((current) => ({ ...current, content: event.target.value }))
            }
            rows={14}
            style={{ ...fieldStyle, fontFamily: "var(--font-jb-mono)", resize: "vertical" }}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(event) =>
              setDraft((current) => ({ ...current, published: event.target.checked }))
            }
          />
          Publicado (visible en /ideas)
        </label>

        {errorMessage && (
          <p style={{ fontSize: "0.8125rem", color: "var(--neg)", margin: 0 }}>{errorMessage}</p>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            disabled={!canSave || saving}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--gap)",
              background: "var(--gap)",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              cursor: saving ? "wait" : "pointer",
              opacity: !canSave || saving ? 0.6 : 1,
            }}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function AdminPostsPanel() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editing, setEditing] = useState<Post | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    setListError(null);
    try {
      setPosts(await adminPostsApi.listAll());
    } catch (error) {
      if (error instanceof AdminApiError && error.status === 401) {
        setAuthenticated(false);
      } else {
        setListError(error instanceof Error ? error.message : "Error al cargar publicaciones");
      }
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    void adminSessionApi
      .check()
      .then((session) => {
        setAuthenticated(session.authenticated);
        if (session.authenticated) {
          void loadPosts();
        }
      })
      .finally(() => setSessionChecked(true));
  }, [loadPosts]);

  const handleAuthenticated = () => {
    setAuthenticated(true);
    void loadPosts();
  };

  const handleLogout = async () => {
    await adminSessionApi.logout();
    setAuthenticated(false);
    setPosts([]);
    setEditing(null);
  };

  const handleSave = async (draft: PostDraft) => {
    if (editing === null) {
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing === "new") {
        await adminPostsApi.create(draft);
      } else {
        await adminPostsApi.update(editing.id, draft);
      }
      setEditing(null);
      await loadPosts();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`¿Eliminar "${post.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await adminPostsApi.remove(post.id);
      await loadPosts();
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Error al eliminar");
    }
  };

  if (!sessionChecked) {
    return <Skeleton className="h-[200px] rounded-[10px]" />;
  }

  if (!authenticated) {
    return <LoginForm onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
      >
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setFormError(null);
            setEditing("new");
          }}
          disabled={editing !== null}
        >
          Nueva publicación
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<LogOut className="h-3.5 w-3.5" />}
          onClick={() => void handleLogout()}
        >
          Salir
        </Button>
      </div>

      {editing !== null && (
        <PostForm
          key={editing === "new" ? "new" : editing.id}
          initialDraft={editing === "new" ? EMPTY_DRAFT : toDraft(editing)}
          isNew={editing === "new"}
          saving={saving}
          errorMessage={formError}
          onSave={(draft) => void handleSave(draft)}
          onCancel={() => setEditing(null)}
        />
      )}

      {listError && (
        <p style={{ fontSize: "0.8125rem", color: "var(--neg)", margin: 0 }}>{listError}</p>
      )}

      {loadingPosts ? (
        <Skeleton className="h-[200px] rounded-[10px]" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {posts.length === 0 && (
            <Card>
              <p style={{ color: "var(--ink3)", margin: 0 }}>
                Todavía no hay publicaciones. Creá la primera.
              </p>
            </Card>
          )}
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: "var(--raise)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div
                style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Badge tone={post.published ? "pos" : "neutral"}>
                    {post.published ? "Publicado" : "Borrador"}
                  </Badge>
                  <Badge tone="accent">{POST_CATEGORY_LABELS[post.category]}</Badge>
                  <span style={{ fontSize: "0.6875rem", color: "var(--ink3)" }}>
                    {formatPostDate(post.created_at)}
                  </span>
                </div>
                <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--ink)" }}>
                  {post.title}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontFamily: "var(--font-jb-mono)",
                    color: "var(--ink3)",
                  }}
                >
                  /ideas/{post.slug}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil className="h-3.5 w-3.5" />}
                onClick={() => {
                  setFormError(null);
                  setEditing(post);
                }}
                disabled={editing !== null}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => void handleDelete(post)}
                disabled={editing !== null}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
