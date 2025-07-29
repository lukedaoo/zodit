import type { DataProvider, DataProviderConfig } from './types';

export class DataProviderFactory {
    private static providers: Map<string, new (config?: any) => DataProvider> = new Map();

    static register(name: string, providerClass: new (config?: any) => DataProvider): void {
        this.providers.set(name, providerClass);
    }

    static create(config: DataProviderConfig): DataProvider {
        const ProviderClass = this.providers.get(config.name);
        if (!ProviderClass) {
            throw new Error(`Unknown data provider: ${config.name}`);
        }
        return new ProviderClass(config.options);
    }

    static getAvailableProviders(): string[] {
        return Array.from(this.providers.keys());
    }
}
