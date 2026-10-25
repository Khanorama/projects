export const emptyProfile = {
  fullName: '',
  education: '',
  skills: '',
  interests: '',
  experience: '',
  school: '',
  location: '',
  age: '',
  grade: '',
  bio: '',
  goals: '',
  resumeFileName: '',
  resumeInsights: null,
  acceptedOpportunities: [],
};

const completionFields = [
  'fullName',
  'education',
  'skills',
  'interests',
  'experience',
  'school',
  'location',
  'age',
  'grade',
  'goals',
];

export const splitCommaSeparated = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// Items from `incoming` that aren't already in `existing` (case-insensitive, no repeats)
export const onlyNewItems = (incoming, existing) => {
  const seen = new Set(existing.map((item) => item.toLowerCase()));
  const result = [];
  for (const raw of incoming) {
    const item = String(raw).trim();
    if (item && !seen.has(item.toLowerCase())) {
      seen.add(item.toLowerCase());
      result.push(item);
    }
  }
  return result;
};

export const getProfileCompletion = (profile = emptyProfile) => {
  const completedCount = completionFields.filter((field) =>
    String(profile[field] ?? '')
      .trim()
      .length
  ).length;

  return Math.round((completedCount / completionFields.length) * 100);
};
