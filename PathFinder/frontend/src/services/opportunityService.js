
import { splitCommaSeparated } from './profileUtils';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const GRADE_LABELS = { 'high-school': 'high school', college: 'college' };

// profile -> the student object the backend expects (blank fields stay blank)
export function profileToStudent(profile) {
  return {
    name: profile.fullName || 'Student',
    grade: GRADE_LABELS[profile.grade] || '',
    school: profile.school || '',
    location: profile.location || '',
    age: parseInt(profile.age) || null,
    interests: splitCommaSeparated(profile.interests),
    schedule: profile.bio || '',
    career_goals: profile.goals || '',
    skills: splitCommaSeparated(profile.skills),
    experience: splitCommaSeparated(profile.experience),
  };
}

// Streams the search: thoughts for the Dashboard log, then a result or an error.
// Returns a function that cancels the request.

export function streamSearch({ profile, onThought, onResult, onError, onDone }) {
  const student = profileToStudent(profile);
  const controller = new AbortController();
  let connected = false;

  fetch(`${API}/search/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student }),
    signal: controller.signal,
  }).then(async (res) => {
    connected = true;
    if (!res.ok) throw new Error(`Search failed (HTTP ${res.status}).`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let settled = false; // got a result or an error event
    const finish = () => {
      if (!settled) onError?.('The search ended without returning any results. Please try again.');
      onDone?.();
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') { finish(); return; }
        try {
          const msg = JSON.parse(raw);
          if (msg.type === 'thought') onThought?.(msg.payload);
          else if (msg.type === 'result') { settled = true; onResult?.(msg.payload); }
          else if (msg.type === 'error') { settled = true; onError?.(msg.payload); }
        } catch { /* skip */ }
      }
    }
    finish();
  }).catch((err) => {
    if (err.name === 'AbortError') return;
    onError?.(connected
      ? `The connection to the backend dropped mid-search (${err.message}). Please try again.`
      : `Can't reach the PathFinder backend at ${API}. Is it running?`);
    onDone?.();
  });

  return () => controller.abort();
}

