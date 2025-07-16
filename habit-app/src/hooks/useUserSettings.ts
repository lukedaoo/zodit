import { useCallback } from 'react';
import { userPref } from '../user-prefs/localUserPref';
import type { ConstPref } from '../user-prefs/const';

export const useUserSettings = () => {
    const get = useCallback(<T = any>(pref: ConstPref): T => {
        const value = userPref.get(pref.key);
        return (value !== null && value !== undefined ? value : pref.defaultValue) as T;
    }, []);

    const set = useCallback((pref: ConstPref, value: any) => {
        userPref.set(pref.key, value);
    }, []);

    const remove = useCallback((pref: ConstPref) => {
        userPref.remove(pref.key);
    }, []);

    return { get, set, remove };
};
