type AnyObject = Record<any, any>;

export const extractFields = <T extends AnyObject>(
    obj: T,
    keys: (keyof T)[]
): Partial<Pick<T, keyof T>> => {
    const extracted: Partial<Pick<T, keyof T>> = {};

    for (const key of keys) {
        if (obj[key]) {
            extracted[key] = obj[key];
        }
    }
    return extracted;
}

export const splitFields = <
    T extends AnyObject,
    K1 extends string = 'selected',
    K2 extends string = 'others'
>(
    obj: T,
    selectedKeys: (keyof T)[],
    rename?: { selected?: K1; others?: K2 }
): Record<K1 | K2, any> => {
    const selected: Partial<Pick<T, keyof T>> = {};
    const others = { ...obj };

    for (const key of selectedKeys) {
        if (key in others) {
            selected[key] = others[key];
            delete others[key];
        }
    }

    const selectedKey = (rename?.selected ?? 'selected') as K1;
    const othersKey = (rename?.others ?? 'others') as K2;

    return {
        [selectedKey]: selected,
        [othersKey]: others,
    } as Record<K1 | K2, any>;
};
