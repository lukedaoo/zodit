export const createLogger = (name: string) => {
    const isProd = import.meta.env.PROD;
    const time = () => new Date().toLocaleTimeString();

    return {
        group: (message: string, style?: string) => {
            const groupStyle = style || 'color: #4CAF50; font-weight: bold;';
            console.groupCollapsed(`%c[${name}] ${message} @ ${time()}`, groupStyle);
        },
        log: (label: string, style: string, data: any) => {
            if (!isProd) {
                console.log(`%c${label}`, style, data);
            }
        },
        groupEnd: () => {
            console.groupEnd();
        }
    };
};
