import { CONFIG } from "./changelogConfig";
import type { CommitType } from "./changelogConfig";
import { logDebug, logWarn, logError } from "./changelogLogger";
import { resolveVersionLang } from "./changelogLangResolver";
import type { CommitEntry, CrawledVersion } from "./changelogTypes";

const FILE_NAME = "changelogRenderer.ts";

function getTemplateContent(selector: string): DocumentFragment | null {
  const template = document.querySelector<HTMLTemplateElement>(selector);
  if (!template) {
    logError(FILE_NAME, `Template not found for selector ${selector}.`);
    return null;
  }
  return template.content.cloneNode(true) as DocumentFragment;
}

function setText(root: ParentNode, selector: string, text: string): void {
  const element = root.querySelector(selector);
  if (!element) {
    logWarn(FILE_NAME, `Element ${selector} not found while setting text.`);
    return;
  }
  element.textContent = text;
}

function renderCommitBar(
  type: CommitType,
  entry: string,
  index: number,
): HTMLElement | null {
  const fragment = getTemplateContent(CONFIG.SELECTORS.COMMIT_BAR_TEMPLATE);
  if (!fragment) {
    return null;
  }
  const barRoot = fragment.firstElementChild as HTMLElement;
  const typeConfig = CONFIG.COMMIT_TYPES[type] ?? null;
  barRoot.id = `${CONFIG.IDS.COMMIT_BAR_PREFIX}${type}_${index}`;
  const titleWrapper = barRoot.querySelector<HTMLElement>(
    CONFIG.SELECTORS.BAR_TITLE,
  );
  const titleTextElement = titleWrapper?.querySelector("p") ?? null;
  if (titleTextElement && typeConfig) {
    titleTextElement.textContent = typeConfig.fallbackLabel;
    titleWrapper?.classList.remove(CONFIG.DEFAULT_BAR_CLASSES.bgClass);
    titleWrapper?.classList.add(typeConfig.bgClass);
  }
  const descElement = barRoot.querySelector<HTMLElement>(
    CONFIG.SELECTORS.BAR_DESC,
  );
  if (descElement && typeConfig) {
    descElement.classList.remove(CONFIG.DEFAULT_BAR_CLASSES.borderClass);
    descElement.classList.add(typeConfig.borderClass);
    descElement.textContent = entry;
  }
  return barRoot;
}

function renderCommit(commit: CommitEntry): HTMLElement | null {
  const fragment = getTemplateContent(CONFIG.SELECTORS.VERSION_COMMIT_TEMPLATE);
  if (!fragment) {
    return null;
  }
  const commitRoot = fragment.firstElementChild as HTMLElement;
  commitRoot.id = `${CONFIG.IDS.VERSION_COMMIT_PREFIX}${commit.commitID}`;
  const commitLink = commitRoot.querySelector<HTMLAnchorElement>(
    CONFIG.SELECTORS.COMMIT_ID,
  );
  if (commitLink) {
    commitLink.textContent = commit.commitID;
    commitLink.href = `${CONFIG.LINKS.GITHUB_COMMIT_BASE}${commit.commitID}`;
  }
  setText(
    commitRoot,
    CONFIG.SELECTORS.COMMIT_DATE,
    `${CONFIG.TEXT.DATE_PREFIX}${commit.date}`,
  );
  setText(commitRoot, CONFIG.SELECTORS.COMMIT_SUMMARY, commit.summary);
  const changesContainer = commitRoot.querySelector(
    CONFIG.SELECTORS.COMMITTED_CHANGES_CONTAINER,
  );
  if (changesContainer) {
    (Object.keys(commit.content) as CommitType[]).forEach((type) => {
      commit.content[type].forEach((entry, index) => {
        const bar = renderCommitBar(type, entry, index);
        if (bar) {
          changesContainer.appendChild(bar);
        }
      });
    });
  }
  return commitRoot;
}

function renderVersionGroup(entry: CrawledVersion): HTMLElement | null {
  const fragment = getTemplateContent(CONFIG.SELECTORS.VERSION_GROUP_TEMPLATE);
  if (!fragment) {
    return null;
  }
  const groupRoot = fragment.firstElementChild as HTMLElement;
  const { major, minor, patch } = entry.version;
  const langData = resolveVersionLang(entry.data);
  groupRoot.id = `${CONFIG.IDS.VERSION_GROUP_PREFIX}${major}-${minor}-${patch}`;
  setText(groupRoot, CONFIG.SELECTORS.VERSION_NUMBER, langData.version);
  setText(
    groupRoot,
    CONFIG.SELECTORS.VERSION_DATE,
    `${CONFIG.TEXT.DATE_PREFIX}${langData.date}`,
  );
  setText(groupRoot, CONFIG.SELECTORS.VERSION_SUMMARY, langData.versionSummary);
  // Progress text is dynamic per version (In Progress / Released / ...),
  // so the static data-i18n key from the template is dropped here to stop
  // the language handler from overwriting it on a later translation pass.
  const progressElement = groupRoot.querySelector<HTMLElement>(
    CONFIG.SELECTORS.PROGRESS_CHIP_TEXT,
  );
  if (progressElement) {
    progressElement.textContent = langData.progress;
    progressElement.removeAttribute("data-i18n");
  } else {
    logWarn(
      FILE_NAME,
      `Progress chip text element not found for v${major}-${minor}-${patch}.`,
    );
  }
  setText(
    groupRoot,
    CONFIG.SELECTORS.TOTAL_COMMITS_CHIP_TEXT,
    `${langData.commits.length}${CONFIG.TEXT.COMMITS_SUFFIX}`,
  );
  const commitLink = groupRoot.querySelector<HTMLAnchorElement>(
    CONFIG.SELECTORS.COMMIT_LINK,
  );
  if (commitLink) {
    commitLink.href = `${CONFIG.LINKS.GITHUB_RELEASE_BASE}${major}.${minor}.${patch}`;
  }
  const toggleButton = groupRoot.querySelector<HTMLElement>(
    CONFIG.SELECTORS.TOGGLE_BUTTON,
  );
  if (toggleButton) {
    toggleButton.setAttribute(
      "onclick",
      `toggleVersionGroup('${groupRoot.id}')`,
    );
  } else {
    logWarn(
      FILE_NAME,
      `Toggle button not found for v${major}-${minor}-${patch}.`,
    );
  }
  const commitContainer = groupRoot.querySelector(
    CONFIG.SELECTORS.COMMIT_CONTAINER,
  );
  if (commitContainer) {
    langData.commits.forEach((commit) => {
      const commitNode = renderCommit(commit);
      if (commitNode) {
        commitContainer.appendChild(commitNode);
      }
    });
  }
  return groupRoot;
}

function updateInfoChipDesc(titleI18nKey: string, value: string): void {
  // infoChip.astro renders title and desc as two sibling <p> tags inside
  // the same wrapper div: <p data-i18n={titleKey}>...</p><p data-i18n={descKey}>...</p>
  // The desc <p> always carries a data-i18n attribute too (even if empty),
  // so it is targeted via nextElementSibling rather than by attribute absence.
  const titleElement = document.querySelector<HTMLElement>(
    `[data-i18n="${titleI18nKey}"]`,
  );
  if (!titleElement) {
    logWarn(
      FILE_NAME,
      `Hero info chip title with key ${titleI18nKey} not found, skipping total update.`,
    );
    return;
  }
  const descElement = titleElement.nextElementSibling as HTMLElement | null;
  if (!descElement) {
    logWarn(
      FILE_NAME,
      `Could not locate desc element for ${titleI18nKey}, InfoChip markup may differ.`,
    );
    return;
  }
  descElement.textContent = value;
  descElement.removeAttribute("data-i18n");
}

export function renderChangelog(entries: CrawledVersion[]): void {
  const container = document.querySelector(
    CONFIG.SELECTORS.CHANGELOG_CONTAINER,
  );
  if (!container) {
    logError(
      FILE_NAME,
      `Changelog container ${CONFIG.SELECTORS.CHANGELOG_CONTAINER} not found.`,
    );
    return;
  }
  const sorted = [...entries].sort((a, b) => {
    if (a.version.major !== b.version.major)
      return b.version.major - a.version.major;
    if (a.version.minor !== b.version.minor)
      return b.version.minor - a.version.minor;
    return b.version.patch - a.version.patch;
  });
  sorted.forEach((entry) => {
    const groupNode = renderVersionGroup(entry);
    if (groupNode) {
      container.appendChild(groupNode);
    }
  });
  logDebug(FILE_NAME, `Rendered ${sorted.length} version group(s).`);
}

export function getTotals(entries: CrawledVersion[]): {
  totalUpdates: number;
  totalCommits: number;
} {
  const totalUpdates = entries.length;
  const totalCommits = entries.reduce((sum, entry) => {
    const langData = resolveVersionLang(entry.data);
    return sum + langData.commits.length;
  }, 0);
  return { totalUpdates, totalCommits };
}

export function renderHeroTotals(entries: CrawledVersion[]): void {
  const totals = getTotals(entries);
  updateInfoChipDesc(
    CONFIG.HERO.TOTAL_UPDATES_I18N_KEY,
    `${totals.totalUpdates}`,
  );
  updateInfoChipDesc(
    CONFIG.HERO.TOTAL_COMMITS_I18N_KEY,
    `${totals.totalCommits}`,
  );
}
