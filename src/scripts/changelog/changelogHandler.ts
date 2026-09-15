import { CONFIG } from "./changelogConfig";
import { crawlChangelog } from "./changelogCrawler";
import { renderChangelog, renderHeroTotals } from "./changelogRenderer";
import { logDebug, logError } from "./changelogLogger";
import "./changelogToggle";

const FILE_NAME = "changelogHandler.ts";

async function initChangelog(): Promise<void> {
  logDebug(FILE_NAME, "Starting changelog crawl.");
  try {
    const entries = await crawlChangelog();
    if (entries.length === 0) {
      logError(FILE_NAME, "No versions were found during crawl.");
      return;
    }
    renderChangelog(entries);
    renderHeroTotals(entries);
  } catch (error) {
    logError(FILE_NAME, "Failed to initialize changelog.", error);
  }
}

document.addEventListener(CONFIG.EVENTS.PAGE_LOAD, () => {
  initChangelog();
});
