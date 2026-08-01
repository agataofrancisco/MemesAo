// Cliente HTTP para a API do Worker (mesma origem em produção;
// VITE_API_URL para dev/outros ambientes).

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || "";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiErrorBody {
  error?: string;
}

async function request<T>(
  path: string,
  method: string,
  body?: unknown
): Promise<T> {
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    });
    } catch {
      throw new ApiError(
        "Não foi possível contactar o servidor. Tenta novamente.",
        0
      );
    }

  const contentType = res.headers.get("content-type") || "";
  let data: unknown = null;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message =
      (data as ApiErrorBody)?.error ||
      `Erro ${res.status} - ${res.statusText}`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, "GET");
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, "POST", body);
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, "PUT", body);
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, "PATCH", body);
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, "DELETE");
}
