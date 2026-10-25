import { useState } from 'react';
import {
  loadUser,
  createUser,
  loadProfile,
  saveProfileRecord,
  loadOpportunities,
  saveOpportunities,
  clearAll,
} from '../services/storage';
import { emptyProfile } from '../services/profileUtils';
import { xpToLevel, xpInCurrentLevel, xpForCurrentLevel } from '../services/xp';
import UserContext from './userContext';

const loadInitialProfile = () => {
  const user = loadUser();
  return { ...emptyProfile, ...(user && loadProfile(user.id)) };
};

export const UserProvider = ({ children }) => {
  const [user,          setUser]      = useState(loadUser);
  const [profile,       setProfile]   = useState(loadInitialProfile);
  const [opportunities, setOppsState] = useState(loadOpportunities);

  const xp = profile.xp || 0;

  const setOpportunities = (opps) => {
    setOppsState(opps);
    saveOpportunities(opps);
  };

  // from the welcome form
  const start = (details) => {
    const newUser = createUser();
    setProfile(saveProfileRecord(newUser.id, { ...emptyProfile, ...details }));
    setUser(newUser);
  };

  const startOver = () => {
    clearAll();
    setUser(null);
    setProfile(emptyProfile);
    setOppsState(null);
  };

  const saveProfile = async (updates) => {
    if (!user) return null;
    // the profile form shouldn't overwrite XP or accepted opportunities
    const next = saveProfileRecord(user.id, {
      ...profile,
      ...updates,
      xp,
      acceptedOpportunities: profile.acceptedOpportunities,
    });
    setProfile(next);
    return next;
  };

  // saved with the profile so a reload can't be used to accept the same one twice
  const acceptOpportunity = (key, amount) => {
    const accepted = profile.acceptedOpportunities || [];
    if (!user || accepted.includes(key)) return;
    setProfile(saveProfileRecord(user.id, {
      ...profile,
      xp: xp + amount,
      acceptedOpportunities: [...accepted, key],
    }));
  };

  const displayName = profile.fullName?.trim() || 'Student';

  return (
    <UserContext.Provider value={{
      user, profile,
      xp, level: xpToLevel(xp), xpInLevel: xpInCurrentLevel(xp), xpForLevel: xpForCurrentLevel(xp),
      displayName, opportunities, setOpportunities,
      start, startOver, saveProfile, acceptOpportunity,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
