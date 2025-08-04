import { useCallback } from 'react';
import { userPref } from '@user-prefs/localUserPref';
import type { ConstPref } from '@user-prefs/const';

export const useUserSettings = () => {
    const get = useCallback(<T = any>(pref: ConstPref | string): T => {
        let raw;
        if (typeof pref === 'string') {
            return userPref.get(pref) as T;
        } else {
            raw = userPref.get(pref.key);
        }

        if (raw === null || raw === undefined) {
            return pref.defaultValue;
        }

        if (typeof pref.defaultValue === 'boolean') {
            return (raw === 'true') as T;
        }

        if (typeof pref.defaultValue === 'number') {
            const parsed = Number(raw);
            return (isNaN(parsed) ? pref.defaultValue : parsed) as T;
        }

        if (typeof pref.defaultValue === 'object') {
            try {
                return JSON.parse(raw) as T;
            } catch {
                return pref.defaultValue;
            }
        }

        return raw as T;
    }, []);

    const set = useCallback((pref: ConstPref, value: any) => {
        userPref.set(pref.key, value);
    }, []);

    const remove = useCallback((pref: ConstPref) => {
        userPref.remove(pref.key);
    }, []);

    return { get, set, remove };
};
