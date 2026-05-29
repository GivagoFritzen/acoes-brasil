export interface AppConfig {
    readonly window: {
        width: number;
        height: number;
    };
    readonly renderer: {
        devUrl: string;
        prodIndexPath: string;
        connectionAttempts: number;
        retryDelay: number;
    };
    readonly backend: {
        entryPath: string;
        defaultPort: string;
        dbDialect: string;
        dbStoragePath: string;
    };
}