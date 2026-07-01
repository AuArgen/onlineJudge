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

export async function getProblems(params?: Record<string, string>) {
  const url = new URL(`${getBaseUrl()}/problems`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  console.log('Fetching problems from:', url.toString());

  const res = await fetch(url.toString(), {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch problems: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
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

// ---- Topics ----

export async function getTopics(filter?: string) {
  const url = new URL(`${getBaseUrl()}/topics`);
  if (filter) url.searchParams.set('filter', filter);
  const res = await fetch(url.toString(), { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function createTopic(data: { title: string; visibility: string; parent_id?: number | null }) {
  const res = await fetch(`${getBaseUrl()}/topics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create topic');
  }
  return res.json();
}

export async function getTopic(id: number | string) {
  const res = await fetch(`${getBaseUrl()}/topics/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Topic not found');
  return res.json();
}

export async function getTopicByToken(token: string) {
  const res = await fetch(`${getBaseUrl()}/topics/shared/${token}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Topic not found');
  return res.json();
}

export async function updateTopic(id: number | string, data: { title?: string; visibility?: string }) {
  const res = await fetch(`${getBaseUrl()}/topics/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update topic');
  return res.json();
}

export async function deleteTopic(id: number | string) {
  const res = await fetch(`${getBaseUrl()}/topics/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete topic');
  return res.json();
}

export async function addTopicContent(topicId: number | string, data: { type: string; content: string; caption?: string; order_num?: number }) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/contents`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add content');
  }
  return res.json();
}

export async function updateTopicContent(topicId: number | string, contentId: number, data: { content?: string; caption?: string; order_num?: number }) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/contents/${contentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update content');
  }
  return res.json();
}

export async function deleteTopicContent(topicId: number | string, contentId: number) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/contents/${contentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete content');
  return res.json();
}

export async function addTopicProblem(topicId: number | string, problemId: number) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/problems`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ problem_id: problemId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add problem');
  }
  return res.json();
}

export async function removeTopicProblem(topicId: number | string, problemId: number) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/problems/${problemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove problem');
  return res.json();
}

export async function shareTopicByEmail(topicId: number | string, email: string) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/share`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to share topic');
  }
  return res.json();
}

export async function revokeTopicAccess(topicId: number | string, accessId: number) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/access/${accessId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to revoke access');
  return res.json();
}

export async function generateTopicShareToken(topicId: number | string) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/share-token`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to generate share token');
  return res.json();
}

export async function getTopicAnalytics(topicId: number | string) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/analytics`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}
