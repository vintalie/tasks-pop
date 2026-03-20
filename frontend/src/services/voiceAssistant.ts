const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : `${window.location.origin}/api`);

function getToken(): string | null {
  return localStorage.getItem('token');
}

export interface VoiceMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface VoiceResponse {
  text: string;
  audio_base64: string | null;
}

export async function ask(message: string, history?: VoiceMessage[]): Promise<VoiceResponse> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/voice-assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history: history ?? [] }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Erro ao processar');
  }

  return {
    text: data.text ?? '',
    audio_base64: data.audio_base64 ?? null,
  };
}
