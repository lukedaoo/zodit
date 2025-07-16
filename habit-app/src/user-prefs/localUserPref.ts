export const userPref = {
    get: (key: string, defaultValue?: string) => localStorage.getItem(key) || defaultValue,
    set: (key: string, value: string) => localStorage.setItem(key, value),
    remove: (key: string) => localStorage.removeItem(key),
};

