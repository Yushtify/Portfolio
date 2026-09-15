export const CONFIG = {
  PATHS: {
    VERSIONS_BASE: "/versions",
  },
  CRAWLER: {
    // First-ever version is v0-0-1 (there is no v0-0-0), every following
    // minor/major bump restarts the patch series from 0.
    GENESIS_MAJOR: 0,
    GENESIS_MINOR: 0,
    GENESIS_PATCH: 1,
    RESET_PATCH: 0,
  },
  STORAGE: {
    LANG_KEY: "user_lang",
    FALLBACK_LANG: "en",
  },
  SELECTORS: {
    CHANGELOG_CONTAINER: "#changelogContainer",
    VERSION_GROUP_TEMPLATE: "#versionGroup_Template",
    VERSION_COMMIT_TEMPLATE: "#versionCommitTemplate",
    COMMIT_BAR_TEMPLATE: "#commitBarTemplate",
    COMMIT_CONTAINER: "#commitContainer",
    COMMITTED_CHANGES_CONTAINER: "#committedChangesContainer",
    VERSION_NUMBER: "#versionNumber",
    VERSION_DATE: "#versionDate",
    VERSION_SUMMARY: "#versionSummary",
    PROGRESS_CHIP_TEXT: "#progressChip p",
    TOTAL_COMMITS_CHIP_TEXT: "#totalCommits p",
    COMMIT_LINK: "#commitLink",
    COMMIT_ID: "#commitID",
    COMMIT_DATE: "#commitDate",
    COMMIT_SUMMARY: "#commitSummary",
    BAR_TITLE: "#title",
    BAR_DESC: "#desc",
    TOGGLE_BUTTON: "#toggleVersionGroup_Button",
    TOGGLE_ICON: "#MaterialSymbol",
  },
  IDS: {
    VERSION_GROUP_PREFIX: "versionGroup_V",
    VERSION_COMMIT_PREFIX: "versionCommit_",
    COMMIT_BAR_PREFIX: "commitBar_",
  },
  LINKS: {
    GITHUB_COMMIT_BASE: "https://github.com/Yushtify/Portfolio/commit/",
    GITHUB_RELEASE_BASE: "https://github.com/Yushtify/Portfolio/releases/tag/v",
  },
  TEXT: {
    DATE_PREFIX: "- ",
    COMMITS_SUFFIX: " Commits",
  },
  COMMIT_TYPES: {
    added: {
      labelKey: "updates.commitBar.added",
      fallbackLabel: "Added",
      bgClass: "bg-green-400",
      borderClass: "border-green-400",
    },
    changed: {
      labelKey: "updates.commitBar.changed",
      fallbackLabel: "Changed",
      bgClass: "bg-orange-400",
      borderClass: "border-orange-400",
    },
    fixed: {
      labelKey: "updates.commitBar.fixed",
      fallbackLabel: "Fixed",
      bgClass: "bg-blue-400",
      borderClass: "border-blue-400",
    },
    removed: {
      labelKey: "updates.commitBar.removed",
      fallbackLabel: "Removed",
      bgClass: "bg-red-400",
      borderClass: "border-red-400",
    },
  },
  DEFAULT_BAR_CLASSES: {
    bgClass: "bg-green-400",
    borderClass: "border-green-400",
  },
  HERO: {
    // These keys must match the data-i18n keys already present in hero.astro.
    TOTAL_UPDATES_I18N_KEY: "updates.hero.infoContainer.totalUpdates",
    TOTAL_COMMITS_I18N_KEY: "updates.hero.infoContainer.totalCommits",
  },
  TOGGLE: {
    VISIBLE_CLASS: "flex",
    HIDDEN_CLASS: "hidden",
  },
  ANIMATIONS: {
    spinDown: {
      name: "spinDown",
      duration: "250ms",
      easing: "ease-in-out",
    },
    spinUp: {
      name: "spinUp",
      duration: "250ms",
      easing: "ease-in-out",
    },
  },
  EVENTS: {
    PAGE_LOAD: "DOMContentLoaded",
  },
} as const;

export type CommitType = keyof typeof CONFIG.COMMIT_TYPES;
export type SpinDirection = keyof typeof CONFIG.ANIMATIONS;
