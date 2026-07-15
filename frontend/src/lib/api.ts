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

export async function upsertProblemTranslation(id: number | string, langCode: string, data: { title: string; description: string }) {
  const res = await fetch(`${getBaseUrl()}/problems/${id}/translations/${langCode}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save translation');
  }
  return res.json();
}

// ---- AI (admin only) ----

export async function aiTranslateProblem(id: number | string) {
  const res = await fetch(`${getBaseUrl()}/admin/ai/problems/${id}/translate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI translate failed');
  }
  return res.json();
}

export async function aiGenerateTopicProblems(topicId: number | string, count: number, difficulty: string) {
  const res = await fetch(`${getBaseUrl()}/admin/ai/topics/${topicId}/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ count, difficulty }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI generation failed');
  }
  return res.json();
}

export async function aiDraftProblem(prompt: string, difficulty: string) {
  const res = await fetch(`${getBaseUrl()}/ai/problems/draft`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, difficulty }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI draft failed');
  }
  return res.json();
}

export async function aiSuggestTopic(prompt: string) {
  const res = await fetch(`${getBaseUrl()}/ai/topics/suggest`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI suggestion failed');
  }
  return res.json();
}

export async function aiGenerateTopicOverview(topicId: number | string) {
  const res = await fetch(`${getBaseUrl()}/ai/topics/${topicId}/overview`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI overview generation failed');
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

export async function getTopic(id: number | string, lang?: string) {
  const url = new URL(`${getBaseUrl()}/topics/${id}`);
  if (lang) url.searchParams.set('lang', lang);
  const res = await fetch(url.toString(), { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Topic not found');
  return res.json();
}

export async function getTopicByToken(token: string, lang?: string) {
  const url = new URL(`${getBaseUrl()}/topics/shared/${token}`);
  if (lang) url.searchParams.set('lang', lang);
  const res = await fetch(url.toString(), { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Topic not found');
  return res.json();
}

export async function upsertTopicTranslation(topicId: number | string, langCode: string, title: string) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/translations/${langCode}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save translation');
  }
  return res.json();
}

export async function deleteTopicTranslation(topicId: number | string, langCode: string) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/translations/${langCode}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete translation');
  return res.json();
}

export async function upsertTopicContentTranslation(topicId: number | string, contentId: number, langCode: string, data: { content?: string; caption?: string }) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/contents/${contentId}/translations/${langCode}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save translation');
  }
  return res.json();
}

export async function deleteTopicContentTranslation(topicId: number | string, contentId: number, langCode: string) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/contents/${contentId}/translations/${langCode}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete translation');
  return res.json();
}

export async function aiTranslateTopic(topicId: number | string) {
  const res = await fetch(`${getBaseUrl()}/ai/topics/${topicId}/translate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI translate failed');
  }
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

export async function getTopicUserAnalytics(topicId: number | string, userId: number | string) {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/analytics/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch user analytics');
  return res.json();
}
