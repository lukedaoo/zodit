type AnyObject = Record<string, any>;

export const extractMetadata = <T extends AnyObject>(
    obj: T,
    keys: (keyof T)[]
): Partial<Pick<T, keyof T>> => {
    const metaData: Partial<Pick<T, keyof T>> = {};

    for (const key of keys) {
        if (obj[key]) {
            metaData[key] = obj[key];
        }
    }
    return metaData;
}

export function splitMetaData<T extends AnyObject>(
    obj: T,
    metaKeys: (keyof T)[]
): { data: Omit<T, keyof T>; meta: Partial<Pick<T, keyof T>> } {
    const meta: Partial<Pick<T, keyof T>> = {};
    const data = { ...obj };

    for (const key of metaKeys) {
        if (key in data) {
            meta[key] = data[key];
            delete data[key];
        }
    }

    return { data: data as Omit<T, keyof T>, meta };
}
