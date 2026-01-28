export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper to determine the correct API URL based on environment (Server vs Client)
export function getBaseUrl() {
  if (typeof window === 'undefined') {
    // Server-side (Docker internal network)
    return 'http://backend:8000/api';
  }
  // Client-side (Browser)
  return API_URL;
}

function getAuthHeaders() {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

export async function getProblems() {
  const url = `${getBaseUrl()}/problems`;
  console.log('Fetching problems from:', url); // Debug log
  
  const res = await fetch(url, {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch problems: ${res.statusText}`);
  }
  
  return res.json();
}

export async function createProblem(data: any) {
  const url = `${getBaseUrl()}/problems`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to create problem');
  }

  return res.json();
}
