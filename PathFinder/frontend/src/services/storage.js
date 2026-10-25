// Everything is saved in localStorage. There are no accounts: the welcome form
// creates a local user id, and "Start over" erases it all.

const DB_KEY      = 'pathfinder.db';
const SESSION_KEY = 'pathfinder.session';
const OPPS_KEY    = 'pathfinder.opportunities';

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (err) { console.warn(`Could not save ${key}:`, err); }
};

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const loadUser = () => read(SESSION_KEY, null);

export const createUser = () => {
  const user = { id: newId() };
  write(SESSION_KEY, user);
  return user;
};

export const loadProfile = (userId) => read(DB_KEY, { profiles: {} }).profiles?.[userId] ?? null;

export const saveProfileRecord = (userId, profile) => {
  const db = read(DB_KEY, { profiles: {} });
  const record = { ...profile, updatedAt: new Date().toISOString() };
  write(DB_KEY, { ...db, profiles: { ...db.profiles, [userId]: record } });
  return record;
};

export const loadOpportunities = () => read(OPPS_KEY, null);

export const saveOpportunities = (opps) => {
  if (opps === null) localStorage.removeItem(OPPS_KEY);
  else write(OPPS_KEY, opps);
};

export const clearAll = () => {
  [DB_KEY, SESSION_KEY, OPPS_KEY].forEach((key) => localStorage.removeItem(key));
};
