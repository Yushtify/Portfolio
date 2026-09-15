import { CONFIG } from "./changelogConfig";
import { logDebug, logWarn, logError } from "./changelogLogger";
import type { CrawledVersion, VersionFileData, VersionNumber } from "./changelogTypes";

const FILE_NAME = "changelogCrawler.ts";

function buildVersionPath(version: VersionNumber): string {
    return `${CONFIG.PATHS.VERSIONS_BASE}/v${version.major}-${version.minor}-${version.patch}.json`;
}

async function fetchVersionFile(version: VersionNumber): Promise<VersionFileData | null> {
    const path = buildVersionPath(version);
    try {
        const response = await fetch(path);
        if (response.status === 404) {
            logDebug(FILE_NAME, `No file at ${path}, treating as end of this patch series.`);
            return null;
        }
        if (!response.ok) {
            logError(FILE_NAME, `Unexpected status ${response.status} while fetching ${path}.`);
            return null;
        }
        const raw = (await response.json()) as VersionFileData[];
        if (!raw[0]) {
            logError(FILE_NAME, `File ${path} returned an empty array, skipping.`);
            return null;
        }
        return raw[0];
    } catch (error) {
        logError(FILE_NAME, `Failed to fetch or parse ${path}.`, error);
        return null;
    }
}

// Probes patch = patchStart, patchStart + 1, ... with no upper cap, stopping
// on the first 404. Every found version is pushed into `results`.
// Returns true if at least one patch was found in this minor series.
async function crawlMinorSeries(
    major: number,
    minor: number,
    patchStart: number,
    results: CrawledVersion[],
): Promise<boolean> {
    let patch = patchStart;
    let foundAny = false;
    while (true) {
        const version: VersionNumber = { major, minor, patch };
        const data = await fetchVersionFile(version);
        if (!data) {
            break;
        }
        results.push({ version, data });
        logDebug(FILE_NAME, `Crawled version v${major}-${minor}-${patch}.`);
        foundAny = true;
        patch += 1;
    }
    return foundAny;
}

// Top-level state machine:
// - Patch series found something  -> bump minor, restart patch at RESET_PATCH.
// - Patch series found nothing and we did NOT just bump major -> bump major,
//   reset minor/patch, try again (this covers a minor that never existed).
// - Patch series found nothing right after a major bump -> nothing left to
//   find at all, stop crawling.
export async function crawlChangelog(): Promise<CrawledVersion[]> {
    const results: CrawledVersion[] = [];
    let major = CONFIG.CRAWLER.GENESIS_MAJOR;
    let minor = CONFIG.CRAWLER.GENESIS_MINOR;
    let patchStart = CONFIG.CRAWLER.GENESIS_PATCH;
    let justBumpedMajor = false;
    while (true) {
        const foundAny = await crawlMinorSeries(major, minor, patchStart, results);
        if (foundAny) {
            minor += 1;
            patchStart = CONFIG.CRAWLER.RESET_PATCH;
            justBumpedMajor = false;
            continue;
        }
        if (justBumpedMajor) {
            logDebug(FILE_NAME, `Crawl finished, nothing found after bumping to major v${major}.`);
            break;
        }
        logWarn(FILE_NAME, `Minor series v${major}-${minor}-${patchStart} was empty, bumping major version.`);
        major += 1;
        minor = CONFIG.CRAWLER.GENESIS_MINOR;
        patchStart = CONFIG.CRAWLER.RESET_PATCH;
        justBumpedMajor = true;
    }
    logDebug(FILE_NAME, `Crawl complete, found ${results.length} version file(s).`);
    return results;
}
