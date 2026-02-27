const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type Category = 'Clarity' | 'Layout' | 'Navigation' | 'Accessibility' | 'Trust';
export type Severity = 'Low' | 'Medium' | 'High';

export interface Issue {
  title: string;
  category: Category;
  severity: Severity;
  why: string;
  proof: string;
  suggested_fix: string;
}

export interface TopFix {
  issue_title: string;
  before: string;
  after: string;
}

export interface ReviewResponse {
  id: number;
  url: string;
  score: number;
  issues: Issue[];
  top_fixes: TopFix[];
  created_at: string;
}

export interface HistoryItem {
  id: number;
  url: string;
  score: number;
  created_at: string;
}

export interface StatusResponse {
  backend: string;
  database: string;
  llm: string;
  scraper: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function analyzeUrl(url: string): Promise<ReviewResponse> {
  const res = await fetch(`${API}/reviews/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return handleResponse<ReviewResponse>(res);
}

export async function getHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API}/reviews/history`);
  return handleResponse<HistoryItem[]>(res);
}

export async function getReview(id: number): Promise<ReviewResponse> {
  const res = await fetch(`${API}/reviews/${id}`);
  return handleResponse<ReviewResponse>(res);
}

export async function getStatus(): Promise<StatusResponse> {
  const res = await fetch(`${API}/status`);
  return handleResponse<StatusResponse>(res);
}
