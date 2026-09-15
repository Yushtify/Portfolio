export interface CommitContent {
    added: string[];
    fixed: string[];
    changed: string[];
    removed: string[];
}

export interface CommitEntry {
    commitID: string;
    date: string;
    summary: string;
    content: CommitContent;
}

export interface VersionLangData {
    progress: string;
    version: string;
    versionSummary: string;
    date: string;
    commits: CommitEntry[];
}

export type VersionFileData = Record<string, VersionLangData>;

export interface VersionNumber {
    major: number;
    minor: number;
    patch: number;
}

export interface CrawledVersion {
    version: VersionNumber;
    data: VersionFileData;
}
