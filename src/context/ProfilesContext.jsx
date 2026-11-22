import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { deleteProfile, loadProfiles, upsertProfile } from '../utils/profiles';

const ProfilesContext = createContext({
  profiles: [],
  saveProfile: () => {
    throw new Error('ProfilesProvider missing');
  },
  removeProfile: () => {},
});

export function ProfilesProvider({ children }) {
  const [profiles, setProfiles] = useState(() => loadProfiles());

  const saveProfile = useCallback((data) => {
    const result = upsertProfile(data); // throw ถ้าไม่ถูกต้อง ให้ผู้เรียกแสดงข้อความ
    setProfiles(result.profiles);
    return result.saved;
  }, []);

  const removeProfile = useCallback((id) => {
    setProfiles(deleteProfile(id));
  }, []);

  const value = useMemo(() => ({ profiles, saveProfile, removeProfile }), [profiles, saveProfile, removeProfile]);
  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export function useProfiles() {
  return useContext(ProfilesContext);
}
