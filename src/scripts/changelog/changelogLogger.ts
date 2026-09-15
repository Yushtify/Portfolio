export function logDebug(fileName: string, message: string, ...rest: unknown[]): void {
    console.debug(`[DEBUG: ${fileName}]`, message, ...rest);
}

export function logWarn(fileName: string, message: string, ...rest: unknown[]): void {
    console.warn(`[WARN: ${fileName}]`, message, ...rest);
}

export function logError(fileName: string, message: string, ...rest: unknown[]): void {
    console.error(`[ERROR: ${fileName}]`, message, ...rest);
}
