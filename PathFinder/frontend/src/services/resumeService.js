import { onlyNewItems, splitCommaSeparated } from './profileUtils';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const asList = (value) => (Array.isArray(value) ? value : []);

// generic suggestions from the filename and profile, used when the AI can't run
const fallbackParse = async (file, profile) => {
  const { parseResume: original } = await import('./resumeFallback.js');
  return {
    ...(await original(file, profile)),
    summary: `${file.name} was not analysed because the AI resume parser is unavailable. These are generic suggestions based on your profile.`,
    isFallback: true,
  };
};

// Returns the resume's skills and interests that aren't in the profile yet.
// Throws (with a message to show) when the file is the problem: wrong type, no text, bad AI reply.
export const parseResume = async (file, profile) => {
  const formData = new FormData();
  formData.append('file', file);

  let res;
  try {
    res = await fetch(`${API}/parse-resume`, { method: 'POST', body: formData });
  } catch (err) {
    console.warn('Resume backend unreachable, using fallback:', err.message);
    return fallbackParse(file, profile);
  }

  if (res.status === 503) {
    console.warn('Resume AI unavailable, using fallback');
    return fallbackParse(file, profile);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || `Resume upload failed (HTTP ${res.status}). Please try again.`);
  }

  const parsed = data.resume_data || {};
  return {
    recommendedTrack: parsed.career_goals || 'Profile extracted from resume',
    summary: `Skills and interests read from ${file.name}.`,
    extractedSkills: onlyNewItems(asList(parsed.skills), splitCommaSeparated(profile.skills)),
    suggestedInterests: onlyNewItems(asList(parsed.interests), splitCommaSeparated(profile.interests)),
  };
};
