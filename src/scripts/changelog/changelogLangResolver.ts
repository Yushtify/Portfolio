import { CONFIG } from "./changelogConfig";
import { logWarn, logError } from "./changelogLogger";
import type { VersionFileData, VersionLangData } from "./changelogTypes";

const FILE_NAME = "changelogLangResolver.ts";

function getUserLang(): string {
    return localStorage.getItem(CONFIG.STORAGE.LANG_KEY) ?? CONFIG.STORAGE.FALLBACK_LANG;
}

export function resolveVersionLang(data: VersionFileData): VersionLangData {
    const userLang = getUserLang();
    const resolved = data[userLang];
    if (resolved) {
        return resolved;
    }
    logWarn(FILE_NAME, `Lang "${userLang}" missing in version data, falling back to "${CONFIG.STORAGE.FALLBACK_LANG}".`);
    const fallback = data[CONFIG.STORAGE.FALLBACK_LANG];
    if (!fallback) {
        logError(FILE_NAME, `Fallback lang "${CONFIG.STORAGE.FALLBACK_LANG}" is also missing from this version file.`);
        throw new Error(`No usable language data found (tried "${userLang}" and "${CONFIG.STORAGE.FALLBACK_LANG}").`);
    }
    return fallback;
}
