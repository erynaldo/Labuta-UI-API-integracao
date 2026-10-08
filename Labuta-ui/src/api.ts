const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";
const TOKEN_KEY = "labuta-token";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: "CLIENT" | "PROFESSIONAL" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: ApiUser;
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null;
    throw new Error(payload?.error ?? payload?.message ?? `Falha na requisição (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return apiRequest<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(input: { name: string; email: string; phone: string; city: string; password: string }) {
  return apiRequest<AuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}