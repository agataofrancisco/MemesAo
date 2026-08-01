import {
  pbkdf2Hash,
  verifyPassword,
  signToken,
  verifyToken,
  getSessionToken,
  sessionCookie,
  clearSessionCookie,
  type SessionPayload,
} from "./auth";

export interface Env {
  DB: D1Database;
  MEMES_BUCKET: R2Bucket;
  AUTH_SECRET: string;
  ADMIN_EMAIL?: string;
  ASSETS: Fetcher;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

async function getSession(request: Request, env: Env): Promise<SessionPayload | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  return verifyToken(token, env.AUTH_SECRET);
}

function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === "admin" || session?.role === "moderator";
}

function isStaff(session: SessionPayload | null): boolean {
  return isAdmin(session);
}

function uuid(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

function parseIdParam(path: string, prefix: string): string | null {
  if (!path.startsWith(prefix)) return null;
  const rest = path.slice(prefix.length);
  if (!rest || rest.includes("/")) return null;
  try {
    return decodeURIComponent(rest);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Tipos de resposta (contrato do frontend)                            */
/* ------------------------------------------------------------------ */

interface MemeOut {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  image_path: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  format: string | null;
  created_at: string;
  uploaded_by: string | null;
  category_id: string | null;
  view_count: number;
  download_count: number;
  share_count: number;
  status: "pending" | "approved" | "rejected";
  ocr_text: string | null;
  like_count: number;
  category?: string;
  categories: { id: string; name: string }[];
  uploaded_by_name: string;
  profile: { username: string | null; full_name: string | null } | null;
}

interface MemeRow {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  image_path: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  format: string | null;
  created_at: string;
  uploaded_by: string | null;
  category_id: string | null;
  view_count: number | null;
  download_count: number | null;
  share_count: number | null;
  status: string;
  ocr_text: string | null;
  category_name?: string | null;
  username?: string | null;
  full_name?: string | null;
  like_count?: number | null;
  cat_ids?: string | null;
  cat_names?: string | null;
}

function toMeme(row: MemeRow): MemeOut {
  const catIds = row.cat_ids ? row.cat_ids.split("|") : [];
  const catNames = row.cat_names ? row.cat_names.split("|") : [];
  const categories = catIds.map((id, i) => ({ id, name: catNames[i] || id }));
  const username = row.username ?? null;
  const fullName = row.full_name ?? null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image_url: row.image_url,
    image_path: row.image_path,
    file_size: row.file_size,
    width: row.width,
    height: row.height,
    format: row.format,
    created_at: row.created_at,
    uploaded_by: row.uploaded_by,
    category_id: row.category_id,
    view_count: row.view_count ?? 0,
    download_count: row.download_count ?? 0,
    share_count: row.share_count ?? 0,
    status: row.status as MemeOut["status"],
    ocr_text: row.ocr_text,
    like_count: row.like_count ?? 0,
    category: row.category_name ?? undefined,
    categories,
    uploaded_by_name: username || fullName || "Anónimo",
    profile: username !== undefined || fullName !== undefined
      ? { username, full_name: fullName }
      : null,
  };
}

const MEME_SELECT = `
  SELECT
    m.*,
    c.name AS category_name,
    p.username,
    p.full_name,
    (SELECT COUNT(*) FROM user_favorites f WHERE f.meme_id = m.id) AS like_count,
    (SELECT group_concat(cat.id, '|') FROM meme_categories mc JOIN categories cat ON cat.id = mc.category_id WHERE mc.meme_id = m.id) AS cat_ids,
    (SELECT group_concat(cat.name, '|') FROM meme_categories mc JOIN categories cat ON cat.id = mc.category_id WHERE mc.meme_id = m.id) AS cat_names
  FROM memes m
  LEFT JOIN categories c ON c.id = m.category_id
  LEFT JOIN profiles p ON p.id = m.uploaded_by
`;

/* ------------------------------------------------------------------ */
/* Handlers                                                            */
/* ------------------------------------------------------------------ */

async function handleRegister(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ email?: string; password?: string; username?: string }>(request);
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const username = (body.username || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error("Email inválido");
  if (password.length < 6) return error("A senha precisa de pelo menos 6 caracteres");
  if (username.length < 2) return error("O nome de usuário precisa de pelo menos 2 caracteres");

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return error("Este email já está registado", 409);

  if (username) {
    const userWithName = await env.DB.prepare("SELECT id FROM profiles WHERE username = ?").bind(username).first();
    if (userWithName) return error("Este nome de usuário já está em uso", 409);
  }

  const id = uuid();
  const hash = await pbkdf2Hash(password);
  const role = env.ADMIN_EMAIL && email === env.ADMIN_EMAIL.trim().toLowerCase() ? "admin" : "user";
  const createdAt = nowIso();

  // Assinar o token ANTES de inserir: se o signing falhar, nada fica em estado parcial.
  const token = await signToken({ sub: id, email, role }, env.AUTH_SECRET);

  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, username, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, email, hash, username || null, role, createdAt, createdAt),
    env.DB.prepare(
      "INSERT INTO profiles (id, username, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, username || null, role, createdAt, createdAt),
  ]);

  const response = json(
    {
      user: { id, email, role },
      profile: { id, username, full_name: null, avatar_url: null, bio: null, is_verified: false, role, created_at: createdAt, updated_at: createdAt },
    },
    201,
  );
  response.headers.append("Set-Cookie", sessionCookie(token, new URL(request.url).protocol === "https:"));
  return response;
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ email?: string; password?: string }>(request);
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) return error("Email e senha são obrigatórios");

  const row = await env.DB.prepare(
    "SELECT id, email, password_hash, username, role FROM users WHERE email = ?"
  ).bind(email).first() as { id: string; email: string; password_hash: string; username: string | null; role: string } | null;

  if (!row) return error("Email ou senha incorretos", 401);

  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return error("Email ou senha incorretos", 401);

  const token = await signToken({ sub: row.id, email: row.email, role: row.role }, env.AUTH_SECRET);
  const response = json({
    user: { id: row.id, email: row.email, role: row.role },
    profile: { id: row.id, username: row.username, full_name: null, avatar_url: null, bio: null, is_verified: false, role: row.role },
  });
  response.headers.append("Set-Cookie", sessionCookie(token, new URL(request.url).protocol === "https:"));
  return response;
}

async function handleMe(request: Request, env: Env): Promise<Response> {
  const session = await getSession(request, env);
  if (!session) return json({ user: null, profile: null });

  const row = await env.DB.prepare(
    "SELECT id, email, username, role, full_name, avatar_url, bio, is_verified, created_at, updated_at FROM users WHERE id = ?"
  ).bind(session.sub).first() as {
    id: string; email: string; username: string | null; role: string; full_name: string | null;
    avatar_url: string | null; bio: string | null; is_verified: number | null; created_at: string; updated_at: string;
  } | null;

  if (!row) return json({ user: null, profile: null });

  return json({
    user: { id: row.id, email: row.email, role: row.role },
    profile: {
      id: row.id,
      username: row.username,
      full_name: row.full_name,
      avatar_url: row.avatar_url,
      bio: row.bio,
      is_verified: !!row.is_verified,
      role: row.role,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  });
}

function handleLogout(): Response {
  const response = json({ success: true });
  response.headers.append("Set-Cookie", clearSessionCookie());
  return response;
}

/* ----- Memes ----- */

async function listMemes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();
  const category = url.searchParams.get("category") || "";

  let sql = MEME_SELECT + " WHERE m.status = 'approved'";
  const params: unknown[] = [];

  if (query) {
    const like = `%${query}%`;
    sql += " AND (m.title LIKE ? OR m.description LIKE ? OR m.ocr_text LIKE ?)";
    params.push(like, like, like);
    sql += " ORDER BY m.created_at DESC LIMIT 50";
  } else {
    if (category) {
      sql += " AND m.category_id = ?";
      params.push(category);
    }
    sql += " ORDER BY m.created_at DESC";
  }

  const result = await env.DB.prepare(sql).bind(...params).all<MemeRow>();
  return json({ memes: (result.results || []).map(toMeme) });
}

async function getMeme(request: Request, env: Env, id: string): Promise<Response> {
  const row = await env.DB.prepare(MEME_SELECT + " WHERE m.id = ? AND m.status = 'approved'").bind(id).first<MemeRow>();
  if (!row) return error("Meme não encontrado", 404);

  await env.DB.batch([
    env.DB.prepare("UPDATE memes SET view_count = view_count + 1 WHERE id = ?").bind(id),
    env.DB.prepare("INSERT INTO meme_views (id, meme_id, ip_address, user_agent) VALUES (?, ?, ?, ?)")
      .bind(uuid(), id, request.headers.get("CF-Connecting-IP"), (request.headers.get("User-Agent") || "").slice(0, 500)),
  ]);

  return json({ meme: toMeme(row) });
}

async function uploadMeme(request: Request, env: Env, session: SessionPayload): Promise<Response> {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return error("Ficheiro em falta");

  const title = ((form.get("title") as string) || "").trim();
  const description = ((form.get("description") as string) || "").trim() || null;
  const categoryId = ((form.get("category_id") as string) || "").trim() || null;
  const tagsRaw = (form.get("tags") as string) || "[]";
  const categoriesRaw = (form.get("categories") as string) || "[]";

  let tags: string[] = [];
  let categories: string[] = [];
  try {
    tags = JSON.parse(tagsRaw);
    categories = JSON.parse(categoriesRaw);
  } catch {
    /* tags/categories opcionais */
  }
  if (!Array.isArray(tags)) tags = [];
  if (!Array.isArray(categories)) categories = [];

  if (file.size > 10 * 1024 * 1024) return error("A imagem não pode exceder 10MB");

  const extension = file.name.split(".").pop() || "jpg";
  const path = `memes/${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
  const bytes = await file.arrayBuffer();

  await env.MEMES_BUCKET.put(path, bytes, { httpMetadata: { contentType: file.type || "image/jpeg" } });

  const memeId = uuid();
  const createdAt = nowIso();
  const uniqueCategories = Array.from(new Set([categoryId, ...categories].filter(Boolean)));

  const inserts: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO memes (id, title, description, image_url, image_path, file_size, format, category_id, uploaded_by, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
    ).bind(
      memeId,
      title || file.name.replace(/\.[^/.]+$/, ""),
      description,
      `/r2/${path}`,
      path,
      file.size,
      extension,
      categoryId,
      session.sub,
      createdAt,
      createdAt,
    ),
  ];

  for (const tag of tags.slice(0, 20)) {
    inserts.push(
      env.DB.prepare("INSERT OR IGNORE INTO meme_tags (id, meme_id, tag) VALUES (?, ?, ?)").bind(uuid(), memeId, String(tag).slice(0, 100)),
    );
  }
  for (const catId of uniqueCategories) {
    inserts.push(
      env.DB.prepare("INSERT OR IGNORE INTO meme_categories (id, meme_id, category_id) VALUES (?, ?, ?)").bind(uuid(), memeId, catId),
    );
  }

  await env.DB.batch(inserts);
  return json({ success: true });
}

async function toggleFavorite(request: Request, env: Env, session: SessionPayload, id: string): Promise<Response> {
  const existing = await env.DB.prepare("SELECT id FROM user_favorites WHERE user_id = ? AND meme_id = ?")
    .bind(session.sub, id).first();

  if (existing) {
    await env.DB.prepare("DELETE FROM user_favorites WHERE user_id = ? AND meme_id = ?").bind(session.sub, id).run();
  } else {
    await env.DB.prepare("INSERT INTO user_favorites (id, user_id, meme_id) VALUES (?, ?, ?)").bind(uuid(), session.sub, id).run();
  }

  const countRow = await env.DB.prepare("SELECT COUNT(*) AS c FROM user_favorites WHERE meme_id = ?").bind(id).first<{ c: number }>();
  return json({ favorited: !existing, like_count: countRow?.c ?? 0 });
}

async function recordDownload(request: Request, env: Env, session: SessionPayload | null, id: string): Promise<Response> {
  await env.DB.batch([
    env.DB.prepare("UPDATE memes SET download_count = download_count + 1 WHERE id = ?").bind(id),
    env.DB.prepare("INSERT INTO meme_downloads (id, meme_id, user_id, ip_address) VALUES (?, ?, ?, ?)")
      .bind(uuid(), id, session?.sub ?? null, request.headers.get("CF-Connecting-IP")),
  ]);
  return json({ success: true });
}

async function recordShare(request: Request, env: Env, session: SessionPayload | null, id: string): Promise<Response> {
  await env.DB.batch([
    env.DB.prepare("UPDATE memes SET share_count = share_count + 1 WHERE id = ?").bind(id),
    env.DB.prepare("INSERT INTO meme_shares (id, meme_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(uuid(), id, session?.sub ?? null, request.headers.get("CF-Connecting-IP"), (request.headers.get("User-Agent") || "").slice(0, 500)),
  ]);
  return json({ success: true });
}

async function updateMeme(request: Request, env: Env, id: string): Promise<Response> {
  const body = await readJson<{ title?: string; description?: string; category_id?: string; status?: string }>(request);
  const updates: string[] = [];
  const params: unknown[] = [];

  if (body.title !== undefined) { updates.push("title = ?"); params.push(body.title); }
  if (body.description !== undefined) { updates.push("description = ?"); params.push(body.description); }
  if (body.category_id !== undefined) { updates.push("category_id = ?"); params.push(body.category_id); }
  if (body.status !== undefined) {
    if (!["pending", "approved", "rejected"].includes(body.status)) return error("Status inválido");
    updates.push("status = ?");
    params.push(body.status);
  }
  if (updates.length === 0) return error("Nada para atualizar");

  updates.push("updated_at = ?");
  params.push(nowIso());
  params.push(id);

  await env.DB.prepare(`UPDATE memes SET ${updates.join(", ")} WHERE id = ?`).bind(...params).run();
  return json({ success: true });
}

async function deleteMeme(request: Request, env: Env, id: string): Promise<Response> {
  const row = await env.DB.prepare("SELECT image_path FROM memes WHERE id = ?").bind(id).first<{ image_path: string | null }>();
  if (!row) return error("Meme não encontrado", 404);

  await env.DB.batch([
    env.DB.prepare("DELETE FROM user_favorites WHERE meme_id = ?").bind(id),
    env.DB.prepare("DELETE FROM meme_downloads WHERE meme_id = ?").bind(id),
    env.DB.prepare("DELETE FROM meme_views WHERE meme_id = ?").bind(id),
    env.DB.prepare("DELETE FROM meme_shares WHERE meme_id = ?").bind(id),
    env.DB.prepare("DELETE FROM meme_tags WHERE meme_id = ?").bind(id),
    env.DB.prepare("DELETE FROM meme_categories WHERE meme_id = ?").bind(id),
    env.DB.prepare("DELETE FROM reports WHERE meme_id = ?").bind(id),
    env.DB.prepare("DELETE FROM memes WHERE id = ?").bind(id),
  ]);

  if (row.image_path && row.image_path.startsWith("memes/")) {
    await env.MEMES_BUCKET.delete(row.image_path).catch(() => undefined);
  }

  return json({ success: true });
}

/* ----- Favoritos ----- */

async function getFavorites(env: Env, session: SessionPayload): Promise<Response> {
  const result = await env.DB.prepare("SELECT meme_id FROM user_favorites WHERE user_id = ?").bind(session.sub).all<{ meme_id: string }>();
  return json({ ids: (result.results || []).map((r) => r.meme_id) });
}

/* ----- Stats ----- */

async function getStats(request: Request, env: Env, session: SessionPayload | null): Promise<Response> {
  const totalMemes = await env.DB.prepare("SELECT COUNT(*) AS c FROM memes WHERE status = 'approved'").first<{ c: number }>();
  const totalUsers = await env.DB.prepare("SELECT COUNT(*) AS c FROM profiles").first<{ c: number }>();
  const totalDownloads = await env.DB.prepare("SELECT COUNT(*) AS c FROM meme_downloads").first<{ c: number }>();
  const totalFavorites = await env.DB.prepare("SELECT COUNT(*) AS c FROM user_favorites").first<{ c: number }>();

  let userDownloads = 0;
  let userFavorites = 0;
  let userShares = 0;
  let userMemes = 0;

  if (session) {
    const ud = await env.DB.prepare("SELECT COUNT(*) AS c FROM meme_downloads WHERE user_id = ?").bind(session.sub).first<{ c: number }>();
    const uf = await env.DB.prepare("SELECT COUNT(*) AS c FROM user_favorites WHERE user_id = ?").bind(session.sub).first<{ c: number }>();
    const us = await env.DB.prepare("SELECT COUNT(*) AS c FROM meme_shares WHERE user_id = ?").bind(session.sub).first<{ c: number }>();
    const um = await env.DB.prepare("SELECT COUNT(*) AS c FROM memes WHERE uploaded_by = ?").bind(session.sub).first<{ c: number }>();
    userDownloads = ud?.c ?? 0;
    userFavorites = uf?.c ?? 0;
    userShares = us?.c ?? 0;
    userMemes = um?.c ?? 0;
  }

  return json({
    totalMemes: totalMemes?.c ?? 0,
    totalUsers: totalUsers?.c ?? 0,
    totalDownloads: totalDownloads?.c ?? 0,
    totalFavorites: totalFavorites?.c ?? 0,
    userDownloads,
    userFavorites,
    userShares,
    userMemes,
  });
}

/* ----- Categorias ----- */

async function getCategories(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    `SELECT c.id, c.name, c.icon, c.color, c.description,
       (SELECT COUNT(*) FROM memes m WHERE m.category_id = c.id AND m.status = 'approved') AS count
     FROM categories c ORDER BY c.name`
  ).all<{ id: string; name: string; icon: string | null; color: string | null; description: string | null; count: number }>();

  return json(
    (result.results || []).map((c) => ({
      id: c.id,
      name: c.name,
      count: c.count ?? 0,
      icon: c.icon || "Tag",
      color: c.color || "from-gray-500 to-gray-600",
      description: c.description || `Categoria ${c.name}`,
    })),
  );
}

/* ----- Interesses ----- */

async function getInterests(env: Env, session: SessionPayload): Promise<Response> {
  const result = await env.DB.prepare(
    `SELECT ui.id, ui.category_id, ui.weight, c.name AS category_name
     FROM user_interests ui JOIN categories c ON c.id = ui.category_id
     WHERE ui.user_id = ?`
  ).bind(session.sub).all<{ id: string; category_id: string; weight: number; category_name: string }>();

  return json(
    (result.results || []).map((i) => ({
      id: i.id,
      user_id: session.sub,
      category_id: i.category_id,
      weight: i.weight,
      created_at: "",
      category: { id: i.category_id, name: i.category_name },
    })),
  );
}

async function saveInterests(request: Request, env: Env, session: SessionPayload): Promise<Response> {
  const body = await readJson<{ categories?: Array<{ category_id: string; weight?: number }> }>(request);
  const items = Array.isArray(body.categories) ? body.categories : [];

  const inserts: D1PreparedStatement[] = [
    env.DB.prepare("DELETE FROM user_interests WHERE user_id = ?").bind(session.sub),
  ];

  for (const item of items) {
    if (!item.category_id) continue;
    const weight = Math.min(5, Math.max(1, Math.round(item.weight || 1)));
    inserts.push(
      env.DB.prepare("INSERT OR IGNORE INTO user_interests (id, user_id, category_id, weight) VALUES (?, ?, ?, ?)")
        .bind(uuid(), session.sub, item.category_id, weight),
    );
  }

  await env.DB.batch(inserts);
  return json({ success: true });
}

/* ----- Admin ----- */

async function adminDashboard(env: Env): Promise<Response> {
  const totalMemes = await env.DB.prepare("SELECT COUNT(*) AS c FROM memes WHERE status = 'approved'").first<{ c: number }>();
  const totalUsers = await env.DB.prepare("SELECT COUNT(*) AS c FROM profiles").first<{ c: number }>();
  const totalDownloads = await env.DB.prepare("SELECT COUNT(*) AS c FROM meme_downloads").first<{ c: number }>();
  const pendingMemes = await env.DB.prepare("SELECT COUNT(*) AS c FROM memes WHERE status = 'pending'").first<{ c: number }>();

  const pendingResult = await env.DB.prepare(MEME_SELECT + " WHERE m.status = 'pending' ORDER BY m.created_at DESC LIMIT 50").all<MemeRow>();
  const allResult = await env.DB.prepare(MEME_SELECT + " ORDER BY m.created_at DESC LIMIT 100").all<MemeRow>();

  return json({
    stats: {
      totalMemes: totalMemes?.c ?? 0,
      totalUsers: totalUsers?.c ?? 0,
      totalDownloads: totalDownloads?.c ?? 0,
      pendingMemes: pendingMemes?.c ?? 0,
    },
    pending: (pendingResult.results || []).map(toMeme),
    memes: (allResult.results || []).map(toMeme),
  });
}

/* ----- R2 ----- */

async function serveR2(request: Request, env: Env, key: string): Promise<Response> {
  const object = await env.MEMES_BUCKET.get(key);
  if (!object) return error("Imagem não encontrada", 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    // R2: servir imagens públicas
    if (pathname.startsWith("/r2/")) {
      const key = pathname.slice("/r2/".length);
      if (!key) return error("Imagem não encontrada", 404);
      return serveR2(request, env, key);
    }

    if (!pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // Rota não autenticada base (pública)
    if (pathname === "/api/categories" && method === "GET") return getCategories(env);
    if (pathname === "/api/stats" && method === "GET") return getStats(request, env, await getSession(request, env));

    // Auth
    if (pathname === "/api/auth/register" && method === "POST") return handleRegister(request, env);
    if (pathname === "/api/auth/login" && method === "POST") return handleLogin(request, env);
    if (pathname === "/api/auth/logout" && method === "POST") return handleLogout();
    if (pathname === "/api/auth/me" && method === "GET") return handleMe(request, env);

    // Sessão para os restantes
    const session = await getSession(request, env);

    // Memes
    if (pathname === "/api/memes" && method === "GET") return listMemes(request, env);
    if (pathname === "/api/memes" && method === "POST") {
      if (!session) return error("Precisas de estar autenticado", 401);
      return uploadMeme(request, env, session);
    }

    // Ações em meme (favorito/download/partilha)
    const memeAction = pathname.match(/^\/api\/memes\/([^/]+)\/(favorite|download|share)$/);
    if (memeAction && method === "POST") {
      const id = decodeURIComponent(memeAction[1]);
      const action = memeAction[2];
      if (action === "favorite") {
        if (!session) return error("Precisas de estar autenticado", 401);
        return toggleFavorite(request, env, session, id);
      }
      if (action === "download") return recordDownload(request, env, session, id);
      if (action === "share") return recordShare(request, env, session, id);
    }

    // Meme individual
    const singleMemeId = parseIdParam(pathname, "/api/memes/");
    if (singleMemeId) {
      if (method === "GET") return getMeme(request, env, singleMemeId);
      if (method === "PATCH") {
        if (!isStaff(session)) return error("Acesso negado", 403);
        return updateMeme(request, env, singleMemeId);
      }
      if (method === "DELETE") {
        if (!isStaff(session)) return error("Acesso negado", 403);
        return deleteMeme(request, env, singleMemeId);
      }
    }

    // Favoritos
    if (pathname === "/api/favorites" && method === "GET") {
      if (!session) return error("Precisas de estar autenticado", 401);
      return getFavorites(env, session);
    }

    // Interesses
    if (pathname === "/api/interests" && method === "GET") {
      if (!session) return error("Precisas de estar autenticado", 401);
      return getInterests(env, session);
    }
    if (pathname === "/api/interests" && method === "PUT") {
      if (!session) return error("Precisas de estar autenticado", 401);
      return saveInterests(request, env, session);
    }

    // Admin
    if (pathname === "/api/admin/dashboard" && method === "GET") {
      if (!isStaff(session)) return error("Acesso negado", 403);
      return adminDashboard(env);
    }

    return error("Rota não encontrada", 404);
  },
};
